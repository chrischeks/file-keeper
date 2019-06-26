import {IsEmail, IsNotEmpty, MinLength, MaxLength, IsNumberString,  IsOptional, IsUrl, Length} from "class-validator";

export class RegisterUserDTO {

    @IsEmail()
    @IsNotEmpty({
        message: 'email is required'
    })
    email: string;

    @MinLength(5)
    @IsNotEmpty({
        message: 'password is required'
    })
    password: string;

    constructor(email?: string, password?: string){
        this.email = email;
        this.password = password;
    }
}