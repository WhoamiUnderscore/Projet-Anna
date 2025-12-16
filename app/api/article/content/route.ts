import mongoose from "mongoose"

import Article from "@/class/article-class";
import Github from "@/class/github-class";

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import toBase64 from "@/utils/to-base64"
import isAnImage from "@/utils/is-image"
import article_schema from "@/models/article-model"

import { StatusCode } from "@/types/http-response-types"

export async function PATCH(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( !id ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  let article = await Article.get(id);

  if ( !article ) {
    return httpResponse(StatusCode.NotFound)
  }

  let form_data = await req.formData();
  
  let content = form_data.get("content");
  let image_number = form_data.get("image_number")
  let images = []


  // ====
  // Push images to github
  // ===
  for(let i = 0; i < image_number; i++ ){
    const img = form_data.get(`image-${i}`);

    if ( img && isAnImage(img) ) {
      images.push({
        name: img.name,
        path: "/public/images/" + img.name,
        content: await toBase64(img)
      })
    }
  }

  if ( images.length > 0 ) {
    const github_manager = new Github();
    const pushed_pass = await github_manager.push_gihtub_files([...images]);

    if ( !pushed_pass ) {
      console.error("ERROR GITHUB: Error pushing file")
      return httpResponse(StatusCode.InternalError)
    }
  }


  // =====
  // Content Parsing
  // =====
  let index = 0;
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const content_parsed = content.replace(imageRegex, (match, alt, url, offset) => {
    if ( !url.includes("blob") ) return `![${alt}](${url})`;

    const newUrl = `/images/${images[index].name}`;
    index++

    return `![${alt}](${newUrl})`;
  })


  const { title, artiste, image, date, mouvement } = article;

  const update_article = await article_schema.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      title,
      artiste,
      image,
      date,
      mouvement,
      content: content_parsed
    },
    {
      includeResultMetadata: true
    }
  );

  if ( update_article.ok && update_article.value !== null ) return httpResponse(StatusCode.Success)

  return httpResponse(StatusCode.InternalError)
}
