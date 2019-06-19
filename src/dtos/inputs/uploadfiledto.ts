import { Length, IsNotEmpty } from "class-validator";
 
export class UploadFileDTO {
 
    
    @IsNotEmpty({
        message: 'fileName is required'
    })
    @Length(1, 120 ,{
        message: 'fileName should be between 1 and 100 characters' })
    fileName: string;  
    

    
    folderId: string;

    originalFileName: string;

    fileSize: number;

    fileExtension: string;




    constructor(originalFileName: string, fileName: string, fileSize: number, fileExtension: string, folderId?: string ){
        this.originalFileName = originalFileName
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.fileExtension = fileExtension;
        this.folderId = folderId
    }
}