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
  static async new(c: B_NewChronologie): Promise<StatusCode> {
    let { name, from, to } = c;

    let is_chronologie_exist = await Chronologie.exist(name);

    if ( is_chronologie_exist ) {
      return StatusCode.Conflic
    }

    const new_chronologie = await chronologie_schema.create({
      name,
      from,
      to
    });

    if ( new_chronologie.__v !== null || new_chronologie.__v !== undefined ) {
      return StatusCode.Success
    }

    return StatusCode.ConflicWithServer
  }

  // Update chronologie element
  static async update(c: F_ChronologieElement): Promise<StatusCode> {
    const { _id, name, from, to } = c;

    // Verify if base chronologie element exist - also to get his articles
    const prev_chronologie = await Chronologie.get_by_id(_id);

    if ( !prev_chronologie ) {
      return StatusCode.NotFound
    }

    // Verify if a chronologie with the new name already exist
    let is_chronologie_exist = await Chronologie.exist(name);

    if ( is_chronologie_exist ) {
      return StatusCode.Conflic
    }

    // Get all articles relative to the chronologie element
    let chronologie_articles = await Article.get_from_mouvement(prev_chronologie.name);

    if (chronologie_articles.length > 0) {
      for (const article of chronologie_articles) {
        // Update the mouvement name with the new one
        article.mouvement = name;

        const result = await Article.update(article);

        if (result !== StatusCode.Success) {
          return StatusCode.InternalError;
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

    if ( update_chronologie.ok && update_chronologie.value !== null ) return StatusCode.Success

    return StatusCode.NotFound
  }

  static async delete(_id: string): Promise<StatusCode> {
    const chronologie_name = await chronologie_schema.findOne({ _id: new mongoose.Types.ObjectId(_id)}).select("name");
    const all_articles_with_chronologie_name = await Article.get_from_mouvement(chronologie_name.name);

    // Delete all articles relative to an chronologie
    all_articles_with_chronologie_name.forEach(async (el) => {
      const request = await Article.delete(el._id);
      if ( request !== StatusCode.Success) {
        return StatusCode.InternalError;
      }
    })

    const delete_chronologie = await chronologie_schema.deleteOne({ _id: new mongoose.Types.ObjectId(_id) })

    if ( delete_chronologie.deletedCount === 1 ) {
      return StatusCode.Success;
    }

    return StatusCode.NotFound;
  }

  static async exist(name: string): Promise<boolean> {
    const is_chronologie_exist = await chronologie_schema.findOne({ name });

    if ( is_chronologie_exist ) {
      return true
    }

    return false
  }
}
