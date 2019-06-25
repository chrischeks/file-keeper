import { NextFunction, Request, Response, Router } from "express";
import { BaseController } from "./basecontroller";
import { AuthService } from '../services/authservice';


export class AuthController extends BaseController {

  public loadRoutes(prefix: String, router: Router) {

    this.registerUser(prefix, router);
    this.loginUser(prefix, router);
    // this.listUsers(prefix, router);
    // this.confirmUser(prefix, router);
    // this.resendLink(prefix, router);
    // this.forgotPassword(prefix, router);
    // this.sendResetPasswordLink(prefix, router);
    // this.listOneUser(prefix, router);
    // this.verifyReferralId(prefix, router);
    // this.updateUser(prefix, router);

  }


  public registerUser(prefix: String, router: Router): any {
    router.post(prefix + "/register", (req: Request, res: Response, next: NextFunction) => {
      new AuthService().registerUser(req, res, next);

    });
  }


//   public verifyReferralId(prefix: String, router: Router): any {
//     router.post(prefix + "/verify_id/:referralId", (req: Request, res: Response, next: NextFunction) => {
//       new AuthService().processVerifyId(req, res, next);

//     });
//   }

  public loginUser(prefix: String, router: Router): any {
    router.post(prefix + "/login", (req: Request, res: Response, next: NextFunction) => {
      new AuthService().loginUser(req, res, next);

    });
  }


//   public confirmUser(prefix: String, router: Router): any {
//     router.post(prefix + "/confirmation", (req: Request, res: Response, next: NextFunction) => {
//       new AuthService().confirmUser(req, res, next);

//     });
//   }


//   public resendLink(prefix: String, router: Router): any {
//     router.post(prefix + "/resend", (req: Request, res: Response, next: NextFunction) => {
//       new AuthService().processResendToken(req, res, next);

//     });
//   }


//   public updateUser(prefix: String, router: Router): any {
//     router.put(prefix + "/update/:id", [this.authorizeUser.bind(this)], (req: Request, res: Response, next: NextFunction) => {
//       new AuthService().processUpdateUser(req, res, next);

//     });
//   }


//   public listUsers(prefix: String, router: Router): any {
//     router.get(prefix + "/users", [this.authorize.bind(this)], (req: Request, res: Response, next: NextFunction) => {

//       new AuthService().listUsers(req, res, next);
//     });
//   }


//   public forgotPassword(prefix: String, router: Router): any {
//     router.post(prefix + "/reset_password", (req: Request, res: Response, next: NextFunction) => {

//       new AuthService().processResetPassword(req, res, next);
//     });
//   }

//   public sendResetPasswordLink(prefix: String, router: Router): any {
//     router.post(prefix + "/send_link", (req: Request, res: Response, next: NextFunction) => {

//       new AuthService().sendResetPasswordLink(req, res, next);
//     });
//   }

//   public listOneUser(prefix: String, router: Router): any {
//     router.get(prefix + "/users/:userId", [this.authorizeUser.bind(this)], (req: Request, res: Response, next: NextFunction) => {

//       new AuthService().listOneUser(req, res, next);
//     });
//   }


//   public authorize(req: Request, res: Response, next: NextFunction) {
//     if (!this.authorized(req, res, next)) {
//       this.sendError(req, res, next, this.notAuthorized);
//     } else {
//       next();
//     }

//   }

//   public authorizeUser(req: Request, res: Response, next: NextFunction) {
//     if (!this.authorizedReferral(req, res, next)) {
//       this.sendError(req, res, next, this.notAuthorized);
//     } else {
//       next();
//     }

//   }


//   constructor() {
//     super();
//   }
}