import { Length, IsNotEmpty } from "class-validator";

export class RenameFileDTO {

    @IsNotEmpty({
        message: 'fileName is required'
    })
    @Length(1, 120, {
        message: 'fileName should be between 1 and 120 characters'
    })
    fileName: string;


    constructor(fileName: string) {
        this.fileName = fileName;
    }
}