import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { Role } from 'src/enums/Role';

export class UpdateUserDto {

    @ApiProperty({ description: 'The username of the user' })
    @IsOptional()
    @IsString()
    @MinLength(5)
    username?: string;

    @ApiProperty({ description: 'The email of the user' })
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the user' })
    @IsOptional()
    @IsString()
    @MinLength(5)
    password?: string;

    @ApiProperty({ description: 'The role of the user' })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
