"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var basecontroller_1 = require("./basecontroller");
var fileservice_1 = require("../services/fileservice");
var multer = require("multer");
// import { FolderService } from "../services/folderservice";
// import { ShareFileService } from "../services/shareFileService";
// import { ShareFolderService } from '../services/shareFolderService';
var cloudinary = require("cloudinary");
var cloudinaryStorage = require("multer-storage-cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
var storage = cloudinaryStorage({ cloudinary: cloudinary, folder: "demo", allowedFormats: ["jpg", "png"] });
var upload = multer({
    storage: storage, limits: {
        fileSize: +process.env.MAX_FILE_SIZE
    }
}).array('file', +process.env.UPLOAD_MAX_NUMBER_FILES);
var UserController = /** @class */ (function (_super) {
    __extends(UserController, _super);
    function UserController() {
        return _super.call(this) || this;
    }
    UserController.prototype.loadRoutes = function (prefix, router) {
        this.initUploadFileRoute(prefix, router);
        // this.initListFilesInFolderRoute(prefix, router);
        // this.initRenameFileRoute(prefix, router);
        // this.initCreateFolderRoute(prefix, router);
        // this.initShareFileRoute(prefix, router);
        // this.initListSubFoldersRoute(prefix, router);
        // this.initDownloadFileRoute(prefix, router);
        // this.initViewFileRoute(prefix, router);
        // this.initRenameFolderRoute(prefix, router);
        // this.initFolderSharedWithMeRoute(prefix, router);
        // this.initFileSharedWithMeRoute(prefix, router);
        // this.initDownloadSharedFileRoute(prefix, router);
        // this.initShareFolderRoute(prefix, router);
        // this.initViewSharedFileRoute(prefix, router);
        // this.initMoveFileRoute(prefix, router);
        // this.initDeleteFileRoute(prefix, router);
        // this.initDeleteFolderRoute(prefix, router);
        // this.initDownloadFolderRoute(prefix, router);
        // this.initShareToAllRoute(prefix, router)
    };
    UserController.prototype.initUploadFileRoute = function (prefix, router) {
        var _this = this;
        router.post(prefix + "/upload_file", function (req, res, next) {
            var that = _this;
            upload(req, res, function (err) {
                var uploadError = that.getUploadError(true, req, err);
                if (that.hasUploadError(uploadError)) {
                    that.sendResponse(uploadError, req, res, next);
                }
                else {
                    new fileservice_1.FileService().processFileupload(req, res, next);
                }
            });
        });
    };
    return UserController;
}(basecontroller_1.BaseController));
exports.UserController = UserController;
