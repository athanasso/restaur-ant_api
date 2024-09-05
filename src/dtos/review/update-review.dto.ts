import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto {

    @ApiProperty({ description: 'The rating of the review' })
    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    rating?: number;

    @ApiProperty({ description: 'The comment of the review' })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty({ description: 'The restaurant id of the review' })
    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    restaurantId?: number;

    @ApiProperty({ description: 'The user id of the review' })
    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    userId?: number;
}
