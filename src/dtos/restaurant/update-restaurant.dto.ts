import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRestaurantDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;
}
