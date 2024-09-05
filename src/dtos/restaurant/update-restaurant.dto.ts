import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateRestaurantDto {

    @ApiProperty({ description: 'The name of the restaurant' })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'The phone number of the restaurant' })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ description: 'The address of the restaurant' })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    address?: string;
}
