import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from 'src/enums/Role';

export class CreateUserDto {

    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
