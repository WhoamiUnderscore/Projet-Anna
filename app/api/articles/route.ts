import Article from "@/class/article-class";
import Github from "@/class/github-class";

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import formToObject from "@/utils/form-to-object";
import toBase64 from "@/utils/to-base64"

import { type F_Article, type B_NewArticle } from "@/types/article-types";
import { type FileType } from "@/types/file-types"

export async function POST(req: Request) {
  await connection();

  let form_data = await req.formData();
  let article = formToObject<B_NewArticle>(form_data);

  const image: FileType = {
    path: "/images/" + article.image.name,
    content: await toBase64(article.image)
  };
  article.image = "/" + article.image.name;


  const github_manager = new Github();
  const pushed_pass = github_manager.push_gihtub_files([image]);

  console.log(pushed_pass);

  const new_article = await Article.new(article);

  return httpResponse(new_article);
}
