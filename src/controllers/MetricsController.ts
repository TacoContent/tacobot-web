import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

export default class MetricsController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    const method = this.get.name;
    try {
      this.logger.info(`${this.MODULE}.${method}`, 'Fetching metrics data');
      res.set('Content-Type', client.register.contentType);
      const metrics = await client.register;

      const collectDefaultMetrics = await client.collectDefaultMetrics({
        register: metrics,
      });

      res.end(await metrics.metrics());
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      this.logger.error(`${this.MODULE}.${method}`, 'Error fetching metrics data', err);
      next(err);
    }
  }

}