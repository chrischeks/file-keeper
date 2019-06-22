"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
exports.uploader = cloudinary_1.uploader;
const cloudinaryConfig = (req, res, next) => {
    cloudinary_1.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    next();
};
exports.cloudinaryConfig = cloudinaryConfig;
