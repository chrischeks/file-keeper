"use strict";
exports.__esModule = true;
var jsonwebtoken_1 = require("jsonwebtoken");
var basicresponse_1 = require("../dtos/outputs/basicresponse");
var statusenums_1 = require("../dtos/enums/statusenums");
/**
 * Constructor
 *
 * @class BaseController
 */
var BaseController = /** @class */ (function () {
    function BaseController() {
        this.systemErrorMsg = { "message": "Sorry your request could not be completed at the moment" };
        this.invalidCredentials = { 'message': 'Invalid Credentials' };
        this.notAuthorized = { 'message': 'You are not authorized to access this resource' };
        this.itemNotFound = { 'message': 'Not found' };
        this.noResults = { 'message': 'No results available' };
        this.start = 0;
        this.limit = 20;
        this.user_firstname = null;
        this.user_lastname = null;
        this.user_roles = null;
        this.user_email = null;
        this.user_tenantId = null;
        this.user_id = null;
    }
    BaseController.prototype.initPagination = function (req, post) {
        var obj = post ? req.body : req.query;
        if (obj.start && !isNaN(obj.start)) {
            this.start = +obj.start;
        }
        if (obj.limit && !isNaN(obj.limit)) {
            this.limit = +obj.limit;
        }
    };
    BaseController.prototype.sendResponse = function (serviceResponse, req, res, next) {
        var response = {
            status: serviceResponse.getStatusString(),
            data: serviceResponse.getData()
        };
        res.status(this.getHttpStatus(serviceResponse.getStatusString()));
        console.log('responding with', response);
        res.json(response);
        next();
    };
    BaseController.prototype.getHttpStatus = function (status) {
        switch (status) {
            case 'SUCCESS':
                return 200;
            case 'CREATED':
                return 201;
            case 'FAILED_VALIDATION':
                return 400;
            default:
                return 500;
        }
    };
    BaseController.prototype.sendError = function (req, res, next, data) {
        var dat = {
            status: "error",
            data: data
        };
        res.status(401);
        res.send(dat);
    };
    BaseController.prototype.authorized = function (req, res, next) {
        var token = (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : req.query.token;
        if (token === null) {
            console.log('cant find header');
            return false;
        }
        try {
            var publicKey = JSON.parse("\"" + process.env.JWT_PUBLIC_KEY + "\""); //https://github.com/motdotla/dotenv/issues/218
            var user = jsonwebtoken_1.verify(token, publicKey, { algorithms: ['RS256'], issuer: process.env.JWT_ISSUER });
            this.setUserVariables(user);
            return true;
        }
        catch (err) {
            console.error('Authorization error: ', err.message);
            return false;
        }
    };
    BaseController.prototype.setUserVariables = function (user) {
        this.user_firstname = user.firstname;
        this.user_lastname = user.lastname;
        this.user_email = user.email;
        this.user_roles = user.roles;
        this.user_tenantId = user.organisationId;
        this.user_id = user.userId;
        console.log(this.user_id, 'jjjjj');
    };
    BaseController.prototype.authorize = function (req, res, next) {
        if (!this.authorized(req, res, next)) {
            this.sendError(req, res, next, this.notAuthorized);
        }
        else {
            next();
        }
    };
    BaseController.prototype.hasUploadError = function (uploadError) {
        return uploadError != null;
    };
    BaseController.prototype.getUploadError = function (multi, req, err) {
        if (err && (err.code === 'LIMIT_FILE_SIZE')) {
            return new basicresponse_1.BasicResponse(statusenums_1.Status.FAILED_VALIDATION, { field: "file", errorMessage: "file must not exceed 1MB" });
        }
        var uploadedFiles = multi ? req.files : req.file;
        if ((err && (err.code === 'LIMIT_UNEXPECTED_FILE')) || !uploadedFiles) {
            return new basicresponse_1.BasicResponse(statusenums_1.Status.FAILED_VALIDATION, { field: "file", errorMessage: "no file uploaded" });
        }
        return null;
    };
    return BaseController;
}());
exports.BaseController = BaseController;
