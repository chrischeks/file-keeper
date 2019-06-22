"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const basicresponse_1 = require("../dtos/outputs/basicresponse");
const statusenums_1 = require("../dtos/enums/statusenums");
const crypto = require("crypto");
const qs = require('qs');
const axios = require("axios");
const fs = require('fs');
class BaseService {
    hasErrors(errors) {
        return !(errors === undefined || errors.length == 0);
    }
    sha256(data) {
        return crypto.createHash("sha256").update(data, "utf8").digest("base64");
    }
    sendError(req, res, next, data) {
        var dat = {
            status: 400,
            data: data
        };
        res.status(401);
        res.send(dat);
    }
    sendResponse(serviceResponse, req, res) {
        var response = {
            status: serviceResponse.getStatusString(),
            data: serviceResponse.getData()
        };
        res.status(this.getHttpStatus(serviceResponse.getStatusString()));
        console.log('responding with', response);
        res.json(response);
    }
    sendException(ex, serviceResponse, req, res, next) {
        console.log(chalk.default.blue.bgRed.bold(ex));
        this.sendResponse(serviceResponse, req, res);
    }
    removeGenericFieldsAndReturn(result) {
        result.__v = null;
        result.userId = null;
        result.tenantId = null;
        if (result.nameHash !== undefined) {
            result.nameHash = null;
        }
        return result;
    }
    getHttpStatus(status) {
        switch (status) {
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
    logInfo(info) {
        console.log(chalk.default.blue.bgGreen.bold(info));
    }
    logError(error) {
        console.log(chalk.default.blue.bgRed.bold(error));
    }
    getDuplicateError(fileName) {
        return { 'property': 'fileName', 'constraints': { 'unique': 'must be unique' }, value: fileName };
    }
    getFolderDuplicateError(folderName) {
        return { 'property': 'folderName', 'constraints': { 'unique': 'must be unique' }, value: folderName };
    }
    getUnchangedNameError(fileName) {
        return { 'property': 'fileName', 'constraints': { 'unique': 'File Name is Unchanged' }, value: fileName };
    }
    getEmptyOriginalFileNameError() {
        return { 'property': 'originalFileName', 'constraints': { 'required': 'originalFileName can not be empty' }, value: null };
    }
    getEmptyFolderNameError() {
        return { 'property': 'folderName', 'constraints': { 'required': 'folderName can not be empty' }, value: null };
    }
    getRecipientRequiredWhenShareTypePrivateError() {
        return { 'property': 'recipient', 'constraints': { 'required': 'Recipient is required' }, value: null };
    }
    getFileAlreadySharedWithRecipientError(recipient) {
        return { 'property': 'recipient', 'constraints': { 'required': 'You have already shared this file with this recipient' }, value: recipient };
    }
    getInvalidFolderError() {
        return { 'property': 'parentFolder', 'constraints': { 'invalid': 'Selected folder is invalid' }, value: null };
    }
    sendMail(req, res, next, recipients, senderName, senderEmail, fileName) {
        const content = fs.readFileSync(process.env.FILE_SHARE_EMAIL_CONTENT, 'utf8');
        const view = { data: { senderName: senderName, senderEmail: senderEmail, fileName: fileName } };
        let token = (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : null;
        let payload = new URLSearchParams();
        payload.append("subject", "Quabbly Sharing");
        recipients.forEach(element => {
            payload.append("recipient", element);
        });
        axios({
            url: process.env.EMAIL_URL,
            method: "post",
            data: payload,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                "Authorization": `Bearer ${token}`
            }
        });
    }
    verifyRecipient(existingDoc, req, response, next, recipients, userFirstname, userEmail, docName) {
        let token = (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : null;
        axios({
            url: process.env.USER_URL + '/v1/users/all',
            method: "get",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(result => {
            if (result) {
                const invalidEmail = this.resolveResponse(result, recipients);
                if (invalidEmail.length > 0) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.PRECONDITION_FAILED, [invalidEmail.length + " recipient(s) " + "(" + invalidEmail + ")" + " not under this tenant"]), req, response);
                }
                else {
                    this.saveShareDetails(existingDoc, req, response, next, recipients, userFirstname, userEmail, docName);
                }
            }
        }).catch(err => { });
    }
    allUsers(existingDoc, req, response, next, userFirstname, userEmail, docName) {
        let token = (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : null;
        axios({
            url: process.env.USER_URL + '/v1/users/all',
            method: "get",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then((result) => __awaiter(this, void 0, void 0, function* () {
            if (result) {
                const recipients = yield this.getEmails(result, userEmail);
                var that = this;
                let shared_with = recipients.map(function (e) {
                    return that.sha256(e);
                });
                let sharing = { baseUrl: "https://www.photizzo.com", shareType: "private", secret_shared_with: recipients };
                existingDoc.secret.sharing.push(sharing);
                existingDoc.shared_with = yield this.merge(existingDoc.shared_with, shared_with);
                this.saveShareDetails(existingDoc, req, response, next, recipients, userFirstname, userEmail, docName);
            }
        })).catch(err => { });
    }
    getEmails(result, userEmail) {
        let usersEmail = [];
        for (let i = 0; i < result.data.data.length; i++) {
            if (result.data.data[i].email != userEmail) {
                usersEmail.push(result.data.data[i].email);
            }
        }
        return usersEmail;
    }
    resolveResponse(result, recipients) {
        let usersEmail = [];
        let invalidEmail = [];
        for (let i = 0; i < result.data.data.length; i++) {
            usersEmail.push(result.data.data[i].email);
            if (i == result.data.data.length - 1) {
                for (let j = 0; j < recipients.length; j++) {
                    if (usersEmail.indexOf(recipients[j]) === -1) {
                        invalidEmail.push(recipients[j]);
                    }
                    if (j == recipients.length - 1) {
                        return invalidEmail;
                    }
                }
            }
        }
    }
    saveShareDetails(existingDoc, req, res, next, recipients, userName, userEmail, docName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield existingDoc.save().then(result => {
                if (result) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, ["The share was successful"]), req, res);
                }
                else {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.FAILED_VALIDATION), req, res);
                }
            }).catch(err => { });
            this.sendMail(req, res, next, recipients, userName, userEmail, docName);
        });
    }
    merge(existingRecipients, newRecipients) {
        return __awaiter(this, void 0, void 0, function* () {
            var hash = {};
            if (!existingRecipients || existingRecipients.length == 0) {
                existingRecipients = [];
            }
            return existingRecipients.concat(newRecipients).filter(function (val) {
                return hash[val] ? 0 : hash[val] = 1;
            });
        });
    }
    processShareToAll(req, res, next, userId, tenantId, userFirstname, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let existingDoc = null;
                let nameOfDoc = null;
                if (req.body.doc === "file") {
                    yield req.app.locals.file.findOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
                        if (result) {
                            existingDoc = result;
                            nameOfDoc = existingDoc.secret.originalFileName;
                        }
                    }).catch(err => { });
                }
                else if (req.body.doc === "folder") {
                    yield req.app.locals.folder.findOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
                        if (result) {
                            existingDoc = result;
                            nameOfDoc = existingDoc.secret.originalFileName;
                        }
                    }).catch(err => { });
                }
                else {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.NOT_FOUND), req, res);
                    return next();
                }
                this.allUsers(existingDoc, req, res, next, userFirstname, userEmail, nameOfDoc);
            }
            catch (ex) {
                console.log(ex);
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR), req, res, next);
            }
        });
    }
}
exports.BaseService = BaseService;
