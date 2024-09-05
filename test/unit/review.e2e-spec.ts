import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from '../../src/reviews/reviews.controller';
import { ReviewsService } from '../../src/reviews/reviews.service';
import { CreateReviewDto } from '../../src/dtos/review/create-review.dto';
import { UpdateReviewDto } from '../../src/dtos/review/update-review.dto';
import { Review } from '../../src/entities/review.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PaginationResponseDto } from '../../src/dtos/pagination-response.dto';
import { RolesGuard } from '../../src/guards/role.guard';
import { JwtService } from '@nestjs/jwt';
import { Restaurant } from '../../src/entities/restaurant.entity';
import { User } from '../../src/entities/user.entity';
import { Role } from '../../src/enums/Role';

jest.mock('../../src/guards/role.guard');

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: {
            createReview: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const createReviewDto: CreateReviewDto = {
          comment: 'Great product!', rating: 5,
          restaurantId: 0,
          userId: 0
      };
      const user: User = { id: 1, username: 'john', email: 'john@test.gr', password: 'password', role: Role.USER, reviews: [] };
      const expectedResult: Review = {
          id: 1, ...createReviewDto, user: user,
          createdAt: undefined,
          restaurant: new Restaurant
      };
      jest.spyOn(service, 'createReview').mockResolvedValue(expectedResult);

      expect(await controller.createReview(createReviewDto)).toBe(expectedResult);
    });

    it('should throw ForbiddenException when service throws an error with response', async () => {
      const createReviewDto: CreateReviewDto = {
          comment: 'Great product!', rating: 5,
          restaurantId: 0,
          userId: 0
      };
      jest.spyOn(service, 'createReview').mockRejectedValue({ response: 'Forbidden' });

      await expect(controller.createReview(createReviewDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on other errors', async () => {
      const createReviewDto: CreateReviewDto = {
          comment: 'Great product!', rating: 5,
          restaurantId: 0,
          userId: 0
      };
      jest.spyOn(service, 'createReview').mockRejectedValue(new Error());

      await expect(controller.createReview(createReviewDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of reviews', async () => {
      const expectedResult: PaginationResponseDto<Review> = {
        items: [{
            id: 1, comment: 'Great product!', rating: 5, user: { id: 1, username: 'john', email: 'john@test.gr', password: 'password', role: Role.USER, reviews: [] },
            createdAt: undefined,
            restaurant: new Restaurant
        }],
        totalCount: 1,
        page: 1,
        take: 10,
        pageCount: 1
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      expect(await controller.findAll(1, 10)).toBe(expectedResult);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new Error());

      await expect(controller.findAll(1, 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      const expectedResult: Review = {
          id: 1, comment: 'Great product!', rating: 5, user: { id: 1, username: 'john', email: 'john@test.gr', password: 'password', role: Role.USER, reviews: [] },
          createdAt: undefined,
          restaurant: new Restaurant
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      expect(await controller.findOne('1')).toBe(expectedResult);
    });

    it('should throw NotFoundException when review is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error());

      await expect(controller.findOne('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const updateReviewDto: UpdateReviewDto = { comment: 'Updated review' };
      const expectedResult: Review = {
          id: 1, comment: 'Updated review', rating: 5, user: { id: 1, username: 'john', email: 'john@test.gr', password: 'password', role: Role.USER, reviews: [] },
          createdAt: undefined,
          restaurant: new Restaurant
      };
      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update('1', updateReviewDto)).toBe(expectedResult);
    });

    it('should throw NotFoundException when review is not found', async () => {
      const updateReviewDto: UpdateReviewDto = { comment: 'Updated review' };
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update('1', updateReviewDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      const updateReviewDto: UpdateReviewDto = { comment: 'Updated review' };
      jest.spyOn(service, 'update').mockRejectedValue(new Error());

      await expect(controller.update('1', updateReviewDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a review', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when review is not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new Error());

      await expect(controller.remove('1')).rejects.toThrow(BadRequestException);
    });
  });
});