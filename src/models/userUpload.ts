import { Document } from "mongoose";
import { IUserUpload } from "../interfaces/userUpload";

export interface IUploadModel extends IUserUpload, Document {
  //custom methods for your model would be defined here
}