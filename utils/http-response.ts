import mongoose from "mongoose";

import { B_HttpResponseData, StatusCode } from "@/types/http-response-types";
import { NextResponse } from "next/server";

export default function httpResponse(status: StatusCode, data?: B_HttpResponseData | null, message_props?: string) {
  let id = new  mongoose.Types.ObjectId().toString();
  let message = "";

  switch ( status ) {
    case StatusCode.Success :
      message = "Votre requête a été réalisée avec succès."
      break

    case StatusCode.Redirection: 
      message = "Vous allez être redirigé vers une autre page."
      break

    case StatusCode.NotFound :
      message = "Nous n'avons pas trouvé de données valides à votre requête."
      break

    case StatusCode.Unauthorized: 
      message = "Vous n'êtes pas autorisé à réaliser cette action."
      break

    case StatusCode.ConflicWithServer: 
      message = "Il y a eu une erreur côté serveur, si cela se réalise trop souvent, veuillez me contacter."
      break

    case StatusCode.Conflic: 
      message = "Il y a eu une erreur côté base de données, veuillez vérifier que les éléments uniques le soient bien. Si cela se reproduit trop, veuillez me contacter."
      break

    case StatusCode.InternalError:
      message = "Il y a une erreur interne au serveur, veuillez me contacter pour la résoudre au plus vite."
      break

    default:
      break
  }

  if ( message_props && message_props !== "" ) {
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
