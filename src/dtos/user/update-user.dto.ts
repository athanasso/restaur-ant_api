import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsEnum, IsEmail, IsNotEmpty } from 'class-validator';
import { Role } from '../../enums/Role';

export class UpdateUserDto {

    @ApiProperty({ description: 'The username of the user' })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @MinLength(5)
    username?: string;

    @ApiProperty({ description: 'The email of the user' })
    @IsNotEmpty()
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the user' })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @MinLength(5)
    password?: string;

    @ApiProperty({ description: 'The role of the user' })
    @IsNotEmpty()
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
