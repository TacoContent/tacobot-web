import LogsMongoClient from "../../../libs/mongo/Logs";
import { Request, Response, NextFunction } from 'express';
import Reflection from '../../../libs/Reflection';
import { tacoBotApiClient, handleApiError, isApiError, isValidGuildId } from '../../../libs/tacobot';

export default class RolesController {

  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = (req.params.guild || req.query.guild) as string;

      if (!guildId) {
        res.status(400).json({ error: 'Guild ID is required' });
        return;
      }

      if (!isValidGuildId(guildId)) {
        res.status(400).json({ error: 'Invalid guild ID format' });
        return;
      }

      await this.logger.debug(this.MODULE, `${METHOD} - Fetching roles for guild: ${guildId}`);

      const response = await tacoBotApiClient.getGuildRoles(guildId);

      await this.logger.info(this.MODULE, `${METHOD} - Retrieved ${response.data.length} roles for guild: ${guildId}`);

      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Roles')}`);

        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Guild not found or no roles available' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild roles' });
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

  async getRolesByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = (req.params.guild || req.query.guild) as string;
      let roleIds: string[] = [];

      // Accept array body, { ids: [] }, or query ids=1,2,3
      if (req.body && Array.isArray(req.body.ids)) {
        roleIds = req.body.ids;
      } else if (req.body && Array.isArray(req.body)) {
        roleIds = req.body;
      } else if (req.query.ids) {
        roleIds = Array.isArray(req.query.ids)
          ? (req.query.ids as string[])
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

      if (!Array.isArray(roleIds) || roleIds.length === 0) {
        res.status(400).json({ error: 'role_ids must be a non-empty array' });
        return;
      }

      await this.logger.debug(this.MODULE, `${METHOD} - Fetching roles by IDs for guild: ${guildId}`);
      const response = await tacoBotApiClient.getGuildRolesByIds(guildId, roleIds);

      await this.logger.info(this.MODULE, `${METHOD} - Retrieved ${response.data.length} roles for guild: ${guildId}`);

      res.json(response.data);
    } catch (error) {
      if (isApiError(error)) {
        await this.logger.error(this.MODULE, `${METHOD} - API Error: ${handleApiError(error, 'Get Roles by IDs')}`);

        switch (error.status) {
          case 404:
            res.status(404).json({ error: 'Guild not found or no roles available' });
            return;
          case 403:
            res.status(403).json({ error: 'Access denied to guild roles' });
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
