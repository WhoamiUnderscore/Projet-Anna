import cour_schema from "@/models/cours-model"

import { type B_Cour, type F_Cour } from "@/types/cour-types"
import { StatusCode } from "@/types/http-response-types"

export default class Cour {
  static async get(id: string): Promise<F_Cour> {
    const cour = await cour_schema.findOne({ _id: id });
    return cour;
  }

  static async get_all(id: string): Promise<F_Cour[]> {
    const cours = await cour_schema.find({});
    return cours;
  }

  static async new(c: B_Cour): Promise<StatusCode> {
    const { title, image, subject, content } = c;

    const cour_already_exist = await Cour.exist(title);

    if ( cour_already_exist ) {
      return StatusCode.Conflic;
    }

    const new_cour = await cour_schema.create({
      title,
      image,
      subject,
      content
    })


    if ( new_cour.__v !== null || new_cour.__v !== undefined ) {
      return StatusCode.Success
    }

    return StatusCode.ConflicWithServer
  }

  static async update(c: F_Cour): Promise<StatusCode> {
    const { _id, title, image, subject, content} = c;

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

    if ( update_cour.ok && update_cour.value !== null ) return StatusCode.Success

    return StatusCode.NotFound
  }

  static async delete(_id: string): Promise<StatusCode> {
    const delete_cour = await cour_schema.deleteOne({ _id });

    if ( delete_cour.deletedCount === 1 ) return StatusCode.Success;

    return StatusCode.NotFound;
  }

  static async exist(title: string): Promise<boolean> {
    const is_exist = await cour_schema.findOne({ title });

    if ( is_exist ) {
      return true
    }

    return false
  }

}
