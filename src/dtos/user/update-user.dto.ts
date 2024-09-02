import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from 'src/enums/Role';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MinLength(3)
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
    
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
