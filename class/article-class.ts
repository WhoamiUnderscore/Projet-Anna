import mongoose from "mongoose";

import article_schema from "@/models/article-model"

import { type F_Article, type B_NewArticle } from "@/types/article-types"
import { StatusCode } from "@/types/http-response-types"

export default class Article {
  // Get articles from mouvement name
  static async get_from_mouvement(mouvement: string): Promise<F_Article[]> {
    let mouvement_name: string[] = [];

    mouvement.split(" ").forEach(word => {
      mouvement_name.push(word.charAt(0).toUpperCase() + word.slice(1))
    }) 

    const articles = await article_schema.find({ mouvement: mouvement_name.join(" ") });

    return articles
  }

  // Get article from his _id
  static async get(_id: string): Promise<F_Article> {
    const article = await article_schema.findOne({
      _id: new mongoose.Types.ObjectId(_id)
    });

    return article
  }

  // Add a new article
  static async new(a: B_NewArticle): Promise<{status: StatusCode, _id: string, message: string}> {
    const { title, image, artiste, date, mouvement, content } = a;

    const is_article_exist = await Article.exist(title);

    if ( is_article_exist ) {
      return { 
        status: StatusCode.Conflic, 
        _id: "", 
        message: "Un article existe déjà avec un nom similaire, veuillez en choisir un nouveau." 
      };
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
      return {
        status: StatusCode.Success,
        _id: new_article._id.toString(),
        message: ""
      }
    }

    return {
      status: StatusCode.InternalError,
      _id: "",
      message: "Une erreur est survenue lors de la création de votre article, veuillez réessayer."
    }
  }

  // Update the article
  static async update(a: F_Article): Promise<{ status: StatusCode, message: string }> {
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
        includeResultMetadata: true // see if the update is ok or not
      }
    );

    if ( update_article.ok && update_article.value !== null ) return { status: StatusCode.Success, message: "" }

    return { status: StatusCode.NotFound, message: "Une erreur est survenue lors de la modification de votre article, veuillez réessayer" }
  }

  // Delete the article
  static async delete(_id: string): Promise<{ status: StatusCode, message: string }> {
    const delete_article = await article_schema.deleteOne({ _id: new mongoose.Types.ObjectId(_id) });

    if ( delete_article.deletedCount === 1 ) return { status: StatusCode.Success, message: "" };

    return { status: StatusCode.NotFound, message: "Une erreur est survenue lors de la suppression de votre article, veuillez réessayer" };
  }

  // See if the article already exist
  static async exist(title: string): Promise<boolean> {
    const is_article_exist = await article_schema.findOne({ title });

    if ( is_article_exist ) {
      return true
    }

    return false
  }
}
