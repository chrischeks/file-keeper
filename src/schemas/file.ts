import { Schema, model } from "mongoose";

export var UploadSchema: Schema = new Schema({
    secret: {
        originalFileName: String,
        url: String,
        public_id: String,
        fileSize: String,
        fileExtension: String
    },
    nameHash: {
        type: String,
        required: true
    }

}, { timestamps: true });



