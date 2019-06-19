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
const baseservice_1 = require("./baseservice");
const basicresponse_1 = require("../dtos/outputs/basicresponse");
const statusenums_1 = require("../dtos/enums/statusenums");
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
class FileService extends baseservice_1.BaseService {
    processFileupload(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var savedFiles = [];
            for (var i = 0; i < req.files.length; i++) {
                let file = req.files[i];
                let uploadFileModel = yield req.app.locals.file({ secret: { originalFileName: file.originalname, fileName: file.filename, fileSize: file.size, fileExtension: file.mimetype }, nameHash: this.sha256(file.filename) });
                yield uploadFileModel.save().then(result => {
                    if (!result) {
                        return this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.FAILED_VALIDATION), req, res);
                    }
                    else {
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
                        });
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
            return this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, savedFiles), req, res);
        });
    }
    processDeleteFile(req, res, next, userId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let existingFile = null;
                yield req.app.locals.file.findOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
                    if (result) {
                        existingFile = result;
                    }
                }).catch(err => { });
                if (existingFile == null) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.FAILED_VALIDATION, ['Sorry you cannot delete this file']), req, res);
                    return next();
                }
                let dir = process.env.UPLOAD_PATH + '/' + existingFile.secret.fileName;
                yield unlinkAsync(dir);
                yield req.app.locals.file.deleteOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
                    if (result) {
                        this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS_NO_CONTENT), req, res);
                    }
                }).catch(err => { });
            }
            catch (ex) {
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, ex), req, res, next);
            }
        });
    }
    processListFiles(req, res, next, userId, tenantId, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let folderId = req.query.id;
                yield this.verifyParentFolderId(folderId, userId, tenantId, userEmail, req, res, next);
                yield this.fetchUserFiles(folderId, userEmail, userId, tenantId, req, res);
            }
            catch (ex) {
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR), req, res, next);
            }
        });
    }
    downloadUserFile(req, res, next, userId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let existingFile = null;
                yield req.app.locals.file.findOne({ _id: req.params.id, userId: userId, tenantId: tenantId }).then(result => {
                    if (result) {
                        existingFile = result;
                    }
                }).catch(err => { });
                if (existingFile == null) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.NOT_FOUND), req, res);
                    return next();
                }
                let dir = process.env.UPLOAD_PATH + '/' + existingFile.secret.fileName;
                res.download(dir, existingFile.secret.originalFileName);
            }
            catch (ex) {
                console.log(ex);
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, ex), req, res, next);
            }
        });
    }
    viewUserFile(req, res, next, userId, tenantId, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let existingFile = null;
                var that = this;
                yield req.app.locals.file.findOne({ _id: req.params.id, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId }).then(result => {
                    if (result) {
                        existingFile = result;
                    }
                }).catch(err => { });
                if (existingFile == null) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.NOT_FOUND), req, res);
                    return next();
                }
                let dir = process.env.UPLOAD_PATH + '/';
                var options = {
                    root: dir,
                    dotfiles: 'deny',
                    headers: {
                        'x-timestamp': Date.now(),
                        'x-sent': true
                    }
                };
                var fileName = existingFile.secret.fileName;
                res.sendFile(fileName, options);
            }
            catch (ex) {
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, ex), req, res, next);
            }
        });
    }
    publicFileDownload(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let existingFile = null;
                yield req.app.locals.file.findById(req.params.id).then(result => {
                    if (result) {
                        existingFile = result;
                    }
                }).catch(err => { });
                if (existingFile == null) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.NOT_FOUND), req, res);
                    return next();
                }
                let dir = process.env.PUBLIC_UPLOAD_PATH + '/' + existingFile.secret.fileName;
                res.download(dir, existingFile.secret.originalFileName);
            }
            catch (ex) {
                console.log(ex);
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, ex), req, res, next);
            }
        });
    }
    sharedWithMe(req, res, next, userEmail, userId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            var that = this;
            let queryParams = {};
            if (req.params.id === 'all') {
                queryParams = { $or: [{ folderId: null }, { sharedFile: true }], shared_with: that.sha256(userEmail), tenantId: tenantId };
            }
            else {
                queryParams = { folderId: req.params.id, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId };
            }
            yield req.app.locals.file.find(queryParams, { userId: 0, tenantId: 0, __v: 0, nameHash: 0 }).then(result => {
                if (result && result.length > 0) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, result), req, res);
                }
                else {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, []), req, res);
                }
            }).catch(err => {
                this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR), req, res);
            });
        });
    }
    fetchSharedFolderFiles(req, res, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield req.app.locals.file.find({ folderId: req.params.id, tenantId: tenantId }, { userId: 0, tenantId: 0, __v: 0, nameHash: 0 }).then(result => {
                if (result && result.length > 0) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, result), req, res);
                }
                else {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, []), req, res);
                }
            }).catch(err => {
                this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR), req, res);
            });
        });
    }
    fetchUserFiles(folderId, userEmail, userId, tenantId, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var that = this;
            let queryParams = {};
            if (folderId == null) {
                queryParams = { folderId: null, userId: userId, tenantId: tenantId };
            }
            else {
                queryParams = { folderId: folderId, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId };
            }
            yield req.app.locals.file.find(queryParams, { userId: 0, tenantId: 0, __v: 0, nameHash: 0 }).then(result => {
                if (result && result.length > 0) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, result), req, res);
                }
                else {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, []), req, res);
                }
            }).catch(err => {
                this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR), req, res);
            });
        });
    }
    findfilesWithSameNameForUser(file, fileName, userId, tenantId, folderId) {
        return __awaiter(this, void 0, void 0, function* () {
            var found = 0;
            yield file.countDocuments({ 'nameHash': this.sha256(fileName), 'folderId': folderId, 'tenantId': tenantId, 'userId': userId }).then(e => {
                found = e;
            });
            return found;
        });
    }
    verifyParentFolderId(parentFolderId, userId, tenantId, userEmail, req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (parentFolderId) {
                let existingFile = null;
                let that = this;
                yield req.app.locals.folder.findOne({ _id: parentFolderId, $or: [{ userId: userId }, { shared_with: that.sha256(userEmail) }], tenantId: tenantId }).then(result => {
                    if (result) {
                        existingFile = result;
                    }
                }).catch(err => { });
                if (existingFile == null) {
                    this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.NOT_FOUND), req, res);
                    return next();
                }
            }
        });
    }
}
exports.FileService = FileService;
