
import { BaseService } from "./baseservice";
import { BasicResponse } from "../dtos/outputs/basicresponse";
import { Status } from '../dtos/enums/statusenums';
import { IUploadModel } from '../models/userUpload';
import { NextFunction, Request, Response } from "express";
//import { RenameFileDTO } from "../dtos/inputs/renamefiledto";
import { validateSync } from "class-validator";

const cloudinary = require("cloudinary");
cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  
    api_key: process.env.CLOUDINARY_API_KEY,
  
    api_secret: process.env.CLOUDINARY_API_SECRET,
  
  });


export class FileService extends BaseService {

    public async processFileupload(req, res: Response, next: NextFunction) {
        try {
            return this.sendResponse(new BasicResponse(Status.SUCCESS, req.files), req, res);
        } catch (error) {
            return this.sendResponse(new BasicResponse(Status.ERROR, error), req, res);
        }
    }



    public async processDeleteFile(req: Request, res: Response, next: NextFunction) {
        try {
            const public_id = req.params.id
            const that = this
            cloudinary.v2.uploader.destroy(public_id, function (error, result) {
                if (result) {
                    that.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
                } else {
                    that.sendResponse(new BasicResponse(Status.ERROR, error), req, res);
                }
            });
        } catch (ex) {
            this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
        }
    }


    public async processListFiles(req, res: Response, next: NextFunction) {
        try {
            const that = this
            cloudinary.v2.api.resources({ type: 'upload', max_results: 60 }, function (error, result) {
                if (error) {
                    that.sendResponse(new BasicResponse(Status.ERROR), req, res);
                } else {
                    that.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
                }
            });

        }
        catch (ex) {
            this.sendException(ex, new BasicResponse(Status.ERROR), req, res, next);
        }

    }


    public async updateFileName(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string) {
        try {
            const to_public_id = req.body.to_public_id;
            // let dto = new RenameFileDTO(to_public_id);
            // let errors = await this.validateExistingFileDetail(dto);
            // if(this.hasErrors(errors)){
            //     await this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), req, res);
            //     return next();
            // }
            const from_public_id = req.body.from_public_id;
            const that = this;
            cloudinary.v2.uploader.rename(from_public_id, to_public_id, function (error, result) {
                if (result) {
                    that.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
                } else {
                    that.sendResponse(new BasicResponse(Status.ERROR, error), req, res);
                }
            });

        } catch (ex) {
            this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
        }
    } 



    // public async processMoveFile(req: Request, res: Response, next: NextFunction, userEmail, userId: string, tenantId: string){
    //     try{
            
    //     } catch (ex){
    //         this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
    //     }
    // } 




//     public async downloadUserFile(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string) {
//         try {
//             let existingFile = null;

//             await req.app.locals.file.findOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
//                 if (result) {
//                     existingFile = result;
//                 }
//             }).catch(err => { });

//             if (existingFile == null) {
//                 this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
//                 return next();
//             }

//             let dir = process.env.UPLOAD_PATH + '/' + existingFile.secret.fileName;

//             res.download(dir, existingFile.secret.originalFileName);

//         } catch (ex) {
//             console.log(ex);
//             this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
//         }
//     }


//     public async viewUserFile(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string, userEmail: string) {
//         try {
//             let existingFile = null;
//             var that = this

//             await req.app.locals.file.findOne({ _id: req.params.id, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId }).then(result => {
//                 if (result) {
//                     existingFile = result;
//                 }
//             }).catch(err => { });

//             if (existingFile == null) {
//                 this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
//                 return next();
//             }

//             let dir = process.env.UPLOAD_PATH + '/';

//             var options = {
//                 root: dir,
//                 dotfiles: 'deny',
//                 headers: {
//                     'x-timestamp': Date.now(),
//                     'x-sent': true
//                 }
//             };

//             var fileName = existingFile.secret.fileName;
//             res.sendFile(fileName, options);

//         } catch (ex) {
//             this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
//         }
//     }

//     public async publicFileDownload(req: Request, res: Response, next: NextFunction) {
//         try {
//             let existingFile = null;

//             await req.app.locals.file.findById(req.params.id).then(result => {
//                 if (result) {
//                     existingFile = result;
//                 }
//             }).catch(err => { });

//             if (existingFile == null) {
//                 this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
//                 return next();
//             }

//             let dir = process.env.PUBLIC_UPLOAD_PATH + '/' + existingFile.secret.fileName;

//             res.download(dir, existingFile.secret.originalFileName);

//         } catch (ex) {
//             console.log(ex);
//             this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
//         }
//     }



//     public async sharedWithMe(req, res: Response, next: NextFunction, userEmail: string, userId: string, tenantId: string) {
//         var that = this;
//         let queryParams = {};
//         if (req.params.id === 'all') {
//             queryParams = { $or: [{ folderId: null }, { sharedFile: true }], shared_with: that.sha256(userEmail), tenantId: tenantId }
//         } else {
//             queryParams = { folderId: req.params.id, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId }
//         }
//         await req.app.locals.file.find(queryParams, { userId: 0, tenantId: 0, __v: 0, nameHash: 0 }).then(result => {
//             if (result && result.length > 0) {
//                 this.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
//             } else {
//                 this.sendResponse(new BasicResponse(Status.SUCCESS, []), req, res);
//             }
//         }).catch(err => {
//             this.sendResponse(new BasicResponse(Status.ERROR), req, res);
//         })
//     }


//     public async fetchSharedFolderFiles(req, res: Response, tenantId: string) {

//         await req.app.locals.file.find({ folderId: req.params.id, tenantId: tenantId }, { userId: 0, tenantId: 0, __v: 0, nameHash: 0 }).then(result => {
//             if (result && result.length > 0) {
//                 this.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
//             } else {
//                 this.sendResponse(new BasicResponse(Status.SUCCESS, []), req, res);
//             }
//         }).catch(err => {
//             this.sendResponse(new BasicResponse(Status.ERROR), req, res);
//         })
//     }


//     async fetchUserFiles(req: Request, res: Response) {
//         // var that = this;
//         // let queryParams = {};
//         // if (folderId == null) {
//         //     queryParams = { folderId: null, userId: userId, tenantId: tenantId }
//         // } else {
//         //     queryParams = { folderId: folderId, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId }
//         // }
//         await req.app.locals.file.find({}).then(result => {
//             if (result && result.length > 0) {
//                 this.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
//             } else {
//                 this.sendResponse(new BasicResponse(Status.SUCCESS, []), req, res);
//             }
//         }).catch(err => {
//             this.sendResponse(new BasicResponse(Status.ERROR), req, res);
//         })
//     }



    // async validateExistingFileDetail(dto: RenameFileDTO) {
    //     let errors = validateSync(dto, { validationError: { target: false }} );
    //     if(this.hasErrors(errors)){
    //         return errors;
    //     }

    //     return errors;
    // }

    // checkOriginalFileName(dto: UpdateFileNameDTO): any {
    //     return (dto.originalFileName === undefined || dto.originalFileName.length === 0 || dto.originalFileName === ""|| dto.originalFileName === null)
    // }





//     async findfilesWithSameNameForUser(file, fileName, userId, tenantId, folderId?) {
//         var found = 0;
//         await file.countDocuments({ 'nameHash': this.sha256(fileName), 'folderId': folderId, 'tenantId': tenantId, 'userId': userId }).then(e => {
//             found = e;
//         });
//         return found;

//     }


//     async verifyParentFolderId(parentFolderId: string, userId: string, tenantId: string, userEmail, req, res, next) {
//         if (parentFolderId) {
//             let existingFile = null;
//             let that = this
//             await req.app.locals.folder.findOne({ _id: parentFolderId, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId }).then(result => {
//                 if (result) {
//                     existingFile = result;
//                 }
//             }).catch(err => { });

//             if (existingFile == null) {
//                 this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
//                 return next();
//             }
//         }
//     }


 }
