"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basecontroller_1 = require("./basecontroller");
const fileservice_1 = require("../services/fileservice");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = cloudinaryStorage({ cloudinary: cloudinary, folder: "demo", allowedFormats: ["jpg", "png"] });
const upload = multer({
    storage, limits: {
        fileSize: +process.env.MAX_FILE_SIZE
    }
}).array('file', +process.env.UPLOAD_MAX_NUMBER_FILES);
class UserController extends basecontroller_1.BaseController {
    constructor() {
        super();
    }
    loadRoutes(prefix, router) {
        this.initUploadFileRoute(prefix, router);
    }
    initUploadFileRoute(prefix, router) {
        router.post(prefix + "/upload_file", (req, res, next) => {
            var that = this;
            upload(req, res, function (err) {
                let uploadError = that.getUploadError(true, req, err);
                if (that.hasUploadError(uploadError)) {
                    that.sendResponse(uploadError, req, res, next);
                }
                else {
                    new fileservice_1.FileService().processFileupload(req, res, next);
                }
            });
        });
    }
}
exports.UserController = UserController;
