import { Document } from "mongoose";
import { ITokenSchema } from "../interfaces/tokenSchemaInterface";

export interface ITokenModel extends ITokenSchema, Document {
    //custom methods for your model would be defined here
}