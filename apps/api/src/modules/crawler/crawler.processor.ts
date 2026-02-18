import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('crawler', {
  concurrency: 1,
  limiter: {
    max: 10,
    duration: 60000,
  },
})
export class CrawlerProcessor extends WorkerHost {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor() {
    super();
  }

  async process(job: Job) {
    console.log(`Processing crawler job ${job.id}`);

    try {
    } catch (error) {
      this.logger.error(`Error processing crawler job ${job.id}`, error);
      throw error;
    }
  }
}
