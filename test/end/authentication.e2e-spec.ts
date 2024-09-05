import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../src/entities/user.entity';
import { Restaurant } from '../../src/entities/restaurant.entity';
import { Review } from '../../src/entities/review.entity';
import { seedDatabase } from '../test.seeder';
import { Role } from '../../src/enums/Role';
import { UserDto } from '../../src/dtos/auth/user.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT, 10) + 1,
          username: process.env.POSTGRES_USER ,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [User, Restaurant, Review],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    connection = app.get(DataSource);

    await seedDatabase(connection);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should successfully register a new user', async () => {
      const signupData: UserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty(
        'message',
        'User registered successfully',
      );
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('number');
    });

    it('should fail to register a user with existing username', async () => {
      const signupData: UserDto = {
        username: 'testuser1', // Assuming 'testuser1' exists in seed data
        email: 'uniqueemail@example.com',
        password: 'AnotherPass123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupData)
        .expect(409);

      expect(response.body).toHaveProperty('statusCode', 409);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should fail to register a user with invalid data', async () => {
      const signupData: UserDto = {
        username: '',
        email: 'invalid-email',
        password: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

    describe('/auth/login (POST)', () => {
      it('should successfully log in an existing user', async () => {
        const loginData: UserDto = {
          username: 'admin', // Assuming 'admin' exists in seed data
          password: 'admin',
          email: 'admin@example.com'
        };
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('payload');
        expect(response.body.payload).toHaveProperty('accessToken');
        expect(response.body.payload).toHaveProperty('username', loginData.username);
        expect(response.body.payload).toHaveProperty('id');
        expect(response.body.payload).toHaveProperty('role', Role.ADMIN);
    });

      it('should fail to log in with incorrect password', async () => {
        const loginData: UserDto = {
          username: 'admin',
          password: 'wrongpassword',
          email: 'admin@example.com'
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('statusCode', 401);
        expect(response.body).toHaveProperty('message', 'Invalid credentials');
      });

      it('should fail to log in a non-existing user', async () => {
        const loginData: UserDto = {
          username: 'nonexistentuser',
          password: 'somepassword',
          email: 'example@example.com'
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('statusCode', 401);
        expect(response.body).toHaveProperty('message', 'Invalid credentials');
      });

      it('should fail to log in with invalid data', async () => {
        const loginData: UserDto = {
          username: '',
          password: '',
          email: ''
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('statusCode', 400);
      });
    });
});
