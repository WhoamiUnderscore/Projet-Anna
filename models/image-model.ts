import mongoose from "mongoose";

const image_schema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  id_used: {
    type: Array,
    required: true 
  },
}, { strict: true })

export default mongoose.models["Images"] || mongoose.model("Images", image_schema);
