import cour_schema from "@/models/cours-model"

import { type F_Cour, type F_NewCour } from "@/types/cour-types"
import { StatusCode } from "@/types/http-response-types"

export default class Cour {
  static async get(id: string): Promise<F_Cour> {
    const cour = await cour_schema.findOne({ _id: id });
    return cour;
  }

  static async get_all(): Promise<F_Cour[]> {
    const cours = await cour_schema.find({});
    return cours;
  }

  static async new(c: F_NewCour): Promise<{ status: StatusCode, _id: string, message: string }> {
    const { title, image, subject, content } = c;

    const cour_already_exist = await Cour.exist(title);

    if ( cour_already_exist ) {
      return { 
        status: StatusCode.Conflic, 
        _id: "", 
        message: "Ce nom de cour existe deja, veuillez en choisir un nouveau" 
      };
    }

    const new_cour = await cour_schema.create({
      title,
      image,
      subject,
      content
    })


    if ( new_cour.__v !== null || new_cour.__v !== undefined ) {
      return {
        status: StatusCode.Success,
        _id: new_cour._id.toString(),
        message: ""
      }
    }

    return {
      status: StatusCode.InternalError,
      _id: "",
      message: "Une erreur est survenu lors de la creation de votre cour, veuillez reessayer."
    }
  }

  static async update(c: F_Cour): Promise<{ status: StatusCode, message: string }> {
    const { _id, title, image, subject, content} = c;

    const cour_already_exist = await Cour.exist(title);

    if ( cour_already_exist ) {
      return { 
        status: StatusCode.Conflic, 
        message: "Ce nom de cour existe deja, veuillez en choisir un nouveau" 
      };
    }

    const update_cour = await cour_schema.findOneAndUpdate(
      { _id },
      {
        title, 
        image,
        subject,
        content
      },
      {
        includeResultMetadata: true // see if the update is ok or not
      }
    );

    if ( update_cour.ok && update_cour.value !== null ) return { status: StatusCode.Success, message: "" }

    return { status: StatusCode.NotFound, message: "Une erreur est survenu lors de la modification de votre cour, veuillez reessayer" }
  }

  static async delete(_id: string): Promise<{ status: StatusCode, message: string }> {
    const delete_cour = await cour_schema.deleteOne({ _id });

    if ( delete_cour.deletedCount === 1 ) return { status: StatusCode.Success, message: "" };

    return { status: StatusCode.NotFound, message: "Une erreur est survenu lors de la suppression de votre cour, veuillez reessayer." };
  }

  static async exist(title: string): Promise<boolean> {
    const is_exist = await cour_schema.findOne({ title });

    if ( is_exist ) {
      return true
    }

    return false
  }

}
