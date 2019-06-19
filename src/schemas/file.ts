import { Schema, model } from "mongoose";

export var UploadSchema: Schema = new Schema({
   secret: { 
        originalFileName: String,
        fileName: String,
        fileSize: Number,
        fileExtension: String
    }

}, {timestamps: true});



