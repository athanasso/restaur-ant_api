import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto {

    @ApiProperty({ description: 'The rating of the review' })
    @IsOptional()
    @IsNumber()
    rating?: number;

    @ApiProperty({ description: 'The comment of the review' })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty({ description: 'The restaurant id of the review' })
    @IsOptional()
    @IsNumber()
    restaurantId?: number;

    @ApiProperty({ description: 'The user id of the review' })
    @IsOptional()
    @IsNumber()
    userId?: number;
}
