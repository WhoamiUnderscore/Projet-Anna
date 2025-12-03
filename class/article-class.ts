import mongoose from "mongoose";

import article_schema from "@/models/article-model"

import { type F_Article, type B_NewArticle } from "@types/article-types"
import { StatusCode } from "@/types/http-response-types"

export default class Article {
  static async new(a: B_NewArticle): Promise<StatusCode> {
    const { title, image, description, mouvement_id } = a;

    const is_article_exist = await Article.exist(title);

    if ( is_article_exist ) {
      return StatusCode.Conflic;
    }

    const new_article = await article_schema.create({
      title,
      description,
      image,
      mouvement_id
    });

    if ( new_article.__v !== null || new_article.__v !== undefined ) {
      return StatusCode.Success
    }

    return StatusCode.ConflicWithServer
  }

  static async exist(title: string): Promise<boolean> {
    const is_article_exist = await article_schema.findOne({ title });

    if ( is_article_exist ) {
      return true
    }

    return false
  }
}
