"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basecontroller_1 = require("./basecontroller");
const fileservice_1 = require("../services/fileservice");
const multer = require("multer");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "private/uploads");
    },
    filename: function (req, file, cb) {
        var prefix = crypto.randomBytes(16).toString("hex");
        cb(null, prefix + '-' + Date.now());
    }
});
const upload = multer({ storage: storage, limits: {
        fileSize: 200000
    } }).array('file', 10);
class UserController extends basecontroller_1.BaseController {
    constructor() {
        super();
    }
    loadRoutes(prefix, router) {
        this.initUploadFileRoute(prefix, router);
        this.initListFilesRoute(prefix, router);
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
    initListFilesRoute(prefix, router) {
        router.get(prefix + "/list_files", (req, res, next) => {
            new fileservice_1.FileService().processListFiles(req, res, next);
        });
    }
}
exports.UserController = UserController;
