
import { BaseService } from "./baseservice";
import { BasicResponse } from "../dtos/outputs/basicresponse";
import { Status } from '../dtos/enums/statusenums';
import { IUploadModel } from '../models/userUpload';
import { NextFunction, Request, Response } from "express";
import { UploadFileDTO } from "../dtos/inputs/uploadfiledto";
import { validateSync } from "class-validator";
import { sign } from "jsonwebtoken";
import { readFileSync } from "fs";

const fs = require('fs')
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)


export class FileService extends BaseService {

    public async processFileupload(req, res: Response, next: NextFunction) {
    
            var savedFiles = []
            for (var i = 0; i < req.files.length; i++) {
                let file = req.files[i];
    
                let uploadFileModel = await req.app.locals.file({ secret: { originalFileName: file.originalname, fileName: file.filename, fileSize: file.size, fileExtension: file.mimetype}, nameHash: this.sha256(file.filename) });
                await uploadFileModel.save().then(result => {
                    if (!result) {
                        return this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION), req, res);
                    } else {
                        savedFiles.push({
                            secret: {
                                fileName: file.filename,
                                originalFileName: file.originalname,
                                fileExtension: file.mimetype,
                                fileSize: file.size
                            },
                            _id: result._id,
                            createdAt: result.createdAt,
                            updatedAt: result.updatedAt
                        })
                    }
    
                }).catch(err => {
                    console.log(err)
                 });
    
            }
            return this.sendResponse(new BasicResponse(Status.SUCCESS, savedFiles), req, res);
    }

    



    async processDeleteFile(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string){
        try{
            let existingFile = null;

            await req.app.locals.file.findOne({_id: req.params.id, userId: userId, tenantId: tenantId}).then(result => {
                if(result){
                    existingFile = result;
                }
            }).catch(err => {});
            if(existingFile == null){
                this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, ['Sorry you cannot delete this file']), req, res);
                return next();
            }
            
            let dir = process.env.UPLOAD_PATH+'/'+existingFile.secret.fileName;

            await unlinkAsync(dir)
            await req.app.locals.file.deleteOne({_id: req.params.id, userId:userId, tenantId:tenantId}).then(result =>{
                
                if(result){
                    this.sendResponse(new BasicResponse(Status.SUCCESS_NO_CONTENT),req,res)
                    
                }
            }).catch(err =>{})
  
        } catch (ex){
            this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
        }
    }

    public async processListFiles(req, res: Response, next: NextFunction, userId: string, tenantId: string, userEmail: string){
        try{
            let folderId = req.query.id;
            await this.verifyParentFolderId(folderId, userId, tenantId, userEmail, req, res, next)
            
            await this.fetchUserFiles(folderId, userEmail, userId, tenantId, req, res)
            
            }
        catch(ex){
            this.sendException(ex, new BasicResponse(Status.ERROR), req, res, next);
        }
        
    }


    // public async updateFileName(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string){
    //     try{
            
    //         let dto = new UpdateFileNameDTO(req.body.originalFileName.trim());
    //         let errors = await this.validateExistingFileDetail(dto);
    //         if(this.hasErrors(errors)){
    //             await this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), req, res);
    //             return next();
    //         } 
            
    //         let existingFile = null;
    //         const fileId = req.params.id

    //         await req.app.locals.file.findOne({_id: fileId, userId: userId, tenantId: tenantId}, {userId:0, tenantId: 0, __v:0, nameHash: 0}).then(result => {
    //             if(result){
    //                 existingFile = result;
    //             }
    //         }).catch(err => {});
    //         existingFile.secret.originalFileName = dto.originalFileName;
    //         existingFile.nameHash = this.sha256(dto.originalFileName);
            
    //         let responseObj = null;
    //         await existingFile.save().then(result => {
    
    //             if(!result){
    //                 responseObj = new BasicResponse(Status.ERROR);
    //             }else{
    //                 responseObj = new BasicResponse(Status.SUCCESS, result);
    //             }
    //         }).catch(err => {
    //             responseObj = new BasicResponse(Status.ERROR, err);
    //         });
            
    //         this.sendResponse(responseObj, req, res);
    //         return next();
  
    //     } catch (ex){
    //         this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
    //     }
    // } 



    // public async processMoveFile(req: Request, res: Response, next: NextFunction, userEmail, userId: string, tenantId: string){
    //     try{
    //         const parentFolderId = req.body.id;
    //         await this.verifyParentFolderId(parentFolderId, userId, tenantId, userEmail, req, res, next)
            
    //         let existingFile = null;
    //         const fileId = req.params.id
    //         await req.app.locals.file.findOne({_id: fileId, userId: userId, tenantId: tenantId}, {userId:0, tenantId: 0, __v:0, nameHash: 0}).then(result => {
    //             if(result){
    //                 existingFile = result;
    //             }
    //         }).catch(err => {});
    //         existingFile.folderId = parentFolderId
            
    //         let responseObj = null;
    //         await existingFile.save().then(result => {
    
    //             if(!result){
    //                 responseObj = new BasicResponse(Status.ERROR);
    //             }else{
    //                 responseObj = new BasicResponse(Status.SUCCESS, result);
    //             }
    //         }).catch(err => {
    //             responseObj = new BasicResponse(Status.ERROR, err);
    //         });
            
    //         this.sendResponse(responseObj, req, res);
    //         return next();
  
    //     } catch (ex){
    //         console.log(ex);
    //         this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
    //     }
    // } 


    

    public async downloadUserFile(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string){
        try{
            let existingFile = null;

            await req.app.locals.file.findOne({_id: req.params.id, userId: userId, tenantId: tenantId}).then(result => {
                if(result){
                    existingFile = result;
                }
            }).catch(err => {});

            if(existingFile == null){
                this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
                return next();
            }
            
            let dir = process.env.UPLOAD_PATH+'/'+existingFile.secret.fileName;

            res.download(dir, existingFile.secret.originalFileName);
  
        } catch (ex){
            console.log(ex);
            this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
        }
    }


    public async viewUserFile(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string, userEmail: string){
        try{
            let existingFile = null;
            var that = this

            await req.app.locals.file.findOne({_id: req.params.id, $or: [ { userId: userId }, { shared_with: that.sha256(userEmail)}], tenantId: tenantId}).then(result => {
                if(result){
                    existingFile = result;
                }
            }).catch(err => {});

            if(existingFile == null){
                this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
                return next();
            }
            
            let dir = process.env.UPLOAD_PATH+'/';

            var options = {
                root:  dir,
                dotfiles: 'deny',
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
              };
            
              var fileName = existingFile.secret.fileName;
              res.sendFile(fileName, options);
  
        } catch (ex){
            this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
        }
    }

    public async publicFileDownload(req: Request, res: Response, next: NextFunction){
        try{
            let existingFile = null;

            await req.app.locals.file.findById(req.params.id).then(result => {
                if(result){
                    existingFile = result;
                }
            }).catch(err => {});

            if(existingFile == null){
                this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
                return next();
            }
            
            let dir = process.env.PUBLIC_UPLOAD_PATH+'/'+existingFile.secret.fileName;

            res.download(dir, existingFile.secret.originalFileName);
  
        } catch (ex){
            console.log(ex);
            this.sendException(ex, new BasicResponse(Status.ERROR, ex), req, res, next);
        }
    }
    


    public async sharedWithMe(req, res: Response, next: NextFunction, userEmail: string, userId: string, tenantId: string){
        var that = this;
        let queryParams = {};
        if(req.params.id === 'all'){
            queryParams = {$or:[{folderId : null}, {sharedFile: true}], shared_with: that.sha256(userEmail), tenantId : tenantId}
        }else{
            queryParams = {folderId : req.params.id , $or: [ { userId: userId }, { shared_with: that.sha256(userEmail)}], tenantId : tenantId}
        }
        await req.app.locals.file.find(queryParams, {userId:0, tenantId: 0, __v:0, nameHash: 0}).then(result=> {
            if(result && result.length > 0){
                this.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
            }else{
                this.sendResponse(new BasicResponse(Status.SUCCESS, []), req, res);
            }
        }).catch(err =>{
                this.sendResponse(new BasicResponse(Status.ERROR), req, res);
        })
    }


    public async fetchSharedFolderFiles(req, res: Response, tenantId: string){
        
        await req.app.locals.file.find({folderId: req.params.id, tenantId : tenantId}, {userId:0, tenantId: 0, __v:0, nameHash: 0}).then(result=> {
            if(result && result.length > 0){
                this.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
            }else{
                this.sendResponse(new BasicResponse(Status.SUCCESS, []), req, res);
            }
        }).catch(err =>{
                this.sendResponse(new BasicResponse(Status.ERROR), req, res);
        })
    }


    async fetchUserFiles(folderId: string, userEmail, userId: string, tenantId: string, req: Request, res: Response){
        var that = this;
        let queryParams = {};
        if(folderId == null){
            queryParams = {folderId: null, userId: userId, tenantId : tenantId }
        }else{
            queryParams = {folderId : folderId , $or: [ { userId: userId }, { shared_with: that.sha256(userEmail)}], tenantId : tenantId}
        }
        await req.app.locals.file.find(queryParams, {userId:0, tenantId: 0, __v:0, nameHash: 0}).then(result=> {
            if(result && result.length > 0){
                this.sendResponse(new BasicResponse(Status.SUCCESS, result), req, res);
            }else{
                this.sendResponse(new BasicResponse(Status.SUCCESS, []), req, res);
            }
        }).catch(err =>{
                this.sendResponse(new BasicResponse(Status.ERROR), req, res);
        }   )
    }



    // async validateExistingFileDetail(dto: UpdateFileNameDTO) {
    //     let errors = validateSync(dto, { validationError: { target: false }} );
    //     if(this.hasErrors(errors)){
    //         return errors;
    //     }
 
    //     if (this.checkOriginalFileName(dto)) {
    //         errors.push(this.getEmptyOriginalFileNameError());
    //     }
 
    //     return errors;
    // }

    // checkOriginalFileName(dto: UpdateFileNameDTO): any {
    //     return (dto.originalFileName === undefined || dto.originalFileName.length === 0 || dto.originalFileName === ""|| dto.originalFileName === null)
    // }
 


    

    async findfilesWithSameNameForUser(file, fileName, userId, tenantId, folderId?) {
        var found = 0;
        await file.countDocuments({ 'nameHash' : this.sha256(fileName), 'folderId': folderId, 'tenantId' : tenantId, 'userId': userId }).then(e => {
            found = e;
        });
        return found;
 
    }


    async verifyParentFolderId(parentFolderId: string, userId: string, tenantId: string, userEmail, req, res, next){
        if(parentFolderId){
            let existingFile = null;
            let that =this
            await req.app.locals.folder.findOne({_id: parentFolderId, $or: [ { userId: userId }, { shared_with: that.sha256(userEmail)}], tenantId: tenantId}).then(result => {
                if(result){
                    existingFile = result;
                }
            }).catch(err => {});
    
            if(existingFile == null) {
                this.sendResponse(new BasicResponse(Status.NOT_FOUND),req, res);
                return next();
            }
        }
    } 
    

}
 