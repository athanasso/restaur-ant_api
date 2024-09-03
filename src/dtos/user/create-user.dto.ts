import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { Role } from 'src/enums/Role';

export class CreateUserDto {

    @ApiProperty({ description: 'The username of the new user' })
    @IsString()
    @MinLength(5)
    username: string;

    @ApiProperty({ description: 'The email of the new user' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the new user' })
    @IsString()
    @MinLength(5)
    password: string;

    @ApiProperty({ description: 'The role of the new user' })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
