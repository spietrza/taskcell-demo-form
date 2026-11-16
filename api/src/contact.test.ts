import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './app.module.js';
import { setupApp } from './setup-app.js';

describe('contact', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(() => app.close());

  it('saves a contact and lists it', async () => {
    const body = { name: 'Ada', email: 'ada@example.com', message: 'Hello' };
    const res = await request(app.getHttpServer()).post('/contact').send(body).expect(201);
    expect(res.body).toEqual({ id: 1, ...body });

    const list = await request(app.getHttpServer()).get('/contact').expect(200);
    expect(list.body).toEqual([res.body]);
  });

  it('rejects an empty name with 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/contact')
      .send({ name: '', email: 'ada@example.com', message: 'Hello' })
      .expect(400);
    expect(res.body.message).toContain('name should not be empty');
  });
});
