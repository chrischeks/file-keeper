import {IsEmail, IsNotEmpty, MaxLength, IsNumberString, Length, ValidateIf, IsOptional, IsNumber} from "class-validator";

export class LoginUserDTO {
 
    @IsEmail()
    @IsNotEmpty({
        message: 'userName is required'
    })
    email: string;

    
    @IsNotEmpty({
        message: 'password is required'
    })
    password: string;





    constructor(email?: string, password?: string){
        this.email = email;
        this.password = password;
    }
}