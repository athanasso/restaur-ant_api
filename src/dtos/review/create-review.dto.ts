import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {

    @ApiProperty({ description: 'The rating of the new review' })
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @ApiProperty({ description: 'The comment of the new review' })
    @IsNotEmpty()
    @IsString()
    comment: string;

    @ApiProperty({ description: 'The restaurant id of the new review' })
    @IsNotEmpty()
    @IsNumber()
    restaurantId: number;

    @ApiProperty({ description: 'The user id of the new review' })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
