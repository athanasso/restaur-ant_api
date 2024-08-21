import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';

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
    @IsString()
    @IsIn(['user', 'admin'])
    role?: string;
}
