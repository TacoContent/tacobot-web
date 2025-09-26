import configs from '../../../config';
import * as fs from 'fs';
import LogsMongoClient from '../../../libs/mongo/Logs';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import Reflection from '../../../libs/Reflection';

export default class TwitchController {

  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async getAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      // if req.params.username exists, use it; otherwise, if req.query.username exists, use it
      const username = req.params.username as string || req.query.username as string || req.params.channel as string || req.query.channel as string;
      if (!username) {
        console.log('No username provided');
        res.status(404).send('User not found').end();
        return;
      }

      const apiUrl = `http://decapi.me/twitch/avatar/${encodeURIComponent(username)}`;
      // get the url response, then pull the image from that url and pipe it to the response
      const axios = (await import('axios')).default;
      const apiResponse = await axios.get(apiUrl); // just to verify user exists
      const avatarUrl = apiResponse.data;
      if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.startsWith('http')) {
        console.log('Invalid avatar URL:', avatarUrl);
        console.log('API Response:', apiResponse);
        res.status(404).send('User not found').end();
        return;
      }
      
      // now get the image from the avatarUrl and pipe it to the response
      const response = await axios.get(avatarUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');

      // if error, send 404
      response.data.on('error', (err: any) => {
        res.status(404).send('User not found').end();
      });
      response.data.on('end', () => {
        res.end();
      });

      response.data.pipe(res);
      
    } catch (error: any) {
      await this.logger.error(`${this.MODULE}.${METHOD}`, error.message, {
        stack: error.stack,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(error);
    }
  }
}