"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statusenums_1 = require("../enums/statusenums");
class BasicResponse {
    constructor(status, data) {
        this.status = status;
        this.data = data;
    }
    getData() {
        return this.data;
    }
    getStatusString() {
        return statusenums_1.Status[this.status];
    }
}
exports.BasicResponse = BasicResponse;
