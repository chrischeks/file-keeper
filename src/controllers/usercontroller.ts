import { NextFunction, Request, Response, Router } from "express";
import { BaseController } from "./basecontroller";
import { FileService } from '../services/fileservice';
import multer = require("multer");
import { BasicResponse } from "../dtos/outputs/basicresponse";
import crypto = require('crypto');

// import { FolderService } from "../services/folderservice";
// import { ShareFileService } from "../services/shareFileService";
// import { ShareFolderService } from '../services/shareFolderService';
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config({

  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,

  api_secret: process.env.CLOUDINARY_API_SECRET,

});


// //const storage = cloudinaryStorage({ cloudinary: cloudinary, folder: "demo", allowedFormats: ["jpg", "png"] });
// //const storage = multer.memoryStorage()
// const upload = multer({
//   storage, limits: {
//     fileSize: +process.env.MAX_FILE_SIZE
//   }
// }).array('file', +process.env.UPLOAD_MAX_NUMBER_FILES);

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "private/uploads");
  },
  filename: function(req, file, cb) {
    var prefix = crypto.randomBytes(16).toString("hex");
    cb(null, prefix + '-' +Date.now());
  }
});
const upload = multer({ storage: storage , limits: {
  fileSize: 200000
} }).array('file', 10);



export class UserController extends BaseController {

  constructor() {
    super();
  }

  public loadRoutes(prefix: String, router: Router) {

    this.initUploadFileRoute(prefix, router);
    this.initListFilesRoute(prefix, router);
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

  }



  public initUploadFileRoute(prefix: String, router: Router): any {
    router.post(prefix + "/upload_file", (req, res: Response, next: NextFunction) => {
      var that = this;
      upload(req, res, function (err) {
        let uploadError: BasicResponse = that.getUploadError(true, req, err);
        if (that.hasUploadError(uploadError)) {
          that.sendResponse(uploadError, req, res, next);
        } else {       
          console.log(req.files)   
          new FileService().processFileupload(req, res, next);
        }

      });

    });
  }



  //   public initRenameFileRoute(prefix: String, router: Router): any {

  //     router.put(prefix + "/rename_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FileService().updateFileName(req, res, next, this.user_id, this.user_tenantId);
  //     })
  //   }


  //   public initRenameFolderRoute(prefix: String, router: Router): any {

  //     router.put(prefix + "/rename_folder/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FolderService().updateFolderName(req, res, next, this.user_id, this.user_tenantId);
  //     })
  //   }



  //   public initCreateFolderRoute(prefix: String, router: Router): any {

  //     router.post(prefix + "/create_folder", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FolderService().processCreateFolder(req, res, next, this.user_id, this.user_firstname, this.user_tenantId, this.user_email);
  //     })
  //   }


  //   public initListSubFoldersRoute(prefix: String, router: Router): any {

  //     router.get(prefix + "/list_folders", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FolderService().processListFolders(req, res, next, this.user_email, this.user_id, this.user_tenantId);
  //     })
  //   }



    public initListFilesRoute(prefix: String, router: Router): any {

      router.get(prefix + "/list_files", (req, res: Response, next: NextFunction) => {
        new FileService().processListFiles(req, res, next);
      })
    }


  //   public initShareFileRoute(prefix: String, router: Router): any {

  //     router.put(prefix + "/share_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new ShareFileService().processFileShare(req, res, next, this.user_id, this.user_tenantId, this.user_firstname, this.user_email);
  //     })
  //   }


  //   public initShareFolderRoute(prefix: String, router: Router): any {

  //     router.put(prefix + "/share_folder/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new ShareFolderService().processFolderShare(req, res, next, this.user_id, this.user_tenantId, this.user_firstname, this.user_email);
  //     })
  //   }

  //   public initShareToAllRoute(prefix: String, router: Router): any {

  //     router.put(prefix + "/share/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new ShareFileService().processShareToAll(req, res, next, this.user_id, this.user_tenantId, this.user_firstname, this.user_email);
  //     })
  //   }


  //   public initDownloadSharedFileRoute(prefix: String, router: Router): any {

  //     router.get(prefix + "/download_shared_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new ShareFileService().downloadSharedFile(req, res, next, this.user_email, this.user_tenantId);
  //     })
  //   }



  //   public initViewSharedFileRoute(prefix: String, router: Router): any {

  //     router.get(prefix + "/view_shared_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new ShareFileService().viewSharedFile(req, res, next, this.user_email, this.user_tenantId);
  //     })
  //   }



  //   public initDownloadFileRoute(prefix: String, router: Router): any {

  //     router.get(prefix + "/download_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FileService().downloadUserFile(req, res, next, this.user_id, this.user_tenantId);
  //     })
  //   }


  //   public initViewFileRoute(prefix: String, router: Router): any {

  //     router.get(prefix + "/view_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FileService().viewUserFile(req, res, next, this.user_id, this.user_tenantId, this.user_email);
  //     })
  //   }

  //   public initFileSharedWithMeRoute(prefix: String, router: Router): any { 

  //     router.get(prefix + "/file_shared_with_me/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FileService().sharedWithMe(req, res, next, this.user_email , this.user_id, this.user_tenantId);
  //     })
  //   }


  //   public initFolderSharedWithMeRoute(prefix: String, router: Router): any {

  //     router.get(prefix + "/folder_shared_with_me/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FolderService().sharedWithMe(req, res, next, this.user_email, this.user_id, this.user_tenantId);
  //     })
  //   }


  //   public initMoveFileRoute(prefix: String, router: Router): any {

  //     router.put(prefix + "/move_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FileService().processMoveFile(req, res, next, this.user_email, this.user_id, this.user_tenantId);
  //     })
  //   }

  //   public initDeleteFileRoute(prefix: String, router: Router): any {

  //     router.delete(prefix + "/delete_file/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FileService().processDeleteFile(req, res, next, this.user_id, this.user_tenantId);
  //     })
  //   }

  //   public initDeleteFolderRoute(prefix: String, router: Router): any {

  //     router.delete(prefix + "/delete_folder/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FolderService().processDeleteFolder(req, res, next, this.user_id, this.user_tenantId);
  //     })
  //   }

  //   public initDownloadFolderRoute(prefix: String, router: Router): any {

  //     router.get(prefix + "/download_folder/:id", [this.authorize.bind(this)], (req, res: Response, next: NextFunction) => {
  //       new FolderService().processDownloadFolder(req, res, next, this.user_id, this.user_tenantId, this.user_email);
  //     })
  //   }



}

