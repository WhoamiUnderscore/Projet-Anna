import { type B_ArticleType } from "@/types/article-types"

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

export type B_HttpResponseData = B_ArticleType[]

