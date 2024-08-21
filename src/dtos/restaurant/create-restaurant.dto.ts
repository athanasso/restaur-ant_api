import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateRestaurantDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsNumber()
    averageRating: number;
}
