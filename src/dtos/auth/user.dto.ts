import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class UserDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    username: string;

    @IsOptional()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;
}
