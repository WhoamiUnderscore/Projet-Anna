// @ts-nocheck
import mongoose from "mongoose";

import { B_HttpResponseData, StatusCode } from "@/types/http-response-types";
import { NextResponse } from "next/server";

export default function httpResponse(status: StatusCode, data?: B_HttpResponseData | null, message_props?: string) {
  let id = new  mongoose.Types.ObjectId().toString();
  let message = "";

  switch ( status ) {
    case StatusCode.Success :
      message = "Votre requete a ete realiser avec succes."
      break

    case StatusCode.Redirection: 
      message = "Vous allez etre rediriger avec une autre page."
      break

    case StatusCode.NotFound :
      message = "Nous n'avons pas trouver de donnees valide a votre requete."
      break

    case StatusCode.Unauthorized: 
      message = "Vous n'etes pas authoriser a realiser cette action."
      break

    case StatusCode.ConflicWithServer: 
      message = "Il y a eu une erreur coter serveur, si cela ce realiser trop souvent, veuillez me contactez."
      break

    case StatusCode.Conflic: 
      message = "Il y a eu une erreur coter base de donnee, veuillez verifier que les element uniques le soient bien. Si cela se reproduit trop, veuillez me contacter."
      break

    case StatusCode.InternalError:
      message = "Il y a un erreur interne au serveur, veuillez me contactez pour la raisoudre au plus vite."
      break

    default:
      break
  }

  if ( message_props ) {
    message = message_props
  }

  return NextResponse.json(
    {
      id,
      data,
      status, 
      message
    },
    {
      status
    }
  )
}
