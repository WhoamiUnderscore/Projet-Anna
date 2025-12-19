import image_schema from "@/models/image-model"

import { type B_Image, type B_NewImage } from "@/types/image-types"
import { StatusCode } from "@/types/http-response-types"

export default class Image {
  static async get(path: string): Promise<B_Image> {
    const image = await image_schema.findOne({ path })

    return image
  }

  static async new(i: B_NewImage): Promise<StatusCode> {
    const { path, id_used } = i;

    const new_image = await image_schema.create({
      path,
      id_used
    })

    if ( new_image.__v !== null || new_image.__v !== undefined ) {
      return StatusCode.Success
    }

    return StatusCode.ConflicWithServer
  }

  static async update(i: B_Image): Promise<StatusCode> {
    const { _id, id_used, path } = i;

    const update_image = await image_schema.findOneAndUpdate(
      { _id },
      {
        path,
        id_used
      },
      {
        includeResultMetadata: true // see if the update is ok or not
      }
    );

    if ( update_image.ok && update_image.value !== null ) return StatusCode.Success

    return StatusCode.NotFound
  }

  static async delete_if_needed(path: string, id: string): Promise<boolean> {
    const image = await Image.get({ path });
    image.id_used = image.id_used.filter(i => i !== id);

    const update_image = await Image.update(image);

    if ( image.id_used.length === 0 ) {
      const delete_image = await image_schema.deleteOne({ _id: image.id })

      if ( delete_image.deletedCount === 1 ) return true;
    }
    return false;
  }

  static async exist(path: string): Promise<boolean> {
    const image_already_exist = await image_schema.findOne({ path });

    if ( image_already_exist ) return true

    return false
  }
}
