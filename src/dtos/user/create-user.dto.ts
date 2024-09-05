import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsEnum, IsEmail, IsNotEmpty } from 'class-validator';
import { Role } from '../../enums/Role';

export class CreateUserDto {

    @ApiProperty({ description: 'The username of the new user' })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    username: string;

    @ApiProperty({ description: 'The email of the new user' })
    @IsNotEmpty()
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the new user' })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    password: string;

    @ApiProperty({ description: 'The role of the new user' })
    @IsNotEmpty()
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
