import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateRestaurantDto {

    @ApiProperty({ description: 'The name of the new restaurant' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The phone number of the new restaurant' })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @ApiProperty({ description: 'The address of the new restaurant' })
    @IsNotEmpty()
    @IsString()
    address: string;
}
