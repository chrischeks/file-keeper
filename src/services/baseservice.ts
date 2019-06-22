import { Validator } from "validator.ts/Validator";
import chalk = require('chalk');
import { BasicResponse } from "../dtos/outputs/basicresponse";
import { Status } from "../dtos/enums/statusenums";
import crypto = require('crypto');
import { NextFunction, Request, Response } from "express";
// const qs = require('qs') ;
// import * as http from "http"
// // import * as mustache from "mustache"
// const axios = require("axios");
// const fs = require('fs')


export class BaseService {

    protected errors;

    protected hasErrors(errors: any) : boolean {
        return !(errors === undefined || errors.length == 0)
    }

    /* protected returnException(ex: any): BasicResponse {
        console.log(chalk.default.blue.bgRed.bold(ex));
        return new BasicResponse(Status.ERROR);
    } */

    protected sha256(data) {
        return crypto.createHash("sha256").update(data, "utf8").digest("base64");
    }

    protected sendError(req: Request, res: Response, next : NextFunction, data?: Object) {

        var dat = {
            status : 400,
            data: data
        }
        res.status(401);
        res.send(dat);
        
    }

    public sendResponse(serviceResponse: BasicResponse, req: Request, res: Response): any {
        var response = {
          status : serviceResponse.getStatusString() ,
          data: serviceResponse.getData()
        }
    
        res.status(this.getHttpStatus(serviceResponse.getStatusString()));
    
        console.log('responding with', response);
        res.json(response);
    }

    protected sendException(ex, serviceResponse: BasicResponse, req: Request, res: Response, next: NextFunction): any {
        console.log(chalk.default.blue.bgRed.bold(ex));
        this.sendResponse(serviceResponse, req, res);
    }

    protected removeGenericFieldsAndReturn(result: any): any {
        result.__v = null;
        result.userId = null;
        result.tenantId = null;
        if(result.nameHash !== undefined){
            result.nameHash = null;
        }

        return result;
    }
    
    private getHttpStatus(status: string): number {
        switch(status){
            case 'SUCCESS':
                return 200;
            case 'CREATED':
                return 201;
            case 'NOT_FOUND':
                return 404;
            case 'FAILED_VALIDATION':
                return 400;
            case 'CONFLICT':
                return 409;
            case 'FORBIDDEN':
                return 403;
            case 'PRECONDITION_FAILED':
                return 412;
            case 'SUCCESS_NO_CONTENT':
                return 204;
            default:
                return 500;
        }
    }
    
    protected logInfo(info: string){
        console.log(chalk.default.blue.bgGreen.bold(info));
    }

    protected logError(error: string){
        console.log(chalk.default.blue.bgRed.bold(error));
    }

    protected getDuplicateError(fileName: string): any {
        return {'property' : 'fileName', 'constraints' : {'unique' : 'must be unique'}, value : fileName };
    }

    protected getFolderDuplicateError(folderName: string): any {
        return {'property' : 'folderName', 'constraints' : {'unique' : 'must be unique'}, value : folderName };
    }

    protected getUnchangedNameError(fileName: string): any {
        return {'property' : 'fileName', 'constraints' : {'unique' : 'File Name is Unchanged'}, value : fileName };
    }

    protected getEmptyOriginalFileNameError(): any {
        return {'property' : 'originalFileName', 'constraints' : {'required' : 'originalFileName can not be empty'}, value : null };
    }

    protected getEmptyFolderNameError(): any {
        return {'property' : 'folderName', 'constraints' : {'required' : 'folderName can not be empty'}, value : null };
    }

    protected getRecipientRequiredWhenShareTypePrivateError(): any {
        return {'property' : 'recipient', 'constraints' : {'required' : 'Recipient is required'}, value : null };
    }

    protected getFileAlreadySharedWithRecipientError(recipient: string): any {
        return {'property' : 'recipient', 'constraints' : {'required' : 'You have already shared this file with this recipient'}, value : recipient };
    }
    protected getInvalidFolderError(): any {
        return {'property' : 'parentFolder', 'constraints' : {'invalid' : 'Selected folder is invalid'}, value : null };
    }



    protected sendMail(req, res: Response, next: NextFunction, recipients, senderName, senderEmail, fileName) {
        // const content = fs.readFileSync(process.env.FILE_SHARE_EMAIL_CONTENT,'utf8');
        const view = {data:{senderName: senderName, senderEmail:senderEmail, fileName: fileName}}
        // const output = mustache.render(content, view);

        
        let token = (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : null;
       let payload = new URLSearchParams();
       payload.append("subject", "Quabbly Sharing")
    //    payload.append("htmlContent", output)
       recipients.forEach(element => {
           payload.append("recipient", element)
       });


        // axios({
        //     url: process.env.EMAIL_URL,
        //     method: "post",
        //     data: payload,
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        //         "Authorization" : `Bearer ${token}`
        //     } 
        // })
    }



    protected verifyRecipient(existingDoc, req: Request, response: Response, next: NextFunction, recipients, userFirstname, userEmail, docName) {
        let token = (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : null;      
        // axios({
        //     url: process.env.USER_URL + '/v1/users/all',
        //     method: "get",
        //     headers: {
        //         "Authorization" : `Bearer ${token}`
        //     } 
        // }).then(result =>{
        //     if(result){
        //         const invalidEmail = this.resolveResponse(result, recipients);
        //         if (invalidEmail.length > 0) {
        //             this.sendResponse(new BasicResponse(Status.PRECONDITION_FAILED, [invalidEmail.length + " recipient(s) " + "(" + invalidEmail + ")" + " not under this tenant"]), req, response);
        //         } else {
        //             this.saveShareDetails(existingDoc, req, response, next, recipients, userFirstname, userEmail, docName)
        //         }
        //     }            
        // }).catch(err=>{ });     

    }


    protected allUsers(existingDoc, req: Request, response: Response, next: NextFunction, userFirstname, userEmail, docName) {
        let token = (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : null;
        // axios({
        //     url: process.env.USER_URL + '/v1/users/all',
        //     method: "get",
        //     headers: {
        //         "Authorization": `Bearer ${token}`
        //     }
        // }).then(async result => {
        //     if (result) {
        //         const recipients = await this.getEmails(result, userEmail);
        //         var that = this;
        //         let shared_with = recipients.map(function (e) {
        //             return that.sha256(e);
        //         });
        //         let sharing = { baseUrl: "https://www.photizzo.com", shareType: "private", secret_shared_with: recipients };
        //         existingDoc.secret.sharing.push(sharing);
        //         existingDoc.shared_with = await this.merge(existingDoc.shared_with, shared_with);
        //         this.saveShareDetails(existingDoc, req, response, next, recipients, userFirstname, userEmail, docName)
        //     }
        // }).catch(err => { });

    }



    protected getEmails(result, userEmail): string[] {
        let usersEmail = [];
        for (let i = 0; i < result.data.data.length; i++) {
            if (result.data.data[i].email != userEmail) {
                usersEmail.push(result.data.data[i].email)
            }
        }
        return usersEmail
    }


    private resolveResponse(result, recipients) {
        let usersEmail = [];
        let invalidEmail = [];
        for (let i = 0; i < result.data.data.length; i++) {
            usersEmail.push(result.data.data[i].email)
            if (i == result.data.data.length - 1) {
                for (let j = 0; j < recipients.length; j++) {
                    if (usersEmail.indexOf(recipients[j]) === -1) {
                        invalidEmail.push(recipients[j])
                    }
                    if (j == recipients.length - 1) {
                        return invalidEmail;
                    }
                }
            }
        }
    }



    
    async saveShareDetails(existingDoc, req: Request, res: Response, next:NextFunction, recipients: string[], userName: string, userEmail: string, docName: string) {
        await existingDoc.save().then(result => {
            if (result) {
                this.sendResponse(new BasicResponse(Status.SUCCESS, ["The share was successful"]),req, res);   
            }else{
                this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION), req, res)
            }
            
        }).catch(err => { });
    
        this.sendMail(req, res, next, recipients, userName, userEmail, docName)
    }



    async merge(existingRecipients, newRecipients) {
        var hash = {};
        if(!existingRecipients || existingRecipients.length == 0){
            existingRecipients = [];
        }
        return existingRecipients.concat(newRecipients).filter(function (val) {
            return hash[val] ? 0 : hash[val] = 1;
        });
    }



    public async processShareToAll(req: Request, res: Response, next: NextFunction, userId: string, tenantId: string, userFirstname: string, userEmail: string) {
        try {
            let existingDoc = null;
            let nameOfDoc = null
            if (req.body.doc === "file") {
                await req.app.locals.file.findOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
                    if (result) {
                        existingDoc = result;
                        nameOfDoc = existingDoc.secret.originalFileName
                    }
                }).catch(err => { });
            } else if (req.body.doc === "folder") {
                await req.app.locals.folder.findOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
                    if (result) {
                        existingDoc = result;
                        nameOfDoc = existingDoc.secret.originalFileName
                    }
                }).catch(err => { });
            } else {
                this.sendResponse(new BasicResponse(Status.NOT_FOUND), req, res);
                return next();
            }

            this.allUsers(existingDoc, req, res, next, userFirstname, userEmail, nameOfDoc)

        } catch (ex) {
            console.log(ex);
            this.sendException(ex, new BasicResponse(Status.ERROR), req, res, next);
        }

    }
    

}