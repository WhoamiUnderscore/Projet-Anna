import Chronologie from "@/class/chronologie-class";

import connection from "@/utils/connection";
import httpResponse from "@/utils/http-response";
import formToObject from "@/utils/form-to-object";

import { StatusCode } from "@/types/http-response-types";
import { type B_NewChronologie, type F_ChronologieElement } from "@/types/chronologie-types";

export async function GET(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || undefined;


  let chronologie_elements;

  if ( name ) {
    chronologie_elements = await Chronologie.get(name);
  } else {
    chronologie_elements = await Chronologie.get_all();
  }

  return httpResponse(StatusCode.Success, chronologie_elements);
}

export async function POST(req: Request) {
  await connection();

  let form_data = await req.formData();
  let chronologie = formToObject<B_NewChronologie>(form_data);

  const new_chronologie = await Chronologie.new(chronologie);
  
  return httpResponse(new_chronologie);
}

export async function PATCH(req: Request) {
  await connection();

  let form_data = await req.formData();
  let chronologie = formToObject<F_ChronologieElement>(form_data);

  let update_chronologie = await Chronologie.update(chronologie);

  return httpResponse(update_chronologie);
}

export async function DELETE(req: Request) {
  await connection();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if ( id ) {
    const delete_chronologie = await Chronologie.delete(id);

    return httpResponse(delete_chronologie);
  }

  return httpResponse(StatusCode.Unauthorized);
}
