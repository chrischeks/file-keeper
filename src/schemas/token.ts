
import { Schema, model } from "mongoose";

export let tokenSchema: Schema = new Schema({

    _userId: { type: Schema.Types.ObjectId, required: true, ref: 'Register' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});
