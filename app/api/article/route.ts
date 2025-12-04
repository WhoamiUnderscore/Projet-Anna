import Article from "@/class/article-class";
import Github from "@/class/github-class";

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import formToObject from "@/utils/form-to-object";
import toBase64 from "@/utils/to-base64"

import { StatusCode } from "@/types/http-response-types"
import { type F_Article, type B_NewArticle } from "@/types/article-types";
import { type FileType } from "@/types/file-types"

export async function GET(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;
  const mouvement_id = searchParams.get("mouvement") || undefined;

  let article;

  if ( id ) {
    article = await Article.get(id);
  } else if ( mouvement_id ) {
    article = await Article.get_from_mouvement(mouvement_id);
  } else {
    return httpResponse(StatusCode.Unauthorized);
  }

  return httpResponse(StatusCode.Success, article);
}

export async function POST(req: Request) {
  await connection();

  let form_data = await req.formData();
  let article = formToObject<B_NewArticle>(form_data);

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
  let article = formToObject<F_Article>(form_data);

  if ( typeof article.image !== "string" ) {
    const image: FileType = {
      path: "public/images/" + article.image.name,
      content: await toBase64(article.image)
    };
    article.image = "/images/" + article.image.name;


    const github_manager = new Github();
    const pushed_pass = await github_manager.push_gihtub_files([image]);

    if ( !pushed_pass ) {
      return httpResponse(StatusCode.InternalError);
    }
  }

  const update_article = await Article.update(article);
  return httpResponse(update_article);
}

export async function DELETE(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( !id ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  const delete_article = await Article.delete(id);

  return httpResponse(delete_article);


}
