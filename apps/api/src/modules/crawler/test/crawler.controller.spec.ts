import { CrawlerController } from '../crawler.controller';

describe('CrawlerController', () => {
  let controller: CrawlerController;

  beforeEach(async () => {
    controller = new CrawlerController();
  });

  describe('healthCheck', () => {
    it('should return a message', async () => {
      expect(await controller.healthCheck()).toEqual({
        message: 'Health check',
      });
    });
  });

  describe('crawl', () => {
    it('should return a message', async () => {
      expect(await controller.crawl({ url: 'https://example.com' })).toEqual({
        message: 'Crawling website initialized',
      });
    });
  });
});
