import config from '../config';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';
import LogsMongoClient from '../libs/mongo/Logs';
import Games from '../libs/consts/SHiFTCodes/Games';
import axios from 'axios';
import ShiftCodeEntry from '../models/ShiftCodeEntry';
import Pager from '../models/Pager';


export default class ShiftCodeController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.body;
    // take the comma separated values for games and platforms, and create arrays
    const games = req.body.games.split(',').map((game: string) => game.trim());

    // get the games from the Games constant
    // game should be { id: string, name: string }
    const validGames = Object.values(Games).map(g => ({ id: g.id, name: g.name }));
    // get the platforms from the Games constant based on the selected games
    const validPlatforms = games.reduce((acc: string[], game: string) => {
      const g = Object.values(Games).find(g => g.id === game);
      if (g) {
        acc.push(...g.platforms);
      }
      return acc;
    }, []);
    // remove duplicates
    const uniquePlatforms: string[] = Array.from(new Set(validPlatforms));
    // get expiry date as unix timestamp converted from the provided date string
    let expiry: number | null = null;
    if (req.body.expiry) {
      const m = moment.utc(req.body.expiry) ;
      if (m.isValid()) {
        expiry = m.valueOf() / 1000;
      }
    }
    let createdAt: number = moment.utc().valueOf() / 1000;
    if (req.body.created_at) {
      const m = moment.utc(req.body.created_at);
      if (m.isValid()) {
        createdAt = m.valueOf() / 1000;
      }
    }

    let reward = req.body.reward || '';
    let notes = req.body.notes || '';
    let source = req.body.source || '';
    let source_id = "tacobot-web";

    // trim all values
    reward = reward.trim();
    notes = notes.trim();
    source = source.trim();
    source_id = source_id.trim();

    try {

      const entry = new ShiftCodeEntry({
        code,
        games: validGames.filter(g => games.includes(g.id)),
        platforms: uniquePlatforms,
        expiry,
        reward,
        notes,
        source,
        source_id,
        created_at: createdAt,
      });

      // post to the tacobot api
      const apiUrl = config.tacobot.api.url;
      const apiToken = config.tacobot.api.token;
      const apiHeader = config.tacobot.api.header;

      console.log('Submitting SHiFT code to Tacobot API:', entry);
      console.log('API URL:', apiUrl);

      let result = await axios.post(`${apiUrl}/webhook/shift`, entry, {
        headers: {
          [apiHeader]: apiToken,
        },
      });
      console.log('Tacobot API response:', result.data);
      console.log('Response status:', result.status);
      res.redirect('/shiftcodes');
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = 5;
    const ShiftCodesMongoClient = (await import('../libs/mongo/ShiftCodes')).default;
    const client = new ShiftCodesMongoClient();
    // Get paginated shift codes
    const shiftCodes = await client.get((page - 1) * pageSize, pageSize);
    // Get total count
    const collection = await client.getCollection();
    const total = await collection.countDocuments();
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
    res.render('shiftcodes/list', {
      title: 'SHiFT Codes',
      items: shiftCodes,
      pager: pager,
    });
  };
};