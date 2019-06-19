"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Status;
(function (Status) {
    Status[Status["SUCCESS"] = 0] = "SUCCESS";
    Status[Status["CREATED"] = 1] = "CREATED";
    Status[Status["FAILED_VALIDATION"] = 2] = "FAILED_VALIDATION";
    Status[Status["ERROR"] = 3] = "ERROR";
    Status[Status["NOT_FOUND"] = 4] = "NOT_FOUND";
    Status[Status["PRECONDITION_FAILED"] = 5] = "PRECONDITION_FAILED";
    Status[Status["SUCCESS_NO_CONTENT"] = 6] = "SUCCESS_NO_CONTENT";
    Status[Status["FORBIDDEN"] = 7] = "FORBIDDEN";
})(Status = exports.Status || (exports.Status = {}));
