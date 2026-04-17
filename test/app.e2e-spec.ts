import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {INestApplication} from "@nestjs/common";
import {AppModule} from "@/app.module";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
