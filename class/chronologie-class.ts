import mongoose from "mongoose";

import chronologie_schema from "@/models/chronologie-model";

import { type B_NewChronologie, type F_ChronologieElement } from "@/types/chronologie-types";
import { StatusCode } from "@/types/http-response-types"

export default class Chronologie {
  static async get_all(): Promise<F_ChronologieElement[]> {
    const chronologie_elements = await chronologie_schema.find({ });

    return chronologie_elements
  }

  static async get(name: string): Promise<F_ChronologieElement | null> {
    const chronologie_element = await chronologie_schema.find({ name });

    return chronologie_element
  }

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

  static async exist(name: string): Promise<boolean> {
    const is_chronologie_exist = await chronologie_schema.findOne({ name });

    if ( is_chronologie_exist ) {
      return true
    }

    return false
  }

  static async update(c: F_ChronologieElement): Promise<StatusCode> {
    const { _id, name, from, to } = c;

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
    const delete_chronologie = await chronologie_schema.deleteOne({ _id: new mongoose.Types.ObjectId(_id) })

    if ( delete_chronologie.deletedCount === 1 ) {
      return StatusCode.Success;
    }

    return StatusCode.NotFound;
  }
}
