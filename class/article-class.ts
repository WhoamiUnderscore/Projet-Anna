import mongoose from "mongoose";

import article_schema from "@/models/article-model"

import { type F_Article, type B_NewArticle } from "@types/article-types"
import { StatusCode } from "@/types/http-response-types"

export default class Article {
  static async get_from_mouvement(mouvement: string): Promise<F_Article[]> {
    const mouvement_name = mouvement.charAt(0).toUpperCase() + mouvement.slice(1);
    const articles = await article_schema.find({ mouvement: mouvement_name });

    return articles
  }

  static async get(_id: string): Promise<F_Article> {
    const article = await article_schema.findOne({
      _id: new mongoose.Types.ObjectId(_id)
    });

    return article
  }

  static async new(a: B_NewArticle): Promise<StatusCode> {
    const { title, image, artiste, date, mouvement, content } = a;

    const is_article_exist = await Article.exist(title);

    if ( is_article_exist ) {
      return StatusCode.Conflic;
    }

    const new_article = await article_schema.create({
      title,
      artiste,
      date,
      image,
      mouvement,
      content
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
    const { _id, title, artiste, date, image, mouvement, content} = a;

    const update_article = await article_schema.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(_id) },
      {
        title, 
        artiste,
        date,
        image,
        mouvement,
        content
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
