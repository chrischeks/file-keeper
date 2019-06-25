import { BaseService } from "./baseservice";
import { BasicResponse } from "../dtos/outputs/basicresponse";
import { Status } from '../dtos/enums/statusenums';
import { NextFunction, Request, Response } from "express";
import { validateSync } from "class-validator";
import { RegisterUserDTO } from "../dtos/inputs/registeruserdto";
import { IRegisterModel } from '../models/register';
// import uuid = require('uuid');
import { compareSync, hashSync } from "bcrypt-nodejs";
// import { LoginUserDTO } from '../dto/input/loginuserdto';
import { ITokenModel } from '../models/token';
// import { ConfirmUserDTO } from '../dto/input/confirmuserdto';
// import { ResendLinkDTO } from '../dto/input/resendtokendto';
// import { ForgotPasswordDTO } from '../dto/input/forgotpassword';
// import { ResetPasswordDTO } from '../dto/input/resetpassworddto';
// import { ObjectID } from "bson";
// import { UpdateUserDTO } from '../dto/input/updateuserdto';
import { LoginUserDTO } from '../dtos/inputs/loginUserDTO';
// import SGmail = require('@sendgrid/mail');


export class AuthService extends BaseService {

    // public async processUpdateUser(req: Request, res: Response, next: NextFunction) {
    //     const { firstName, lastName, phoneNumber, accountName, accountNumber, bankName } = req.body;
    //     const { id } = req.params
    //     let dto = new UpdateUserDTO(firstName, lastName, phoneNumber, id, accountName, accountNumber, bankName);
    //     let errors = await this.validateDetails(dto, req);
    //     if (this.hasErrors(errors)) {
    //         this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), res);
    //         return next();
    //     }
    //     await this.updateUserData(req, res, next, dto)

    // }

    // public async updateUserData(req, res, next, dto) {
    //     let existingRecord = null
    //     let responseObj = null

    //     await req.app.locals.register.findOne({ _id: dto.id, isVerified: true }).then(result => {
    //         if (result) {
    //             existingRecord = result;
    //         } else {
    //             responseObj = new BasicResponse(Status.FAILED_VALIDATION, { msg: "User not found or account has not been verified" });
    //         }
    //     })

    //     if (existingRecord) {
    //         existingRecord.firstName = dto.firstName;
    //         existingRecord.lastName = dto.lastName;
    //         existingRecord.phoneNumber = dto.phoneNumber
    //         existingRecord.accountName = dto.accountName;
    //         existingRecord.accountNumber = dto.accountNumber;
    //         existingRecord.bankName = dto.bankName;

    //         await existingRecord.save().then(result => {
    //             if (result) {
    //                 responseObj = new BasicResponse(Status.SUCCESS, result);
    //             } else {
    //                 responseObj = new BasicResponse(Status.PRECONDITION_FAILED, { msg: "Can't save this data, try again" });
    //             }
    //         })
    //     }
    //     this.sendResponse(responseObj, res);
    // }


    public async registerUser(req: Request, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password, phoneNumber, baseUrl } = req.body;

        let dto = new RegisterUserDTO(firstName, lastName, email, password, phoneNumber, baseUrl);
        let errors = await this.validateNewUserDetails(dto, req);
        if (this.hasErrors(errors)) {
            this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), req, res);
            return next();
        }
        await this.saveNewUserData(req, res, next, dto)

    }


    async saveNewUserData(req: Request, res: Response, next: NextFunction, dto: RegisterUserDTO) {
        try {
            const hashedPassword = hashSync(dto.password);
            let { firstName, lastName, email, phoneNumber } = dto
            let register: IRegisterModel = req.app.locals.register({ firstName, lastName, email: email.toLowerCase(), password: hashedPassword, phoneNumber: phoneNumber });
            let responseObj = null
            await register.save().then(async result => {
                if (result) {
                    //this.sendMail(req, res, next, dto.email, output.token, dto.baseUrl, "confirmation")
                    responseObj = new BasicResponse(Status.SUCCESS, {msg:'Your account is ready'});
                } else {
                    responseObj = new BasicResponse(Status.FAILED_VALIDATION);
                }
            }).catch(err => {
                responseObj = new BasicResponse(Status.ERROR, err);
            });

            this.sendResponse(responseObj, req, res);
        } catch (error) {
            this.sendResponse(new BasicResponse(Status.ERROR, error), req, res);
        }

    }



    // async sendMail(req: Request, res: Response, next: NextFunction, email, data, baseUrl, midpath) {

    //     SGmail.setApiKey(process.env.SEND_GRID_KEY)

    //     const msg = {
    //         to: email,
    //         from: 'email@photizzo.com',
    //         subject: 'Account Verification',
    //         html: `<p>Click on this link to activate and confirm your account <a href="${baseUrl}/referral/${midpath}/${data}">${midpath} Link</p>`
    //     };

    //     SGmail.send(msg);
    // }




    public async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            let dto = new LoginUserDTO(email, password);
            let responseObj = null
            let errors = await this.validateNewUserDetails(dto, req);
            if (this.hasErrors(errors)) {
                this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), req, res);
                return next();
            }
            await req.app.locals.register.findOne({ email: dto.email.toLowerCase() }).then(async result => {
                if (result) {
                    const isPasswordMatching = compareSync(dto.password, result.password);
                    if (isPasswordMatching) {
                        const tokenData = this.createToken(result);
                        responseObj = new BasicResponse(Status.SUCCESS, { result, tokenData });
                    } else {
                        responseObj = new BasicResponse(Status.FAILED_VALIDATION, { msg: 'Username or password is incorrect' });
                    }

                } else {
                    responseObj = new BasicResponse(Status.FAILED_VALIDATION, { msg: 'Username or password is incorrect' });
                }
            }).catch(err => {
                responseObj = new BasicResponse(Status.ERROR, err);
            });
            this.sendResponse(responseObj, req, res);
        } catch (error) {
            this.sendResponse(new BasicResponse(Status.ERROR, error), req, res);
        }
    }





    // @handleException()
    // public async confirmUser(req: Request, res: Response, next: NextFunction) {
    //     const { token } = req.body;

    //     let dto = new ConfirmUserDTO(token);
    //     let errors = await this.validateDetails(dto, req);
    //     if (this.hasErrors(errors)) {
    //         this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), res);
    //         return next();
    //     }
    //     await this.verifyAndSaveUser(req, res, next, dto)

    // }


    // async verifyAndSaveUser(req, res, next, dto) {
    //     await req.app.locals.token.findOne({ token: dto.token }).then(async token => {
    //         if (!token) {
    //             return this.sendResponse(new BasicResponse(Status.PRECONDITION_FAILED, { msg: 'Account activation failed. Your verification link may have expired.' }), res);
    //         }
    //         await req.app.locals.register.findOne({ _id: token._userId }).then(async result => {
    //             if (!result) return this.sendResponse(new BasicResponse(Status.NOT_FOUND, { msg: 'No user found.' }), res);
    //             if (result.isVerified) return this.sendResponse(new BasicResponse(Status.UNPROCESSABLE_ENTRY, { msg: 'This user has already been verified.' }), res);
    //             result.isVerified = true
    //             await result.save().then(user => {
    //                 if (user) {
    //                     return this.sendResponse(new BasicResponse(Status.SUCCESS, { msg: "Account has been verified. Please log in." }), res)
    //                 } else {
    //                     return this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION), res)
    //                 }
    //             }).catch(err => {
    //                 this.sendResponse(new BasicResponse(Status.ERROR), res)
    //             })
    //         })
    //     })
    // }




    // @handleException()
    // public async processResendToken(req: Request, res: Response, next: NextFunction) {
    //     const { email, baseUrl } = req.body;
    //     let dto = new ForgotPasswordDTO(email, baseUrl);
    //     let errors = await this.validateDetails(dto, req);
    //     if (this.hasErrors(errors)) {
    //         this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), res);
    //         return next();
    //     }
    //     await this.resendToken(req, res, next, dto)

    // }

    // async resendToken(req, res, next, dto) {
    //     await req.app.locals.register.findOne({ email: dto.email.toLowerCase() }).then(async user => {
    //         if (!user) return this.sendResponse(new BasicResponse(Status.NOT_FOUND, { msg: 'We were unable to find a user with that email.' }), res);
    //         if (user.isVerified) return this.sendResponse(new BasicResponse(Status.PRECONDITION_FAILED, { msg: 'This account has already been verified. Please log in.' }), res);
    //         const tokenData = this.createToken(user);
    //         let token: ITokenModel = req.app.locals.token({ _userId: user._id, token: tokenData.token });
    //         await token.save().then(result => {
    //             if (!result) return this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, { msg: "Could not generate token" }), res);
    //             this.sendMail(req, res, next, dto.email, result.token, dto.baseUrl, "confirmation")
    //             this.sendResponse(new BasicResponse(Status.SUCCESS, { token: tokenData.token, msg: "A verification email has been sent to " + user.email + "." }), res);
    //             return next();

    //         })

    //     })
    // }



    // @handleException()
    // public async sendResetPasswordLink(req: Request, res: Response, next: NextFunction) {
    //     const { email, baseUrl } = req.body;
    //     let dto = new ForgotPasswordDTO(email, baseUrl);
    //     let errors = await this.validateDetails(dto, req);
    //     if (this.hasErrors(errors)) {
    //         this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), res);
    //         return next();
    //     }

    //     await req.app.locals.register.findOne({ email: dto.email.toLowerCase() }).then(async user => {
    //         if (!user) return this.sendResponse(new BasicResponse(Status.NOT_FOUND, { msg: 'We were unable to find a user with that email.' }), res);
    //         if (user && !user.isVerified) return this.sendResponse(new BasicResponse(Status.PRECONDITION_FAILED, { msg: 'Check your mail or resend activation link to activate your account.' }), res);
    //         this.sendMail(req, res, next, dto.email, user._id, dto.baseUrl, "reset-password")
    //         this.sendResponse(new BasicResponse(Status.SUCCESS, { msg: "The reset password link has been to your email" }), res);

    //     })

    // }



    // public async processResetPassword(req, res, next) {
    //     const { id, password } = req.body;
    //     let dto = new ResetPasswordDTO(id, password);
    //     let errors = await this.validateDetails(dto, req);
    //     if (this.hasErrors(errors)) {
    //         this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, errors), res);
    //         return next();
    //     }

    //     await this.resetPassword(req, res, next, dto)
    // }



    // async resetPassword(req, res, next, dto) {
    //     await req.app.locals.register.findOne({ _id: dto.id }).then(async user => {
    //         if (!user) return this.sendResponse(new BasicResponse(Status.NOT_FOUND, { msg: 'We were unable to find a user for this account.' }), res);
    //         user.password = hashSync(dto.password);

    //         await user.save().then(result => {
    //             if (!result) return this.sendResponse(new BasicResponse(Status.FAILED_VALIDATION, { msg: "Could not reset your password" }), res);
    //             this.sendResponse(new BasicResponse(Status.SUCCESS, { msg: "You have successfully changed your password" }), res);
    //             return next();
    //         })

    //     })
    // }



    // @handleException()
    // public async processVerifyId(req: Request, res: Response, next: NextFunction) {
    //     let id = req.params.referralId
    //     let responseObj = null
    //     await req.app.locals.register.findOne({ referralId: id}).then(async result => {
    //         if (result) {
    //             if(!result.isVerified) return this.sendResponse(new BasicResponse(Status.PRECONDITION_FAILED, {msg: "This link's account has not be activated"}), res)
    //             const tokenData = this.createToken(result);
    //             let token: ITokenModel = req.app.locals.token({ _userId: result._id, token: tokenData.token });
    //             await token.save().then(output => {
    //                 if (output) {
    //                     responseObj = new BasicResponse(Status.SUCCESS, { msg: tokenData.token });
    //                     return next();
    //                 } else {
    //                     responseObj = new BasicResponse(Status.PRECONDITION_FAILED, { msg: "Something went wrong, Try again" })
    //                 }
    //             })

    //         } else {
    //             responseObj = new BasicResponse(Status.FAILED_VALIDATION, { msg: "Invalid referral link" });
    //         }
    //     }).catch(err => {
    //         responseObj = new BasicResponse(Status.ERROR, err);
    //     });
    //     this.sendResponse(responseObj, res);
    // }



    // @handleException()
    // public async listUsers(req: Request, res: Response, next: NextFunction) {

    //     req.app.locals.register.find({ isVerified: true }, { password: 0 }).sort({ createdAt: 'descending' }).then(result => {

    //         if (!result) {
    //             this.sendResponse(new BasicResponse(Status.ERROR), res)
    //         } else {
    //             this.sendResponse(new BasicResponse(Status.SUCCESS, result), res)
    //         }
    //     })
    // }


    // @handleException()
    // public async listOneUser(req: Request, res: Response, next: NextFunction) {

    //     req.app.locals.register.findById({ _id: req.params.userId, isVerified: true}).populate('referrals').sort({ createdAt: 'descending' }).then(result => {
    //         if (!result) {
    //             this.sendResponse(new BasicResponse(Status.ERROR), res)
    //         } else {
    //             this.sendResponse(new BasicResponse(Status.SUCCESS, result), res)
    //         }
    //     })
    // }


    async validateNewUserDetails(dto, req: Request) {
        let errors = validateSync(dto, { validationError: { target: false } });
        if (this.hasErrors(errors)) {
            return errors;
        }
        if (dto.firstName) {
            await req.app.locals.register.find({ email: dto.email.toLowerCase() }).then(result => {
                if (result && result[0] && result[0]._id && result[0]._id != req.params.id) {
                    errors.push(this.getDuplicateEmailError(dto.email.toLowerCase()));
                } else if (result && result[0] && result[0]._id && !req.params.id) {
                    errors.push(this.getDuplicateEmailError(dto.email.toLowerCase()));
                }
            });
        }

        return errors;
    }
}
