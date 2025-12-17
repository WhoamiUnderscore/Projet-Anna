// @ts-nocheck
import mongoose from "mongoose"

import Cour from "@/class/cour-class";
import Github from "@/class/github-class";

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import toBase64 from "@/utils/to-base64"
import isAnImage from "@/utils/is-image"
import cour_schema from "@/models/cours-model"

import { StatusCode } from "@/types/http-response-types"

export async function PATCH(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( !id ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  let cour = await Cour.get(id);

  if ( !cour ) {
    return httpResponse(StatusCode.NotFound)
  }

  let form_data = await req.formData();
  
  let content = form_data.get("content");
  
  if ( !content || typeof content !== "string" ) return httpResponse(StatusCode.Unauthorized)

  let image_number = form_data.get("image_number")
  let images = []
  let images_name = []


  // ====
  // Push images to github
  // ===
  for(let i = 0; i < Number(image_number); i++ ){
    const entry = form_data.get(`image-${i}`);

    if ( !(entry instanceof File) ) continue

    const img: File = entry

    if ( img !== null && isAnImage(img) ) {
      images_name.push(img.name)

      images.push({
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

    const newUrl = `/images/${images_name[index]}`;
    index++

    return `![${alt}](${newUrl})`;
  })


  const { title, subject, image } = cour;

  const update_cour = await cour_schema.findOneAndUpdate(
    { _id: id },
    {
      title,
      subject,
      image,
      content: content_parsed
    },
    {
      includeResultMetadata: true
    }
  );

  if ( update_cour.ok && update_cour.value !== null ) return httpResponse(StatusCode.Success)

  return httpResponse(StatusCode.InternalError)
}
