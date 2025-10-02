import LogsMongoClient from "../../../libs/mongo/Logs";
import { Request, Response, NextFunction } from 'express';
import Reflection from '../../../libs/Reflection';
import { tacoBotApiClient, handleApiError, isApiError, isValidGuildId } from '../../../libs/tacobot';

export default class ChannelsController {

  private logger = new LogsMongoClient()
  private MODULE = this.constructor.name;

  async getChannels(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = req.params.guild || req.query.guild as string;

      if (!guildId) {
        res.status(400).json({ error: 'Guild ID is required' });
        return;
      }

      if (!isValidGuildId(guildId)) {
        res.status(400).json({ error: 'Invalid guild ID format' });
        return;
      }

      await this.logger.debug(this.MODULE, `${METHOD} - Fetching channels for guild: ${guildId}`);

      const response = await tacoBotApiClient.getGuildChannels(guildId);

      await this.logger.info(this.MODULE, `${METHOD} - Retrieved ${response.data.length} channels for guild: ${guildId}`);

      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Channels')}`);

        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Guild not found or no channels available' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild channels' });
            return;
          case 401:
            res.status(401).json({ error: 'API authentication failed' });
            return;
          default:
            res.status(error.status || 500).json({ error: error.message });
            return;
        }
      }

      await this.logger.error(this.MODULE, `${METHOD} - Unexpected error: ${error}`);
      next(error);
    }
  }

  async getChannelsByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = req.params.guild || req.query.guild as string;
      let channelIds: string[] = [];
      // Handle both body and query parameter formats
      if (req.body && Array.isArray(req.body.ids)) {
        channelIds = req.body.ids;
      } else if (req.body && Array.isArray(req.body)) {
        channelIds = req.body;
      } else if (req.query.ids) {
        // Handle comma-separated IDs in query string
        channelIds = Array.isArray(req.query.ids)
          ? req.query.ids as string[]
          : (req.query.ids as string).split(',').map(id => id.trim());
      }

      if (!guildId) {
        res.status(400).json({ error: 'Guild ID is required' });
        return;
      }

      if (!isValidGuildId(guildId)) {
        res.status(400).json({ error: 'Invalid guild ID format' });
        return;
      }

      if (!Array.isArray(channelIds) || channelIds.length === 0) {
        res.status(400).json({ error: 'channel_ids must be a non-empty array' });
        return;
      }

      await this.logger.debug(this.MODULE, `${METHOD} - Fetching channels by IDs for guild: ${guildId}`);
      const response = await tacoBotApiClient.getGuildChannelsByIds(guildId, channelIds);

      await this.logger.info(this.MODULE, `${METHOD} - Retrieved ${response.data.length} channels for guild: ${guildId}`);

      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Channels by IDs')}`);

        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Guild not found or no channels available' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild channels' });
            return;
          case 401:
            res.status(401).json({ error: 'API authentication failed' });
            return;
          default:
            res.status(error.status || 500).json({ error: error.message });
            return;
        }
      }

      await this.logger.error(this.MODULE, `${METHOD} - Unexpected error: ${error}`);
      next(error);
    }
  }

}