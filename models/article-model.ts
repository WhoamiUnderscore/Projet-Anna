import mongoose from "mongoose";

const article_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  mouvement_id: {
    type: String,
    required: true
  },
}, { strict: true })

export default mongoose.models["Articles"] || mongoose.model("Articles", article_schema);
