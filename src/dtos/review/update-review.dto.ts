import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @IsNotEmpty()
    @IsString()
    comment: string;
}
