// @ts-nocheck
import mongoose from "mongoose"

import chronologie_schema from "@/models/chronologie-model";
import Article from "@/class/article-class"

import { type B_NewChronologie, type F_ChronologieElement } from "@/types/chronologie-types";
import { StatusCode } from "@/types/http-response-types"

export default class Chronologie {
  // Get all chronologie elements
  static async get_all(): Promise<F_ChronologieElement[]> {
    let chronologie_elements = await chronologie_schema.find({ });

    // Sort chronologically elements
    chronologie_elements = chronologie_elements.sort((a, b) => a.from - b.from);

    return chronologie_elements
  }

  // Get chronologie from his name
  static async get(name: string): Promise<F_ChronologieElement | null> {
    const chronologie_element = await chronologie_schema.findOne({ name });

    return chronologie_element
  }

  // Get chronologie from his _id
  static async get_by_id(id: string): Promise<F_ChronologieElement | null> {
    const chronologie_element = await chronologie_schema.findOne({ _id: new mongoose.Types.ObjectId(id) });

    return chronologie_element
  }

  // Add new chronologie element
  static async new(c: B_NewChronologie): Promise<{ status: StatusCode, message: string }> {
    let { name, from, to } = c;

    let is_chronologie_exist = await Chronologie.exist(name);

    if ( is_chronologie_exist ) {
      return {
        status: StatusCode.Conflic, 
        message: "Le mouvement que vous essayer de cree existe deja."
      }
    }

    const new_chronologie = await chronologie_schema.create({
      name,
      from,
      to
    });

    if ( new_chronologie.__v !== null || new_chronologie.__v !== undefined ) {
      return { status: StatusCode.Success, message: "" }
    }

    return { 
      status: StatusCode.ConflicWithServer, 
      message: "Une erreur est survenu lors de l'enregistrement de votre mouvement, veuillez reessayer."
    }
  }

  // Update chronologie element
  static async update(c: F_ChronologieElement): Promise<StatusCode> {
    const { _id, name, from, to } = c;

    // Verify if base chronologie element exist - also to get his articles
    const prev_chronologie = await Chronologie.get_by_id(_id);

    if ( !prev_chronologie ) {
      return { 
        status: StatusCode.NotFound, 
        message: "Une erreur est survenu lors de la selection du mouvement a modifier, veuillez reessayer." 
      }
    }

    // Verify if a chronologie with the new name already exist
    let is_chronologie_exist = await Chronologie.exist(name);

    if ( is_chronologie_exist ) {
      return { 
        status: StatusCode.Conflic,
        message: "Le nom que vous essayer d'assigner au mouvement existe deja, veuillez en choisir un autre."
      }
    }

    // Get all articles relative to the chronologie element
    let chronologie_articles = await Article.get_from_mouvement(prev_chronologie.name);

    if (chronologie_articles.length > 0) {
      for (const article of chronologie_articles) {
        // Update the mouvement name with the new one
        article.mouvement = name;

        const result = await Article.update(article);

        if (result !== StatusCode.Success) {
          return {
            status: StatusCode.InternalError
            message: "Une erreur est survenu lors de la modification du nom du mouvement dans ses articles assigner, veuillez reessayer.";
          }
        }
      }


      const update_chronologie = await chronologie_schema.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(_id) },
        {
          name, 
          from,
          to
        },
        {
          includeResultMetadata: true
        }
      );

      if ( update_chronologie.ok && update_chronologie.value !== null ) return { status: StatusCode.Success, message: "" }

      return { status: StatusCode.NotFound, message: "Une erreur est survenu lors de la modification de votre mouvement, veuillez reessayer" }
    }
  }

  static async delete(_id: string): Promise<{status: StatusCode, message: string}> {
    const chronologie_name = await chronologie_schema.findOne({ _id: new mongoose.Types.ObjectId(_id)}).select("name");
    const all_articles_with_chronologie_name = await Article.get_from_mouvement(chronologie_name.name);

    // Delete all articles relative to an chronologie
    all_articles_with_chronologie_name.forEach(async (el) => {
      const request = await Article.delete(el._id);
      if ( request !== StatusCode.Success) {
        return { 
          status: StatusCode.InternalError, 
          message: "Une erreur est survenu lors de la suppression des article assigner au mouvement, veuillez reessayer" 
        };
      }
    })

    const delete_chronologie = await chronologie_schema.deleteOne({ _id })

    if ( delete_chronologie.deletedCount === 1 ) {
      return { status: StatusCode.Success, message: "" };
    }


    return { status: StatusCode.NotFound, message: "Une erreur est survenu lors de la suppression de votre mouvement, veuillez reessayer." };
  }

  static async exist(name: string): Promise<boolean> {
    const is_chronologie_exist = await chronologie_schema.findOne({ name });

    if ( is_chronologie_exist ) {
      return true
    }

    return false
  }
}
