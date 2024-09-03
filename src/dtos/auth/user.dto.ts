import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class UserDto {

    @ApiProperty({ description: 'The username of the user' })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    username: string;

    @ApiProperty({ description: 'The email of the user' })
    @IsOptional()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the user' })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    password: string;
}
