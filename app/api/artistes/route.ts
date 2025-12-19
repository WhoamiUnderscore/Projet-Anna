// @ts-nocheck
import Github from "@/class/github-class";
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
    return httpResponse(StatusCode.Unauthorized);
  }

  const image: FileType = {
    path: "/public/images/" + artiste.image.name,
    content: await toBase64(artiste.image)
  };
  artiste.image = "/images/" + artiste.image.name;

  const github_manager = new Github();
  const pushed_pass = await github_manager.push_gihtub_files([image]);

  if ( pushed_pass ) {
    const new_artiste = await Artiste.new(artiste);
    return httpResponse(new_artiste);
  }

  return httpResponse(StatusCode.InternalError);
}

export async function PATCH(req: Request) {
  await connection();

  let form_data = await req.formData();
  let update_artiste = formToObject<B_Artiste>(form_data);

  if ( !isAnImage(update_artiste.image) ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  let artiste = await Artiste.get(update_artiste._id);

  if ( !artiste ) {
    return httpResponse(StatusCode.NotFound);
  }
  
  if ( typeof update_artiste.image !== "string" && `/images/${update_artiste.image.name}` !== artiste.image ) {
    const image: FileType = {
      path: "public/images/" + update_artiste.image.name,
      content: await toBase64(update_artiste.image)
    };
    update_artiste.image = "/images/" + update_artiste.image.name;

    let image_name = artiste.image.split("/")[2];

    const github_manager = new Github();
    const delete_file = await github_manager.delete_github_file(image_name)

    const pushed_pass = await github_manager.push_gihtub_files([image]);

    if ( !pushed_pass ) {
      console.log("GITHUB ERROR: Error pushing file")
      return httpResponse(StatusCode.InternalError);
    }
  } else if ( 
    typeof update_artiste.image !== "string" && 
    `/images/${update_artiste.image.name}` === artiste.image 
  ) {
    update_artiste.image = artiste.image
  }
  
  const updating_artiste = await Artiste.update(update_artiste);
  return httpResponse(updating_artiste);
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
    return httpResponse(StatusCode.NotFound);
  }

  let image_name = artiste.image.split("/")[2];

  const github_manager = new Github();
  const delete_file = await github_manager.delete_github_file(image_name)

  const delete_artiste = await Artiste.delete(id);

  return httpResponse(delete_artiste);
}
