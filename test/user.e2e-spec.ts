import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { CreateUserDto } from '../src/dtos/user/create-user.dto';
import { UpdateUserDto } from '../src/dtos/user/update-user.dto';
import { User } from '../src/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationResponseDto } from '../src/dtos/pagination-response.dto';
import { Role } from '../src/enums/Role';

jest.mock('../src/guards/role.guard');

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = { username: 'JohnDoe', email: 'john@test.gr', password: 'JohnDoe123' };
      const expectedResult: User = {
          id: 1, ...createUserDto,
          reviews: [],
          role: Role.USER
      };
      jest.spyOn(service, 'createUser').mockResolvedValue(expectedResult);

      expect(await controller.create(createUserDto)).toBe(expectedResult);
    });

    it('should throw BadRequestException on error', async () => {
      const createUserDto: CreateUserDto = { username: 'JohnDoe', email: 'john@test.gr', password: 'JohnDoe123' };
      jest.spyOn(service, 'createUser').mockRejectedValue(new Error());

      await expect(controller.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const expectedResult: PaginationResponseDto<User> = {
          items: [{
              id: 1, username: 'JohnDoe', email: 'john@test.gr', password: 'JohnDoe123',
              role: Role.USER,
              reviews: []
          }],
          totalCount: 1,
          page: 1,
          take: 10,
          pageCount: 0
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
    it('should return a user by id', async () => {
      const expectedResult: User = {
          id: 1, username: 'JohnDoe', email: 'john@test.gr', password: 'JohnDoe123',
          role: Role.USER,
          reviews: []
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      expect(await controller.findOne(1)).toBe(expectedResult);
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error());

      await expect(controller.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { username: 'JohnUpdated' , email: 'john@test.gr'};
      const expectedResult: User = {
          id: 1, username: 'JohnUpdated', email: 'john@test.gr', password: 'JohnUpdated123',
          role: Role.USER,
          reviews: []
      };
      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update(1, updateUserDto)).toBe(expectedResult);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const updateUserDto: UpdateUserDto = { username: 'JohnUpdated', email: 'john@test.gr' };
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(1, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      const updateUserDto: UpdateUserDto = { username: 'JohnUpdated', email: 'john@test.gr' };
      jest.spyOn(service, 'update').mockRejectedValue(new Error());

      await expect(controller.update(1, updateUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new Error());

      await expect(controller.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});