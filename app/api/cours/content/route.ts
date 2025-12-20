// @ts-nocheck
import mongoose from "mongoose"

import Cour from "@/class/cour-class";
import Image from "@/class/image-class"
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
    return httpResponse(
      StatusCode.NotFound,
      undefined, 
      "Une erreur est survenu lors de la recuperation de votre cour dans le but de le modifier, veuillez reessayer"
    );
  }

  let form_data = await req.formData();
  
  let content = form_data.get("content");
  
  if ( !content || typeof content !== "string" ) {
    return httpResponse(
      StatusCode.Unauthorized,
      undefined,
      "Une erreur est arriver, lors de la recuperation du contenu de votre cour, veuillez reessayer."
    )
  }

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

      const image_exist = await Image.exist(`/images/${img.name}`)

      if ( !image_exist ) {
        const new_image = await Image.new({ path: `/images/${img.name}`, id_used: [cour.id.toString()] });

        if ( new_image !== StatusCode.Success ) {
          return httpResponse(
            new_image, 
            undefined, 
            "Il y a eu une erreur lors de l'enregistrement de votre image, veuillez reessayer."
          )
        }
      } else {
        const image_db = await Image.get(`/images/${img.name}`);

        if ( !image_db ) {
          return httpResponse(
            StatusCode.NotFound, 
            undefined, 
            "Une erreur est survenu, lors de l'assignement de votre image a votre cour, veuillez reessayer"
          )
        }

        if ( !image_db.id_used.includes(cour._id.toString()) ) {
          image_db.id_used.push(cour._id.toString())
        };

        const update_image = await Image.update(image_db)
      }
    }
  }

  if ( images.length > 0 ) {
    const github_manager = new Github();
    const pushed_pass = await github_manager.push_gihtub_files([...images]);

    if ( !pushed_pass ) {
      console.error("ERROR GITHUB: Error pushing file")
      return httpResponse(
        StatusCode.InternalError, 
        undefined, 
        "Il y a eu une erreur lors de la sauvegarde de votre image, veuillez reessayer."
      );
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

  return httpResponse(
    StatusCode.InternalError, 
    undefined, 
    "Une erreur est survenu lors de la modification de votre cour, veuillez reessayer."
  )
}
