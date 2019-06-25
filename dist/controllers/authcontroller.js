"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basecontroller_1 = require("./basecontroller");
const authservice_1 = require("../services/authservice");
class AuthController extends basecontroller_1.BaseController {
    loadRoutes(prefix, router) {
        this.registerUser(prefix, router);
        this.loginUser(prefix, router);
    }
    registerUser(prefix, router) {
        router.post(prefix + "/register", (req, res, next) => {
            new authservice_1.AuthService().registerUser(req, res, next);
        });
    }
    loginUser(prefix, router) {
        router.post(prefix + "/login", (req, res, next) => {
            new authservice_1.AuthService().loginUser(req, res, next);
        });
    }
}
exports.AuthController = AuthController;
