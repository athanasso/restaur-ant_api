import { IsString, MinLength, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { Role } from 'src/enums/Role';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MinLength(5)
    username?: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    password?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
