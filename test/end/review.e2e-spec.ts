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
import { CreateReviewDto } from '../../src/dtos/review/create-review.dto';
import { UpdateReviewDto } from '../../src/dtos/review/update-review.dto';

describe('ReviewsController (e2e)', () => {
    let app: INestApplication;
    let connection: DataSource;
    let createdReviewId: number;
    let createdRestaurantId: number;
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

    // Create a restaurant for testing reviews
    const createRestaurantResponse = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
        name: 'Test Restaurant',
        address: '123 Test St',
        phoneNumber: '1234567890'
        })
        .expect(201);

    createdRestaurantId = createRestaurantResponse.body.id;
    });

    afterAll(async () => {
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
    });

    it('should create a new review', async () => {
    const createReviewDto: CreateReviewDto = {
        comment: 'Great restaurant!',
        rating: 5,
        userId: userId,
        restaurantId: createdRestaurantId
    };

    const response = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createReviewDto)
        .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.comment).toBe(createReviewDto.comment);
    expect(response.body.rating).toBe(createReviewDto.rating);

    createdReviewId = response.body.id;
    });

    it('should get all reviews', async () => {
    const response = await request(app.getHttpServer())
        .get('/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('totalCount');
    expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should get a review by id', async () => {
    const response = await request(app.getHttpServer())
        .get(`/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

    expect(response.body).toHaveProperty('id', createdReviewId);
    expect(response.body).toHaveProperty('comment');
    expect(response.body).toHaveProperty('rating');
    });

    it('should update a review', async () => {
    const updateReviewDto: UpdateReviewDto = {
        comment: 'Updated review',
        rating: 4
    };

    const response = await request(app.getHttpServer())
        .put(`/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateReviewDto)
        .expect(200);

    expect(response.body).toHaveProperty('id', createdReviewId);
    expect(response.body.comment).toBe(updateReviewDto.comment);
    expect(response.body.rating).toBe(updateReviewDto.rating);
    });

    it('should delete a review', async () => {
    await request(app.getHttpServer())
        .delete(`/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

    await request(app.getHttpServer())
        .get(`/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should handle bad request errors when creating a review', async () => {
    const invalidCreateReviewDto = {
        comment: '',
        rating: 6,  // Invalid rating (assuming 1-5 scale)
        userId: 2,
        restaurantId: createdRestaurantId
    };

    await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCreateReviewDto)
        .expect(400);
    });

    it('should handle not found errors when getting a non-existing review', async () => {
    await request(app.getHttpServer())
        .get('/reviews/999999')  // Assuming 999999 does not exist
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should handle bad request errors when updating with invalid data', async () => {
    const updateReviewDto: UpdateReviewDto = {
        comment: '',
        rating: 5
    };

    await request(app.getHttpServer())
        .put(`/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateReviewDto)
        .expect(400);  // Expecting a BadRequestException
    });

    it('should handle not found errors when deleting a non-existing review', async () => {
    await request(app.getHttpServer())
        .delete('/reviews/999999')  // Assuming 999999 does not exist
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should handle forbidden errors when a user tries to update another user\'s review', async () => {
    const createReviewDto: CreateReviewDto = {
        comment: 'Another great review!',
        rating: 5,
        userId: userId,
        restaurantId: createdRestaurantId
    };

    const createResponse = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createReviewDto)
        .expect(201);

    const newReviewId = createResponse.body.id;

    const updateReviewDto: UpdateReviewDto = {
        comment: 'Trying to update someone else\'s review',
        rating: 1
    };

    await request(app.getHttpServer())
        .put(`/reviews/${newReviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateReviewDto)
        .expect(403);
    });
});