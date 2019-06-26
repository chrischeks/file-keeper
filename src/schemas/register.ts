
import { Schema, model } from "mongoose";

export let registerSchema: Schema = new Schema({

  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true});