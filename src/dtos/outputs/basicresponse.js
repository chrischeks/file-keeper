"use strict";
exports.__esModule = true;
var statusenums_1 = require("../enums/statusenums");
var BasicResponse = /** @class */ (function () {
    function BasicResponse(status, data) {
        this.status = status;
        this.data = data;
    }
    BasicResponse.prototype.getData = function () {
        return this.data;
    };
    BasicResponse.prototype.getStatusString = function () {
        return statusenums_1.Status[this.status];
    };
    return BasicResponse;
}());
exports.BasicResponse = BasicResponse;
