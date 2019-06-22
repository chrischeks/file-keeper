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
const storage = cloudinaryStorage({ cloudinary: cloudinary, params: { use_filename: true }, allowedFormats: ["jpg", "png"] });
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
        this.initListFilesRoute(prefix, router);
        this.initRenameFileRoute(prefix, router);
        this.initDeleteFileRoute(prefix, router);
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
                    console.log(req.files);
                    new fileservice_1.FileService().processFileupload(req, res, next);
                }
            });
        });
    }
    initRenameFileRoute(prefix, router) {
        router.patch(prefix + "/rename_file", (req, res, next) => {
            new fileservice_1.FileService().updateFileName(req, res, next, this.user_id, this.user_tenantId);
        });
    }
    initListFilesRoute(prefix, router) {
        router.get(prefix + "/list_files", (req, res, next) => {
            new fileservice_1.FileService().processListFiles(req, res, next);
        });
    }
    initDeleteFileRoute(prefix, router) {
        router.delete(prefix + "/delete_file/:id", (req, res, next) => {
            new fileservice_1.FileService().processDeleteFile(req, res, next);
        });
    }
}
exports.UserController = UserController;
