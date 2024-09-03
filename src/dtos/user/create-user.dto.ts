import { IsString, MinLength, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { Role } from 'src/enums/Role';

export class CreateUserDto {

    @IsString()
    @MinLength(6)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
