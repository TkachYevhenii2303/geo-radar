import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerController } from '../crawler.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('CrawlerController', () => {
  let app: INestApplication;
  let controller: CrawlerController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrawlerController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should initialize crawling a website', async () => {
    const response = await request(app.getHttpServer())
      .post('/crawler')
      .send({ url: 'https://intercode.com' })
      .expect(HttpStatus.ACCEPTED)
      .expect({ message: 'Crawling website initialized' });
  });

  afterAll(async () => {
    await app.close();
  });
});
