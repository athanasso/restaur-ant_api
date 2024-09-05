import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../src/enums/Role';
import { seedDatabase } from '../test.seeder';
import { DataSource } from 'typeorm';
import { User } from '../../src/entities/user.entity';
import { Restaurant } from '../../src/entities/restaurant.entity';
import { Review } from '../../src/entities/review.entity';
import { UserDto } from '../../src/dtos/auth/user.dto';
import { CreateRestaurantDto } from '../../src/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '../../src/dtos/restaurant/update-restaurant.dto';
import { CreateReviewDto } from '../../src/dtos/review/create-review.dto';
import { UpdateReviewDto } from '../../src/dtos/review/update-review.dto';

describe('RestaurantsController (e2e)', () => {
    let app: INestApplication;
    let connection: DataSource;
    let createdRestaurantId: number;
    let createdReviewId: number;
    let adminToken: string;
    let userToken: string;
    let userId: number;

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

    const adminLoginDto: UserDto = {
        username: 'admin',
        password: 'admin',
        email: 'admin@example.com'
    };

    const userLoginDto: UserDto = {
        username: 'testuser1',
        password: 'password123',
        email: 'testuser1@example.com'
    };

    // Simulate login to get the admin token
    const adminAuthResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send(adminLoginDto)
        .expect(200);

    adminToken = adminAuthResponse.body.payload.accessToken;

    // Simulate login to get the user token
    const userAuthResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send(userLoginDto)
        .expect(200);

    userToken = userAuthResponse.body.payload.accessToken;
    userId = userAuthResponse.body.payload.id;
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.destroy();
        await app.close();
    });

    it('should create a new restaurant', async () => {
    const createRestaurantDto: CreateRestaurantDto = {
        name: 'Test Restaurant',
        address: '123 Test St',
        phoneNumber: '1234567890'
    };

    const response = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createRestaurantDto)
        .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(createRestaurantDto.name);
    expect(response.body.address).toBe(createRestaurantDto.address);
    expect(response.body.phoneNumber).toBe(createRestaurantDto.phoneNumber);

    createdRestaurantId = response.body.id;
    });

    it('should get all restaurants', async () => {
    const response = await request(app.getHttpServer())
        .get('/restaurants')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('totalCount');
    expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should get a restaurant by id', async () => {
    const response = await request(app.getHttpServer())
        .get(`/restaurants/${createdRestaurantId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

    expect(response.body).toHaveProperty('id', createdRestaurantId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('address');
    expect(response.body).toHaveProperty('phoneNumber');
    });

    it('should update a restaurant', async () => {
    const updateRestaurantDto: UpdateRestaurantDto = {
        name: 'Updated Test Restaurant',
        address: '456 Updated St',
        phoneNumber: '0987654321'
    };

    const response = await request(app.getHttpServer())
        .put(`/restaurants/${createdRestaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateRestaurantDto)
        .expect(200);

    expect(response.body).toHaveProperty('id', createdRestaurantId);
    expect(response.body.name).toBe(updateRestaurantDto.name);
    expect(response.body.address).toBe(updateRestaurantDto.address);
    expect(response.body.phoneNumber).toBe(updateRestaurantDto.phoneNumber);
    });

    it('should create a new review for a restaurant', async () => {
    const createReviewDto: CreateReviewDto = {
        comment: 'Great place!',
        rating: 5,
        userId: userId,
        restaurantId: createdRestaurantId
    };

    const response = await request(app.getHttpServer())
        .post(`/restaurants/${createdRestaurantId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(createReviewDto)
        .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.comment).toBe(createReviewDto.comment);
    expect(response.body.rating).toBe(createReviewDto.rating);

    createdReviewId = response.body.id;
    });

    it('should get all reviews for a restaurant', async () => {
    const response = await request(app.getHttpServer())
        .get(`/restaurants/${createdRestaurantId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a user review for a restaurant', async () => {
    const response = await request(app.getHttpServer())
        .get(`/restaurants/${createdRestaurantId}/reviews/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('comment');
    expect(response.body).toHaveProperty('rating');
    });

    it('should update a review', async () => {
    const updateReviewDto: UpdateReviewDto = {
        comment: 'Updated review',
        rating: 4
    };

    const response = await request(app.getHttpServer())
        .put(`/restaurants/${createdRestaurantId}/reviews/${createdReviewId}/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateReviewDto)
        .expect(200);

    expect(response.body).toHaveProperty('id', createdReviewId);
    expect(response.body.comment).toBe(updateReviewDto.comment);
    expect(response.body.rating).toBe(updateReviewDto.rating);
    });

    it('should delete a review', async () => {
    await request(app.getHttpServer())
        .delete(`/restaurants/${createdRestaurantId}/reviews/${createdReviewId}/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

    await request(app.getHttpServer())
        .get(`/restaurants/${createdRestaurantId}/reviews/${createdReviewId}/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should delete a restaurant', async () => {
    await request(app.getHttpServer())
        .delete(`/restaurants/${createdRestaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

    await request(app.getHttpServer())
        .get(`/restaurants/${createdRestaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should handle bad request errors when creating a restaurant', async () => {
    const invalidCreateRestaurantDto = {
        name: '',
        address: '',
        phoneNumber: 'invalid-phone'
    };

    await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCreateRestaurantDto)
        .expect(400);
    });

    it('should handle not found errors when getting a non-existing restaurant', async () => {
    await request(app.getHttpServer())
        .get('/restaurants/999999')  // Assuming 999999 does not exist
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should handle bad request errors when updating with invalid data', async () => {
    const updateRestaurantDto: UpdateRestaurantDto = {
        name: '',
        address: '',
        phoneNumber: 'invalid-phone'
    };

    await request(app.getHttpServer())
        .put(`/restaurants/${createdRestaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateRestaurantDto)
        .expect(400);
    });

    it('should handle not found errors when deleting a non-existing restaurant', async () => {
    await request(app.getHttpServer())
        .delete('/restaurants/999999')  // Assuming 999999 does not exist
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
});