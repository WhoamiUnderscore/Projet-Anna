// @ts-nocheck
import Github from "@/class/github-class";
import Image from "@/class/image-class"
import Artiste from "@/class/artiste-class"

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import formToObject from "@/utils/form-to-object";
import toBase64 from "@/utils/to-base64"
import isAnImage from "@/utils/is-image"

import { type F_NewArtiste, type B_Artiste } from "@/types/artiste-types"
import { StatusCode } from "@/types/http-response-types"
import { type FileType } from "@/types/file-types"

export async function GET(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( id ) {
    let artiste = await Artiste.get(id);
    return httpResponse(StatusCode.Success, artiste);
  }

  const artistes = await Artiste.get_all();
  return httpResponse(StatusCode.Success, artistes)
}

export async function POST(req: Request) {
  await connection();
  
  let form_data = await req.formData();
  let artiste = formToObject<F_NewArtiste>(form_data)

  if ( !isAnImage(artiste.image) || typeof artiste.image === "string" ){
    return httpResponse(
      StatusCode.Unauthorized, 
      undefined, 
      "Veuillez mettre une image approprier afin de cree un artiste"
    );
  }

  const image: FileType = {
    path: "/public/images/" + artiste.image.name,
    content: await toBase64(artiste.image)
  };
  artiste.image = "/images/" + artiste.image.name;

  const image_exist = await Image.exist(artiste.image);

  if ( !image_exist ) {
     const new_image = await Image.new({ path: artiste.image, id_used: [] })

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

  const new_artiste = await Artiste.new(artiste);

  if ( new_artiste.status !== StatusCode.Success ){ 
    return httpResponse(
      new_artiste.status, 
      undefined, 
      new_artiste.message
    )
  }

  const image_db = await Image.get(artiste.image);

  if ( !image_db ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est survenu, lors de l'assignement de votre image a votre artiste, veuillez reessayer"
    )
  }

  image_db.id_used.push(new_artiste._id)

  const update_image = await Image.update(image_db)

  return httpResponse(new_artiste.status);
}

export async function PATCH(req: Request) {
  await connection();

  let form_data = await req.formData();
  let update_artiste = formToObject<B_Artiste>(form_data);

  if ( !isAnImage(update_artiste.image) ) {
    return httpResponse(
      StatusCode.Unauthorized, 
      undefined, 
      "Veuillez mettre une image approprier afin de cree un artiste"
    );
  }

  let artiste = await Artiste.get(update_artiste._id);

  if ( !artiste ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est survenu lors de la recuperation de votre artiste dans le but de le modifier, veuillez reessayer"
    );
  }
  
  if ( typeof update_artiste.image !== "string" && `/images/${update_artiste.image.name}` !== artiste.image ) {
    const github_manager = new Github();

    const image: FileType = {
      path: "public/images/" + update_artiste.image.name,
      content: await toBase64(update_artiste.image)
    };
    update_artiste.image = "/images/" + update_artiste.image.name;

    const delete_if_needed = await Image.delete_if_needed(artiste.image, artiste._id.toString());

    if ( delete_if_needed ) {
      let image_name = artiste.image.split("/")[2];
      await github_manager.delete_github_file(image_name)
    }

    const image_exist = await Image.exist(update_artiste.image);

    if ( !image_exist) {
      const new_image = await Image.new({ path: update_artiste.image, id_used: [artiste.id.toString()] })

      if ( new_image !== StatusCode.Success ) {
        return httpResponse(
          new_image, 
          undefined, 
          "Il y a eu une erreur lors de l'enregistrement de votre image, veuillez reessayer."
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
    typeof update_artiste.image !== "string" && 
    `/images/${update_artiste.image.name}` === artiste.image 
  ) {
    update_artiste.image = artiste.image
  }
  
  const updating_artiste = await Artiste.update(update_artiste);
  return httpResponse(updating_artiste.status, undefined, updating_artiste.message);
}

export async function DELETE(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( !id ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  let artiste = await Artiste.get(id);

  if ( !artiste ) {
    return httpResponse(
      StatusCode.NotFound, 
      undefined, 
      "Une erreur est arriver lors de la determination de l'artiste a supprimer, veuillez reessayer."
    );
  }

  const delete_if_needed = await Image.delete_if_needed(artiste.image, artiste._id.toString());

  if ( delete_if_needed ) {
    let image_name = artiste.image.split("/")[2];

    const github_manager = new Github();
    const delete_file = await github_manager.delete_github_file(image_name)
  }
  const delete_artiste = await Artiste.delete(id);

  return httpResponse(delete_artiste.status, undefined, delete_artiste.message);
}
