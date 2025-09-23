import config from '../config';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';
import LogsMongoClient from '../libs/mongo/Logs';
import axios from 'axios';
import Pager from '../models/Pager';


export default class GameKeysController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize as string) || 10);
    const GameKeysMongoClient = (await import('../libs/mongo/GameKeys')).default;
    const client = new GameKeysMongoClient();
    // Get paginated game keys
    const gameKeys = await client.get((page - 1) * pageSize, pageSize);
    // Get total count
    const collection = await client.getCollection();
    const total = await collection.countDocuments({ guild_id: config.tacobot.primaryGuildId });
    const lastPage = Math.ceil(total / pageSize);
    // Calculate beforePages and afterPages
    const beforePages = [];
    for (let i = page - 2; i < page; i++) {
      if (i >= 1 && i <= page) beforePages.push(i);
    }
    const afterPages = [];
    for (let i = page + 1; i <= page + 2; i++) {
      if (i <= lastPage && i >= page) afterPages.push(i);
    }

    const pager = new Pager({
      totalItems: total,
      currentPage: page,
      pageSize: pageSize,
      afterPages: afterPages,
      beforePages: beforePages,
      lastPage: lastPage,
      prevPage: page > 1 ? page - 1 : 1,
      nextPage: page < lastPage ? page + 1 : page,
      hasPrev: page > 1,
      hasNext: page < lastPage,
    });

    res.render('gamekeys/list', {
      title: 'Game Keys',
      items: gameKeys,
      pager: pager,
    });
  };
};