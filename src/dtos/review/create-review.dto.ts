import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @IsNotEmpty()
    @IsString()
    comment: string;

    @IsNotEmpty()
    @IsNumber()
    restaurantId: number;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
