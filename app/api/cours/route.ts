import Github from "@/class/github-class";
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
    return httpResponse(StatusCode.Unauthorized);
  }

  const image: FileType = {
    path: "/public/imagees/" + cour.image.name,
    content: await toBase64(cour.image)
  };
  cour.image = "/images/" + cour.image.name;

  const github_manager = new Github();
  const pushed_pass = await github_manager.push_gihtub_files([image]);

  if ( pushed_pass ) {
    const new_cour = await Cour.new(cour);
    return httpResponse(new_cour);
  }

  return httpResponse(StatusCode.InternalError);
}

export async function PATCH(req: Request) {
  await connection();

  let form_data = await req.formData();
  let update_cour = formToObject<B_Cour>(form_data);

  if ( !isAnImage(update_cour.image) ) {
    return httpResponse(StatusCode.Unauthorized);
  }

  let cour = await Cour.get(update_cour._id);

  if ( !cour ) {
    return httpResponse(StatusCode.NotFound);
  }
  
  if ( typeof update_cour.image !== "string" && `/images/${update_cour.image.name}` !== cour.image ) {
    const image: FileType = {
      path: "public/images/" + update_cour.image.name,
      content: await toBase64(update_cour.image)
    };
    update_cour.image = "/images/" + update_cour.image.name;

    let image_name = cour.image.split("/")[2];

    const github_manager = new Github();
    const delete_file = await github_manager.delete_github_file(image_name)

    const pushed_pass = await github_manager.push_gihtub_files([image]);

    if ( !pushed_pass ) {
      console.log("GITHUB ERROR: Error pushing file")
      return httpResponse(StatusCode.InternalError);
    }
  } else if ( 
    typeof update_cour.image !== "string" && 
    `/images/${update_cour.image.name}` === cour.image 
  ) {
    update_cour.image = cour.image
  }
  
  const updating_cour = await Cour.update(update_cour);
  return httpResponse(updating_cour);
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
    return httpResponse(StatusCode.NotFound);
  }

  let image_name = cour.image.split("/")[2];

  const github_manager = new Github();
  const delete_file = await github_manager.delete_github_file(image_name)

  const delete_cour = await Cour.delete(id);

  return httpResponse(delete_cour);
}
