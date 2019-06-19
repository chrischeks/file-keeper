"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basecontroller_1 = require("./basecontroller");
const fileservice_1 = require("../services/fileservice");
const multer = require("multer");
const crypto = require("crypto");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        var prefix = crypto.randomBytes(16).toString("hex");
        cb(null, prefix + '-' + Date.now());
    }
});
const upload = multer({ storage: storage, limits: {
        fileSize: +process.env.MAX_FILE_SIZE
    } }).array('file', 10);
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
            console.log(1);
            upload(req, res, function (err) {
                let uploadError = that.getUploadError(true, req, err);
                if (that.hasUploadError(uploadError)) {
                    console.log(2);
                    that.sendResponse(uploadError, req, res, next);
                }
                else {
                    console.log(req.files, 'ooooooooooooo');
                    new fileservice_1.FileService().processFileupload(req, res, next);
                }
            });
        });
    }
}
exports.UserController = UserController;
