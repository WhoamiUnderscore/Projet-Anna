import mongoose from "mongoose";

const cour_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false
  },
}, { strict: true })

export default mongoose.models["Cours"] || mongoose.model("Cours", cour_schema);
