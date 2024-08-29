import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto {
    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    @IsString()
    comment?: string;

    @IsOptional()
    @IsNumber()
    userId?: number;

    @IsOptional()
    @IsNumber()
    restaurantId?: number;
}
