import LogsMongoClient from "../../../libs/mongo/Logs";
import { Request, Response, NextFunction } from 'express';
import Reflection from '../../../libs/Reflection';
import { tacoBotApiClient, handleApiError, isApiError, isValidGuildId } from '../../../libs/tacobot';

export default class EmojisController {
    private logger = new LogsMongoClient();
    private MODULE = this.constructor.name;
  
  async getEmojis(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      
      await this.logger.debug(this.MODULE, `${METHOD} - Fetching emojis for guild: ${guildId}`);
      
      const response = await tacoBotApiClient.getGuildEmojis(guildId);
      
      await this.logger.info(this.MODULE, `${METHOD} - Retrieved ${response.data.length} emojis for guild: ${guildId}`);
      
      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Emojis')}`);
        
        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Guild not found or no emojis available' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild emojis' });
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

  async getEmojiById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = req.params.guild || req.query.guild as string;
      const emojiId = req.params.id || req.query.id as string;
      
      if (!guildId || !emojiId) {
        res.status(400).json({ error: 'Guild ID and Emoji ID are required' });
        return;
      }
      
      if (!isValidGuildId(guildId)) {
        res.status(400).json({ error: 'Invalid guild ID format' });
        return;
      }
      
      await this.logger.debug(this.MODULE, `${METHOD} - Fetching emoji ${emojiId} for guild: ${guildId}`);
      
      const response = await tacoBotApiClient.getGuildEmojiById(guildId, emojiId);
      
      await this.logger.info(this.MODULE, `${METHOD} - Retrieved emoji ${response.data.name} (${emojiId}) for guild: ${guildId}`);
      
      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Emoji By ID')}`);
        
        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Emoji not found' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild emoji' });
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

  async getEmojiByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = req.params.guild || req.query.guild as string;
      const emojiName = req.params.emoji_name || req.query.name as string;
      
      if (!guildId || !emojiName) {
        res.status(400).json({ error: 'Guild ID and Emoji Name are required' });
        return;
      }
      
      if (!isValidGuildId(guildId)) {
        res.status(400).json({ error: 'Invalid guild ID format' });
        return;
      }
      
      // Validate emoji name format (basic validation)
      if (!/^[a-zA-Z0-9_]{2,32}$/.test(emojiName)) {
        res.status(400).json({ error: 'Invalid emoji name format' });
        return;
      }
      
      await this.logger.debug(this.MODULE, `${METHOD} - Fetching emoji '${emojiName}' for guild: ${guildId}`);
      
      const response = await tacoBotApiClient.getGuildEmojiByName(guildId, emojiName);
      
      await this.logger.info(this.MODULE, `${METHOD} - Retrieved emoji '${response.data.name}' (${response.data.id}) for guild: ${guildId}`);
      
      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Emoji By Name')}`);
        
        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Emoji not found' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild emoji' });
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

  async getEmojisByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = req.params.guild || req.query.guild as string;
      let emojiIds: string[] = [];
      
      // Handle both body and query parameter formats
      if (req.body && Array.isArray(req.body.ids)) {
        emojiIds = req.body.ids;
      } else if (req.body && Array.isArray(req.body)) {
        emojiIds = req.body;
      } else if (req.query.ids) {
        // Handle comma-separated IDs in query string
        emojiIds = Array.isArray(req.query.ids) 
          ? req.query.ids as string[]
          : (req.query.ids as string).split(',').map(id => id.trim());
      }
      
      if (!guildId) {
        res.status(400).json({ error: 'Guild ID is required' });
        return;
      }
      
      if (!emojiIds.length) {
        res.status(400).json({ error: 'At least one emoji ID is required' });
        return;
      }
      
      if (!isValidGuildId(guildId)) {
        res.status(400).json({ error: 'Invalid guild ID format' });
        return;
      }
      
      // Validate emoji IDs (should be numeric Discord snowflakes)
      const invalidIds = emojiIds.filter(id => !/^\d{17,20}$/.test(id));
      if (invalidIds.length > 0) {
        res.status(400).json({ 
          error: 'Invalid emoji ID format', 
          invalidIds: invalidIds 
        });
        return;
      }
      
      // Limit batch size to prevent abuse
      if (emojiIds.length > 50) {
        res.status(400).json({ 
          error: 'Too many emoji IDs requested', 
          limit: 50, 
          requested: emojiIds.length 
        });
        return;
      }
      
      await this.logger.debug(this.MODULE, `${METHOD} - Fetching ${emojiIds.length} emojis for guild: ${guildId}`);
      
      const response = await tacoBotApiClient.getGuildEmojisByIds(guildId, emojiIds);
      
      await this.logger.info(this.MODULE, `${METHOD} - Retrieved ${response.data.length} emojis for guild: ${guildId}`);
      
      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Emojis By IDs')}`);
        
        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Guild not found or some emojis not available' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild emojis' });
            return;
          case 401:
            res.status(401).json({ error: 'API authentication failed' });
            return;
          case 400:
            res.status(400).json({ error: 'Invalid request format or parameters' });
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

  async getEmojisByNames(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = req.params.guild || req.query.guild as string;
      let emojiNames: string[] = [];
      
      // Handle both body and query parameter formats
      if (req.body && Array.isArray(req.body.names)) {
        emojiNames = req.body.names;
      } else if (req.body && Array.isArray(req.body)) {
        emojiNames = req.body;
      } else if (req.query.names) {
        // Handle comma-separated names in query string
        emojiNames = Array.isArray(req.query.names) 
          ? req.query.names as string[]
          : (req.query.names as string).split(',').map(name => name.trim());
      }
      
      if (!guildId) {
        res.status(400).json({ error: 'Guild ID is required' });
        return;
      }
      
      if (!emojiNames.length) {
        res.status(400).json({ error: 'At least one emoji name is required' });
        return;
      }
      
      if (!isValidGuildId(guildId)) {
        res.status(400).json({ error: 'Invalid guild ID format' });
        return;
      }
      
      // Validate emoji names (should be valid Discord emoji names)
      const invalidNames = emojiNames.filter(name => !/^[a-zA-Z0-9_]{2,32}$/.test(name));
      if (invalidNames.length > 0) {
        res.status(400).json({ 
          error: 'Invalid emoji name format', 
          invalidNames: invalidNames 
        });
        return;
      }
      
      // Limit batch size to prevent abuse
      if (emojiNames.length > 50) {
        res.status(400).json({ 
          error: 'Too many emoji names requested', 
          limit: 50, 
          requested: emojiNames.length 
        });
        return;
      }
      
      await this.logger.debug(this.MODULE, `${METHOD} - Fetching ${emojiNames.length} emojis by names for guild: ${guildId}`);
      
      const response = await tacoBotApiClient.getGuildEmojisByNames(guildId, emojiNames);
      
      await this.logger.info(this.MODULE, `${METHOD} - Retrieved ${response.data.length} emojis by names for guild: ${guildId}`);
      
      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Emojis By Names')}`);
        
        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Guild not found or some emojis not available' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild emojis' });
            return;
          case 401:
            res.status(401).json({ error: 'API authentication failed' });
            return;
          case 400:
            res.status(400).json({ error: 'Invalid request format or parameters' });
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