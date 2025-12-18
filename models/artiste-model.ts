import mongoose from "mongoose";

const artiste_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  metier: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  from: {
    type: Number,
    required: true
  },
  to: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: false
  },
}, { strict: true })

export default mongoose.models["Artistes"] || mongoose.model("Artistes", artiste_schema);
