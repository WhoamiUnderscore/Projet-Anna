import Article from "@/class/article-class";
import Github from "@/class/github-class";

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import formToObject from "@/utils/form-to-object";
import toBase64 from "@/utils/to-base64"
import isAnImage from "@/utils/is-image"

import { StatusCode } from "@/types/http-response-types"
import { type F_Article, type B_NewArticle } from "@/types/article-types";
import { type FileType } from "@/types/file-types"

export async function GET(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;
  const mouvement = searchParams.get("mouvement") || undefined;

  let article;

  if ( id ) {
    article = await Article.get(id);
  } else if ( mouvement ) {
    article = await Article.get_from_mouvement(mouvement);
  } else {
    return httpResponse(StatusCode.Unauthorized);
  }

  return httpResponse(StatusCode.Success, article);
}

export async function POST(req: Request) {
  await connection();

  let form_data = await req.formData();
  let article = formToObject<B_NewArticle>(form_data);

  console.log(form_data.get("image"))

  if ( !isAnImage(article.image) ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  if ( !article.image ) return httpResponse(StatusCode.Unauthorized);

  const image: FileType = {
    path: "public/images/" + article.image.name,
    content: await toBase64(article.image)
  };
  article.image = "/images/" + article.image.name;


  const github_manager = new Github();
  const pushed_pass = await github_manager.push_gihtub_files([image]);

  if ( pushed_pass ) {
    const new_article = await Article.new(article);
    return httpResponse(new_article);
  }

  return httpResponse(StatusCode.InternalError);
}

export async function PATCH(req: Request) {
  await connection();

  let form_data = await req.formData();
  let update_article = formToObject<F_Article>(form_data);

  if ( !isAnImage(update_article.image) ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  let article = await Article.get(update_article._id);

  if ( !article ) {
    return httpResponse(StatusCode.NotFound);
  }
  
  if ( typeof update_article.image !== "string" && `/images/${update_article.image.name}` !== article.image ) {
    const image: FileType = {
      path: "public/images/" + update_article.image.name,
      content: await toBase64(update_article.image)
    };
    update_article.image = "/images/" + update_article.image.name;

    let image_name = article.image.split("/")[2];

    const github_manager = new Github();
    const delete_file = await github_manager.delete_github_file(image_name)

    if ( !delete_file ) {
      console.log("GITHUB ERROR: Error deleting file")
      return httpResponse(StatusCode.InternalError);
    }

    const pushed_pass = await github_manager.push_gihtub_files([image]);

    if ( !pushed_pass ) {
      console.log("GITHUB ERROR: Error pushing file")
      return httpResponse(StatusCode.InternalError);
    }
  } else if ( `/images/${update_article.image.name}` === article.image ) {
    update_article.image = article.image
  }
  
  const updating_article = await Article.update(update_article);
  return httpResponse(updating_article);
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
    return httpResponse(StatusCode.NotFound);
  }

  let image_name = article.image.split("/")[2];

  const github_manager = new Github();
  const delete_file = await github_manager.delete_github_file(image_name)

  const delete_article = await Article.delete(id);

  return httpResponse(delete_article);


}
