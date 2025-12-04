import mongoose from "mongoose";

import article_schema from "@/models/article-model"

import { type F_Article, type B_NewArticle } from "@types/article-types"
import { StatusCode } from "@/types/http-response-types"

export default class Article {
  static async get_from_mouvement(mouvement_id: string): Promise<F_Article[]> {
    const articles = await article_schema.find({ mouvement_id });

    return articles
  }

  static async get(_id: string): Promise<F_Article> {
    const article = await article_schema.findOne({
      _id: new mongoose.Types.ObjectId(_id)
    });

    return article
  }

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

  static async update(a: F_Article): Promise<StatusCode> {
    const { _id, title, description, image, mouvement_id } = a;

    const update_article = await article_schema.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(_id) },
      {
        title, 
        description,
        image,
        mouvement_id
      },
      {
        includeResultMetadata: true
      }
    );

    if ( update_article.ok && update_article.value !== null ) return StatusCode.Success

    return StatusCode.NotFound
  }

  static async delete(_id: string): Promise<StatusCode> {
    const delete_article = await article_schema.deleteOne({ _id: new mongoose.Types.ObjectId(_id) });

    if ( delete_article.deletedCount === 1 ) return StatusCode.Success;

    return StatusCode.NotFound;
  }
}
