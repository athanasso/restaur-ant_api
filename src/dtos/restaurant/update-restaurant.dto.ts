import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRestaurantDto {

    @ApiProperty({ description: 'The name of the restaurant' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'The phone number of the restaurant' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ description: 'The address of the restaurant' })
    @IsOptional()
    @IsString()
    address?: string;
}
