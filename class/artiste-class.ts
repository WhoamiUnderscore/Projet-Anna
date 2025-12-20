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

  static async new(a: B_NewArtiste): Promise<{ status: StatusCode, _id: string, message: string}> {
    const { name, image, metier, from, to, content } = a;

    const is_artiste_already_exist = await Artiste.exist(name);

    if ( is_artiste_already_exist ) {
      return {
        status: StatusCode.Conflic, 
        _id: "", 
        message: "Le nom de votre artiste est déjà enregistré, il est impossible d'enregistrer deux artistes du même nom."
      };
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
      return {
        status: StatusCode.Success,
        _id: new_artiste._id.toString(),
        message: ""
      }
    }

    return {
      status: StatusCode.InternalError,
      _id: "",
      message: "Il y a eu un problème lors de l'enregistrement de votre artiste, veuillez réessayer"
    }
  }

  static async update(a: F_Artiste ): Promise<{status: StatusCode, message: string}> {
    const { _id, name, metier, from, to, image, content} = a;

    const is_artiste_already_exist = await Artiste.exist(name);

    if ( is_artiste_already_exist ) {
      return {
        status: StatusCode.Conflic, 
        _id: "", 
        message: "Le nom de votre artiste est déjà enregistré, il est impossible d'enregistrer deux artistes du même nom."
      };
    }

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

    if ( update_artiste.ok && update_artiste.value !== null ) return { status: StatusCode.Success, message: "" }

    return { 
      status: StatusCode.NotFound, 
      message: "Une erreur est survenue lors de la modification de votre artiste, veuillez réessayer" 
    }
  }

  static async delete(id: string): Promise<{status: StatusCode, message: string}> {
    const delete_artiste = await artiste_model.deleteOne({ _id: id });

    if ( delete_artiste.deletedCount === 1 ) return { status: StatusCode.Success, message: "" };

    return { 
      status: StatusCode.NotFound, 
      message: "Une erreur est survenue lors de la suppression de votre artiste, veuillez réessayer" 
    };
  }

  static async exist(name: string): Promise<boolean> {
    const is_artiste_exist = await artiste_model.findOne({ name });

    if ( is_artiste_exist ) return true

    return false
  }
}
