"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.UploadSchema = new mongoose_1.Schema({
    secret: {
        originalFileName: String,
        fileName: String,
        fileSize: Number,
        fileExtension: String
    }
}, { timestamps: true });
