import mongoose from "mongoose";

const chronologie_schema = new mongoose.Schema({
  name: {
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
  }
}, { strict: true })

export default mongoose.models["Chronologie"] || mongoose.model("Chronologie", chronologie_schema);
