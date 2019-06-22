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
const renamefiledto_1 = require("../dtos/inputs/renamefiledto");
const class_validator_1 = require("class-validator");
const cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class FileService extends baseservice_1.BaseService {
    processFileupload(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, req.files), req, res);
            }
            catch (error) {
                return this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, error), req, res);
            }
        });
    }
    processDeleteFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const public_id = req.params.id;
                const that = this;
                cloudinary.v2.uploader.destroy(public_id, function (error, result) {
                    if (result) {
                        that.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, result), req, res);
                    }
                    else {
                        that.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, error), req, res);
                    }
                });
            }
            catch (ex) {
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, ex), req, res, next);
            }
        });
    }
    processListFiles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const that = this;
                cloudinary.v2.api.resources({ type: 'upload', max_results: 60 }, function (error, result) {
                    if (error) {
                        that.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR), req, res);
                    }
                    else {
                        that.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, result), req, res);
                    }
                });
            }
            catch (ex) {
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR), req, res, next);
            }
        });
    }
    updateFileName(req, res, next, userId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const to_public_id = req.body.to_public_id;
                let dto = new renamefiledto_1.RenameFileDTO(to_public_id);
                let errors = yield this.validateExistingFileDetail(dto);
                if (this.hasErrors(errors)) {
                    yield this.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.FAILED_VALIDATION, errors), req, res);
                    return next();
                }
                const from_public_id = req.body.from_public_id;
                const that = this;
                cloudinary.v2.uploader.rename(from_public_id, to_public_id, function (error, result) {
                    if (result) {
                        that.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.SUCCESS, result), req, res);
                    }
                    else {
                        that.sendResponse(new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, error), req, res);
                    }
                });
            }
            catch (ex) {
                this.sendException(ex, new basicresponse_1.BasicResponse(statusenums_1.Status.ERROR, ex), req, res, next);
            }
        });
    }
    validateExistingFileDetail(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            let errors = class_validator_1.validateSync(dto, { validationError: { target: false } });
            if (this.hasErrors(errors)) {
                return errors;
            }
            return errors;
        });
    }
}
exports.FileService = FileService;
