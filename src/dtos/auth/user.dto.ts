import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class UserDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    username: string;

    @IsOptional()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    password: string;
}
