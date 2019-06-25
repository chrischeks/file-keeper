
import { Schema, model } from "mongoose";

export let registerSchema: Schema = new Schema({

  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean, default: false
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  }
}, { timestamps: true});