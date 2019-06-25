import { Document } from "mongoose";
import { IRegister } from "../interfaces/registerinterface";

export interface IRegisterModel extends IRegister, Document {
    //custom methods for your model would be defined here
}