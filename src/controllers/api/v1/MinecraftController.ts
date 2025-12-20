import LogsMongoClient from "../../../libs/mongo/Logs";
import { Request, Response, NextFunction } from 'express';
import Reflection from '../../../libs/Reflection';
import MinecraftItemsMongoClient from "../../../libs/mongo/MinecraftItems";
import MinecraftItemEntry from "../../../models/MinecraftItemEntry";
import Numbers from "../../../libs/Numbers";

export default class MinecraftController {

  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  public async getItems(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const MODULE = Reflection.getCallingMethodName();
    try {
      const query = (req.query.q as string || '').trim().toLowerCase();
      const limit = parseInt((req.query.limit as string || '25').trim(), 10);

      console.log(`Searching Minecraft items with query="${query}" limit=${limit}`);

      const db = new MinecraftItemsMongoClient();

      const items = await db.search(query, Numbers.clamp(limit, 1, 100)) as Partial<MinecraftItemEntry>[];

      // remove internal MongoDB fields
      for (const item of items) {
        delete item._id;
        delete item.asset_b64;
        delete item.source;
        delete item.asset;
      }

      res.json(items);
    } catch (err: any) {
      this.logger.error(MODULE, `Error fetching Minecraft items: ${err.message}`, { error: err });
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      const duration = Date.now() - startTime;
      this.logger.info(MODULE, `Request processed in ${duration}ms`);
    }
  }

  public async getItemById(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const MODULE = Reflection.getCallingMethodName();
    return;
  }


  async getMods(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const search = req.query.search as string || '';

      const client = new MinecraftItemsMongoClient();
      const mods = await client.getMods(search);

      // add minecraft "core" to the start since it doesnt have a mod entry
      mods.unshift({
        id: 'minecraft',
        name: 'Minecraft',
        version: '',
        icon: {
          content_type: 'image/png',
          url: '/images/minecraft/items/minecraft_grass_block.png' // assuming you have an icon for Minecraft core
        }
      });

      res.json(mods);

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}