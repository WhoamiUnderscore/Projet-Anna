// @ts-nocheck
import Article from "@/class/article-class";
import Image from "@/class/image-class"
import Github from "@/class/github-class";

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import formToObject from "@/utils/form-to-object";
import toBase64 from "@/utils/to-base64"
import isAnImage from "@/utils/is-image"

import { StatusCode } from "@/types/http-response-types"
import { type B_Article, type B_NewArticle } from "@/types/article-types";
import { type FileType } from "@/types/file-types"

export async function GET(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;
  let mouvement = searchParams.get("mouvement") || undefined;

  if ( id ) {
    let article = await Article.get(id);
    return httpResponse(StatusCode.Success, article);
  } else if ( mouvement ) {
    mouvement = mouvement.split("%20").join(" ")
    let article = await Article.get_from_mouvement(mouvement);

    return httpResponse(StatusCode.Success, article);
  } 

  return httpResponse(StatusCode.Unauthorized);
}

export async function POST(req: Request) {
  await connection();

  let form_data = await req.formData();
  let article = formToObject<B_NewArticle>(form_data);

  if ( !isAnImage(article.image) || typeof article.image === "string" ) {
    return httpResponse(
      StatusCode.Unauthorized, 
      undefined, 
      "Veuillez mettre une image appropriée afin de créer un article"
    );
  }

  if ( !article.image ) return httpResponse(StatusCode.Unauthorized);

  const image: FileType = {
    path: "public/images/" + article.image.name,
    content: await toBase64(article.image)
  };
  article.image = "/images/" + article.image.name;

  const image_exist = await Image.exist(article.image);

  if ( !image_exist ) {
     const new_image = await Image.new({ path: article.image, id_used: [] })

    if ( new_image !== StatusCode.Success ) {
      return httpResponse(
        new_image, 
        undefined, 
        "Il y a eu une erreur lors de l'enregistrement de votre image, veuillez réessayer."
      )
    }

    const github_manager = new Github();
    const pushed_pass = await github_manager.push_gihtub_files([image]);

    if ( !pushed_pass ) {
      return httpResponse(
        StatusCode.InternalError, 
        undefined, 
        "Il y a eu une erreur lors de la sauvegarde de votre image, veuillez réessayer."
      );
    }
  }

  const new_article = await Article.new(article);

  if ( new_article.status !== StatusCode.Success ){ 
    return httpResponse(
      new_article.status, 
      undefined, 
      new_article.message
    )
  }

  const image_db = await Image.get(article.image);

  if ( !image_db ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est survenue lors de l'assignement de votre image à votre article, veuillez réessayer"
    )
  }

  image_db.id_used.push(new_article._id)

  const update_image = await Image.update(image_db)

  return httpResponse(new_article.status, undefined, new_article.message);
}



export async function PATCH(req: Request) {
  await connection();

  let form_data = await req.formData();
  let update_article = formToObject<B_Article>(form_data);

  if ( !isAnImage(update_article.image) ) {
    return httpResponse(
      StatusCode.Unauthorized, 
      undefined, 
      "Veuillez mettre une image appropriée afin de créer un article"
    );
  }

  let article = await Article.get(update_article._id);

  if ( !article ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est survenue lors de la récupération de votre article dans le but de le modifier, veuillez réessayer"
    )
  }

  
  if ( typeof update_article.image !== "string" && `/images/${update_article.image.name}` !== article.image ) {
    const github_manager = new Github();

    const image: FileType = {
      path: "public/images/" + update_article.image.name,
      content: await toBase64(update_article.image)
    };
    update_article.image = "/images/" + update_article.image.name;

    const delete_if_needed = await Image.delete_if_needed(article.image, article._id.toString());

    if ( delete_if_needed ) {
      let image_name = article.image.split("/")[2];
      await github_manager.delete_github_file(image_name)
    }

    const image_exist = await Image.exist(update_article.image);

    if ( !image_exist) {
      const new_image = await Image.new({ path: update_article.image, id_used: [article.id.toString()] })

      if ( new_image !== StatusCode.Success ) {
        return httpResponse(
          new_image, 
          undefined, 
          "Il y a eu une erreur lors de l'enregistrement de votre image, veuillez réessayer."
        )
      }

      const pushed_pass = await github_manager.push_gihtub_files([image]);

      if ( !pushed_pass ) {
        console.log("GITHUB ERROR: Error pushing file")
        return httpResponse(
          StatusCode.InternalError, 
          undefined, 
          "Il y a eu une erreur lors de la sauvegarde de votre image, veuillez réessayer."
        );
      }
    }
  } else if ( 
    typeof update_article.image !== "string" && 
    `/images/${update_article.image.name}` === article.image 
  ) {
    update_article.image = article.image
  }
  
  const updating_article = await Article.update(update_article);

  return httpResponse(updating_article.status, undefined, updating_article.message);
}

export async function DELETE(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( !id ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  let article = await Article.get(id);

  if ( !article ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est arrivée lors de la détermination de l'article à supprimer, veuillez réessayer."
    );
  }

  const delete_if_needed = await Image.delete_if_needed(article.image, article._id.toString());

  if ( delete_if_needed ) {
    let image_name = article.image.split("/")[2];

    const github_manager = new Github();
    const delete_file = await github_manager.delete_github_file(image_name)
  }

  const delete_article = await Article.delete(id);

  return httpResponse(delete_article.status, undefined, delete_article.message);
}
