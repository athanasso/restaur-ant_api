import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from '../src/restaurants/restaurants.controller';
import { RestaurantsService } from '../src/restaurants/restaurants.service';
import { ReviewsService } from '../src/reviews/reviews.service';
import { CreateRestaurantDto } from '../src/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '../src/dtos/restaurant/update-restaurant.dto';
import { CreateReviewDto } from '../src/dtos/review/create-review.dto';
import { UpdateReviewDto } from '../src/dtos/review/update-review.dto';
import { Restaurant } from '../src/entities/restaurant.entity';
import { Review } from '../src/entities/review.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationResponseDto } from '../src/dtos/pagination-response.dto';
import { RolesGuard } from '../src/guards/role.guard';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/entities/user.entity';
import { Role } from '../src/enums/Role';

jest.mock('../src/guards/role.guard');

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let restaurantsService: RestaurantsService;
  let reviewsService: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findUserReviewByRestaurant: jest.fn(),
          },
        },
        {
          provide: ReviewsService,
          useValue: {
            findAllByRestaurant: jest.fn(),
            createReview: jest.fn(),
            deleteReview: jest.fn(),
            updateReview: jest.fn(),
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

    controller = module.get<RestaurantsController>(RestaurantsController);
    restaurantsService = module.get<RestaurantsService>(RestaurantsService);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  describe('create', () => {
    it('should create a new restaurant', async () => {
      const createRestaurantDto: CreateRestaurantDto = {
          name: 'Test Restaurant', address: '123 Test St',
          phoneNumber: ''
      };
      const expectedResult: Restaurant = {
        id: 1, ...createRestaurantDto,
        reviews: [],
        calculateAverageRating: function (): void {
          throw new Error('Function not implemented.');
        },
        averageRating: 0
      };
      jest.spyOn(restaurantsService, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createRestaurantDto)).toBe(expectedResult);
    });

    it('should throw BadRequestException on error', async () => {
      const createRestaurantDto: CreateRestaurantDto = {
          name: 'Test Restaurant', address: '123 Test St',
          phoneNumber: '',
      };
      jest.spyOn(restaurantsService, 'create').mockRejectedValue(new Error());

      await expect(controller.create(createRestaurantDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of restaurants', async () => {
      const expectedResult: PaginationResponseDto<Restaurant> = {
        items: [{
            id: 1, name: 'Test Restaurant', address: '123 Test St',
            phoneNumber: '',
            averageRating: 0,
            reviews: [],
            calculateAverageRating: function (): void {
                throw new Error('Function not implemented.');
            }
        }],
        totalCount: 1,
        page: 1,
        take: 10,
        pageCount: 1
      };
      jest.spyOn(restaurantsService, 'findAll').mockResolvedValue(expectedResult);

      expect(await controller.findAll(1, 10)).toBe(expectedResult);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(restaurantsService, 'findAll').mockRejectedValue(new Error());

      await expect(controller.findAll(1, 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a restaurant by id', async () => {
      const expectedResult: Restaurant = {
          id: 1, name: 'Test Restaurant', address: '123 Test St',
          phoneNumber: '',
          averageRating: 0,
          reviews: [],
          calculateAverageRating: function (): void {
              throw new Error('Function not implemented.');
          }
      };
      jest.spyOn(restaurantsService, 'findOne').mockResolvedValue(expectedResult);

      expect(await controller.findOne('1')).toBe(expectedResult);
    });

    it('should throw NotFoundException when restaurant is not found', async () => {
      jest.spyOn(restaurantsService, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      jest.spyOn(restaurantsService, 'findOne').mockRejectedValue(new Error());

      await expect(controller.findOne('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a restaurant', async () => {
      const updateRestaurantDto: UpdateRestaurantDto = { name: 'Updated Restaurant' };
      const expectedResult: Restaurant = {
          id: 1, name: 'Updated Restaurant', address: '123 Test St',
          phoneNumber: '',
          averageRating: 0,
          reviews: [],
          calculateAverageRating: function (): void {
              throw new Error('Function not implemented.');
          }
      };
      jest.spyOn(restaurantsService, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update('1', updateRestaurantDto)).toBe(expectedResult);
    });

    it('should throw NotFoundException when restaurant is not found', async () => {
      const updateRestaurantDto: UpdateRestaurantDto = { name: 'Updated Restaurant' };
      jest.spyOn(restaurantsService, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update('1', updateRestaurantDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      const updateRestaurantDto: UpdateRestaurantDto = { name: 'Updated Restaurant' };
      jest.spyOn(restaurantsService, 'update').mockRejectedValue(new Error());

      await expect(controller.update('1', updateRestaurantDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a restaurant', async () => {
      jest.spyOn(restaurantsService, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when restaurant is not found', async () => {
      jest.spyOn(restaurantsService, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      jest.spyOn(restaurantsService, 'remove').mockRejectedValue(new Error());

      await expect(controller.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllReviews', () => {
    it('should return all reviews for a restaurant', async () => {
      const expectedResult: Review[] = [{
          id: 1, comment: 'Great place!', rating: 5, restaurant: {
              id: 0,
              name: '',
              phoneNumber: '',
              address: '',
              averageRating: 0,
              reviews: [],
              calculateAverageRating: function (): void {
                  throw new Error('Function not implemented.');
              }
          }, user: {
              id: 0,
              username: '',
              email: '',
              password: '',
              role: Role.USER,
              reviews: []
          },
          createdAt: undefined
      }];
      jest.spyOn(reviewsService, 'findAllByRestaurant').mockResolvedValue(expectedResult);

      expect(await controller.findAllReviews('1')).toBe(expectedResult);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(reviewsService, 'findAllByRestaurant').mockRejectedValue(new Error());

      await expect(controller.findAllReviews('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('createReview', () => {
    it('should create a new review for a restaurant', async () => {
      const createReviewDto: CreateReviewDto = {
          comment: 'Great place!', rating: 5, userId: 1,
          restaurantId: 0
      };
      const expectedResult: Review = {
          id: 1,
          rating: 0, // Add the required 'rating' property
          ...createReviewDto,
          restaurant: {
              id: 0,
              name: '',
              phoneNumber: '',
              address: '',
              averageRating: 0,
              reviews: [],
              calculateAverageRating: function (): void {
                  throw new Error('Function not implemented.');
              }
          },
          createdAt: undefined,
          user: new User
      };
      jest.spyOn(reviewsService, 'createReview').mockResolvedValue(expectedResult);

      expect(await controller.createReview('1', createReviewDto)).toBe(expectedResult);
    });

    it('should throw BadRequestException on error', async () => {
      const createReviewDto: CreateReviewDto = {
          comment: 'Great place!', rating: 5, userId: 1,
          restaurantId: 0
      };
      jest.spyOn(reviewsService, 'createReview').mockRejectedValue(new Error());

      await expect(controller.createReview('1', createReviewDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findUserReview', () => {
    it('should return a user review for a restaurant', async () => {
      const expectedResult: Review = {
          id: 1, comment: 'Great place!', rating: 5, restaurant: {
              id: 0,
              name: '',
              phoneNumber: '',
              address: '',
              averageRating: 0,
              reviews: [],
              calculateAverageRating: function (): void {
                  throw new Error('Function not implemented.');
              }
          }, user: {
              id: 0,
              username: '',
              email: '',
              password: '',
              role: Role.USER,
              reviews: []
          },
          createdAt: undefined
      };
      jest.spyOn(restaurantsService, 'findUserReviewByRestaurant').mockResolvedValue(expectedResult);

      expect(await controller.findUserReview('1', '1')).toBe(expectedResult);
    });

    it('should throw NotFoundException when review is not found', async () => {
      jest.spyOn(restaurantsService, 'findUserReviewByRestaurant').mockResolvedValue(null);

      await expect(controller.findUserReview('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      jest.spyOn(restaurantsService, 'findUserReviewByRestaurant').mockRejectedValue(new Error());

      await expect(controller.findUserReview('1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      jest.spyOn(reviewsService, 'deleteReview').mockResolvedValue(undefined);

      await expect(controller.deleteReview(1, 1, 1)).resolves.toBeUndefined();
    });

    it('should throw an error when deleteReview fails', async () => {
      jest.spyOn(reviewsService, 'deleteReview').mockRejectedValue(new Error('Delete failed'));

      await expect(controller.deleteReview(1, 1, 1)).rejects.toThrow('Error deleting review');
    });
  });

  describe('updateReview', () => {
    it('should update a review', async () => {
      const updateReviewDto: UpdateReviewDto = { comment: 'Updated review', rating: 4 };
      const expectedResult: Review = {
          id: 0,
          rating: 0,
          comment: '',
          createdAt: undefined,
          restaurant: new Restaurant,
          user: new User
      };
      jest.spyOn(reviewsService, 'updateReview').mockResolvedValue(expectedResult);

      expect(await controller.updateReview(1, 1, 1, updateReviewDto)).toBe(expectedResult);
    });

    it('should throw an error when updateReview fails', async () => {
      const updateReviewDto: UpdateReviewDto = { comment: 'Updated review', rating: 4 };
      jest.spyOn(reviewsService, 'updateReview').mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateReview(1, 1, 1, updateReviewDto)).rejects.toThrow('Error updating review');
    });
  });
});