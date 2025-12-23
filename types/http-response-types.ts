import { type F_Article } from "@/types/article-types"
import { type F_Artiste } from "@/types/artiste-types"
import { type F_ChronologieElement } from "@/types/chronologie-types"
import { type F_Cour } from "@/types/cour-types"

export enum StatusCode {
  // 2--
  Success = 200,

  // 3--
  Redirection = 301,

  // 4--
  Unauthorized = 401,
  NotFound = 404,
  ConflicWithServer = 406,
  Conflic = 409,

  // 5--
  InternalError = 500
}

export type B_HttpResponseData = F_Article | F_Article[] | F_ChronologieElement | F_ChronologieElement[] | F_Cour | F_Cour[] | F_Artiste | F_Artiste[]
