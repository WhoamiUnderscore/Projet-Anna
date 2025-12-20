// @ts-nocheck
import Github from "@/class/github-class";
import Image from "@/class/image-class"
import Cour from "@/class/cour-class"

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import formToObject from "@/utils/form-to-object";
import toBase64 from "@/utils/to-base64"
import isAnImage from "@/utils/is-image"

import { type F_NewCour, type B_Cour } from "@/types/cour-types"
import { StatusCode } from "@/types/http-response-types"
import { type FileType } from "@/types/file-types"

export async function GET(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( id ) {
    let cour = await Cour.get(id);
    return httpResponse(StatusCode.Success, cour);
  }

  const cours = await Cour.get_all();
  return httpResponse(StatusCode.Success, cours)
}

export async function POST(req: Request) {
  await connection();
  
  let form_data = await req.formData();
  let cour = formToObject<F_NewCour>(form_data)

  if ( !isAnImage(cour.image) || typeof cour.image === "string" ){
    return httpResponse(
      StatusCode.Unauthorized, 
      undefined, 
      "Veuillez mettre une image approprier afin de cree un cour"
    );
  }

  const image: FileType = {
    path: "/public/images/" + cour.image.name,
    content: await toBase64(cour.image)
  };
  cour.image = "/images/" + cour.image.name;

  const image_exist = await Image.exist(cour.image);

  if ( !image_exist ) {
     const new_image = await Image.new({ path: cour.image, id_used: [] })

    if ( new_image !== StatusCode.Success ) {
      return httpResponse(
        new_image, 
        undefined, 
        "Il y a eu une erreur lors de l'enregistrement de votre image, veuillez reessayer."
      )
    }

    const github_manager = new Github();
    const pushed_pass = await github_manager.push_gihtub_files([image]);

    if ( !pushed_pass ) {
      return httpResponse(
        StatusCode.InternalError, 
        undefined, 
        "Il y a eu une erreur lors de la sauvegarde de votre image, veuillez reessayer."
      );
    }
  }

  const new_cour = await Cour.new(cour);

  if ( new_cour.status !== StatusCode.Success ){ 
    return httpResponse(
      new_cour.status, 
      undefined, 
      new_cour.message
    )
  }

  const image_db = await Image.get(cour.image);

  if ( !image_db ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est survenu, lors de l'assignement de votre image a votre cour, veuillez reessayer"
    )
  }

  image_db.id_used.push(new_cour._id)

  const update_image = await Image.update(image_db)

  return httpResponse(new_cour.status);
}

export async function PATCH(req: Request) {
  await connection();

  let form_data = await req.formData();
  let update_cour = formToObject<B_Cour>(form_data);

  if ( !isAnImage(update_cour.image) ) {
    return httpResponse(
      StatusCode.Unauthorized, 
      undefined, 
      "Veuillez mettre une image approprier afin de cree un cour"
    );
  }

  let cour = await Cour.get(update_cour._id);

  if ( !cour ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est survenu lors de la recuperation de votre cour dans le but de le modifier, veuillez reessayer"
    );
  }
  
  if ( typeof update_cour.image !== "string" && `/images/${update_cour.image.name}` !== cour.image ) {
    const github_manager = new Github();

    const image: FileType = {
      path: "public/images/" + update_cour.image.name,
      content: await toBase64(update_cour.image)
    };
    update_cour.image = "/images/" + update_cour.image.name;

    const delete_if_needed = await Image.delete_if_needed(cour.image, cour._id.toString());

    if ( delete_if_needed ) {
      let image_name = cour.image.split("/")[2];
      await github_manager.delete_github_file(image_name)
    }

    const image_exist = await Image.exist(update_cour.image);

    if ( !image_exist) {
      const new_image = await Image.new({ path: update_cour.image, id_used: [cour.id.toString()] })

      if ( new_image !== statuscode.success ) {
        return httpresponse(
          new_image, 
          undefined, 
          "il y a eu une erreur lors de l'enregistrement de votre image, veuillez reessayer."
        )
      }

      const pushed_pass = await github_manager.push_gihtub_files([image]);

      if ( !pushed_pass ) {
        console.log("GITHUB ERROR: Error pushing file") 
        return httpResponse(
          StatusCode.InternalError, 
          undefined, 
          "Il y a eu une erreur lors de la sauvegarde de votre image, veuillez reessayer."
        );
      }
    }
  } else if ( 
    typeof update_cour.image !== "string" && 
    `/images/${update_cour.image.name}` === cour.image 
  ) {
    update_cour.image = cour.image
  }
  
  const updating_cour = await Cour.update(update_cour);
  return httpResponse(updating_cour.status, undefined, updating_cour.message);
}

export async function DELETE(req: Request) {
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
      "Une erreur est arriver lors de la determination du cour a supprimer, veuillez reessayer."
    );
  }

  const delete_if_needed = await Image.delete_if_needed(cour.image, cour._id.toString());

  if ( delete_if_needed ) {
    let image_name = cour.image.split("/")[2];

    const github_manager = new Github();
    const delete_file = await github_manager.delete_github_file(image_name)
  }

  const delete_cour = await Cour.delete(id);

  return httpResponse(delete_cour.status, undefined, delete_cour.message);
}
