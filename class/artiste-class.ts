// @ts-nocheck
import artiste_model from "@/models/artiste-model"

import { type F_Artiste, type B_NewArtiste } from "@/types/artiste-types"
import { StatusCode } from "@/types/http-response-types"

export default class Artiste {
  static async get(id: string): Promise<F_Artiste> {
    const artiste = await artiste_model.findOne({ _id: id });

    return artiste
  }

  static async get_all(): Promise<F_Artiste[]> {
    const artistes = await artiste_model.find({});

    return artistes
  }

  static async new(a: B_NewArtiste): Promise<StatusCode> {
    const { name, image, metier, from, to, content } = a;

    const is_artiste_already_exist = await Artiste.exist(name);

    if ( is_artiste_already_exist ) {
      return StatusCode.Conflic;
    }

    const new_artiste = await artiste_model.create({
      name,
      image,
      metier,
      from,
      to,
      content
    });

    if ( new_artiste.__v !== null || new_artiste.__v !== undefined ) {
      return StatusCode.Success
    }

    return StatusCode.ConflicWithServer
  }

  static async update(a: F_Artiste ): Promise<StatusCode> {
    const { _id, name, metier, from, to, image, content} = a;

    const update_artiste = await artiste_model.findOneAndUpdate(
      { _id },
      {
        name, 
        metier,
        from,
        to,
        image,
        content
      },
      {
        includeResultMetadata: true // see if the update is ok or not
      }
    );

    if ( update_artiste.ok && update_artiste.value !== null ) return StatusCode.Success

    return StatusCode.NotFound
  }

  static async delete(id: string): Promise<boolean> {
    const delete_artiste = await artiste_model.deleteOne({ _id: id });

    if ( delete_artiste.deletedCount === 1 ) return StatusCode.Success;

    return StatusCode.NotFound;
  }

  static async exist(name: string): Promise<boolean> {
    const is_artiste_exist = await artiste_model.findOne({ name });

    if ( is_artiste_exist ) return true

    return false
  }
}
