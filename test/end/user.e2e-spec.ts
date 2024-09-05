import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserDto } from '../../src/dtos/user/create-user.dto';
import { UpdateUserDto } from '../../src/dtos/user/update-user.dto';
import { Role } from '../../src/enums/Role';
import { seedDatabase } from '../test.seeder';
import { DataSource } from 'typeorm';
import { User } from '../../src/entities/user.entity';
import { Restaurant } from '../../src/entities/restaurant.entity';
import { Review } from '../../src/entities/review.entity';
import { UserDto } from '../../src/dtos/auth/user.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let connection: DataSource;
  let createdUserId: number;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT, 10) + 1,
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [User, Restaurant, Review],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();

    connection = app.get(DataSource);

    await seedDatabase(connection);

    const loginDto: UserDto = {
      username: 'admin',
      password: 'admin',
      email: 'admin@example.com'
    };

    // Simulate login to get the admin token
    const authResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .set('Content-Type', 'application/json')
    .send(loginDto)
    .expect(200);

    adminToken = authResponse.body.payload.accessToken;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      username: 'JohnDoe',
      email: 'john@test.gr',
      password: 'JohnDoe123',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(createUserDto.username);
    expect(response.body.email).toBe(createUserDto.email);
    expect(response.body).toHaveProperty('password');
    expect(response.body.role).toBe(Role.USER);

    createdUserId = response.body.id;
  });

  it('should get all users', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('totalCount');
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  it('should get a user by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', createdUserId);
    expect(response.body).toHaveProperty('username');
    expect(response.body).toHaveProperty('email');
  });

  it('should update a user', async () => {
    const updateUserDto: UpdateUserDto = {
      username: 'JohnUpdated',
      email: 'johnupdated@test.gr',
    };

    const response = await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateUserDto)
      .expect(200);

    expect(response.body).toHaveProperty('id', createdUserId);
    expect(response.body.username).toBe(updateUserDto.username);
    expect(response.body.email).toBe(updateUserDto.email);
  });

  it('should delete a user', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
    .get(`/users/${createdUserId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(404);
  });

  it('should handle bad request errors', async () => {
    const invalidCreateUserDto = {
      username: '',
      email: 'invalid-email',
      password: '',
    };

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidCreateUserDto)
      .expect(400);
  });

  it('should handle not found errors when getting a non-existing user', async () => {
    await request(app.getHttpServer())
      .get('/users/999999')  // Assuming 999999 does not exist
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('should handle bad request errors when updating with invalid data', async () => {
    const updateUserDto: UpdateUserDto = {
      username: '',
      email: 'invalid-email',
    };

    await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateUserDto)
      .expect(400);
  });

  it('should handle not found errors when deleting a non-existing user', async () => {
    await request(app.getHttpServer())
      .delete('/users/999999')  // Assuming 999999 does not exist
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
