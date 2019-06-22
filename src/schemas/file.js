"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
exports.UploadSchema = new mongoose_1.Schema({
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
