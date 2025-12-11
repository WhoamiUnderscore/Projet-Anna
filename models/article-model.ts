import mongoose from "mongoose";

const article_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artiste: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  date: {
    type: Number,
    required: true
  },
  mouvement: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false
  },
}, { strict: true })

export default mongoose.models["Articles"] || mongoose.model("Articles", article_schema);
