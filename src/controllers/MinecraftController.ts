import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';
import MinecraftUsersMongoClient from '../libs/mongo/MinecraftUsers';
import MinecraftWorldsMongoClient from '../libs/mongo/MinecraftWorlds';
import MinecraftShopsMongoClient from '../libs/mongo/MinecraftShops';
import moment from 'moment';
export default class MinecraftController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async listOps(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;
      const client = new MinecraftUsersMongoClient();
      const pagedResults = await client.getOps((page - 1) * pageSize, pageSize, search);

      res.render('minecraft/ops/list', {
        ...res.locals,
        title: 'Minecraft Ops',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listWhitelist(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;

      const client = new MinecraftUsersMongoClient();
      const pagedResults = await client.getWhitelist((page - 1) * pageSize, pageSize, search);

      res.render('minecraft/whitelist/list', {
        ...res.locals,
        title: 'Minecraft Whitelist',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listWorlds(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;

      const client = new MinecraftWorldsMongoClient();
      const pagedResults = await client.getWorlds((page - 1) * pageSize, pageSize, search);
      res.render('minecraft/worlds/list', {
        ...res.locals,
        title: 'Minecraft Worlds',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listShops(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;

      const additionalFilters: any = {};

      const qIncludeDisabled = req.query.includeDisabled === undefined ? undefined : req.query.includeDisabled === 'true';
      const qIncludeExpired = req.query.includeExpired === undefined ? undefined : req.query.includeExpired === 'true';
      const includeDisabled: boolean = qIncludeDisabled === undefined ? true : qIncludeDisabled;
      const includeExpired: boolean = qIncludeExpired === undefined ? true : qIncludeExpired;
      const andClauses: any[] = [];
      // If includeDisabled or includeExpired are false, we need to *restrict* results
      // so all of the non-inclusion conditions must hold (AND semantics).
      if (!includeDisabled) {
        andClauses.push({ enabled: true });
      }
      if (!includeExpired) {
        const unixNow = moment().unix();
        // Only include items that haven't expired yet: expires_at >= now OR expires_at is null
        andClauses.push({ $or: [{ expires_at: { $gte: unixNow } }, { expires_at: null }] });
      }
      if (andClauses.length > 0) {
        if (additionalFilters.$and) {
          additionalFilters.$and.push(...andClauses);
        } else {
          additionalFilters.$and = andClauses;
        }
      } 

      res.locals.includeDisabled = includeDisabled;
      res.locals.includeExpired = includeExpired;

      const client = new MinecraftShopsMongoClient();
      const pagedResults = await client.getShops((page - 1) * pageSize, pageSize, search, additionalFilters);
      res.render('minecraft/shop/list', {
        ...res.locals,
        title: 'Minecraft Shops',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createShopForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      res.render('minecraft/shop/edit', {
        ...res.locals,
        title: 'Create New Minecraft Shop',
      });
    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async editShopForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const shopId = req.params.id;

      const client = new MinecraftShopsMongoClient();
      const shop = await client.get(shopId);

      if (!shop) {
        res.status(404).render('errors/404', {
          ...res.locals,
          title: 'Shop Not Found',
          message: `Minecraft Shop with ID ${shopId} not found.`,
        });
        return;
      }

      res.render('minecraft/shop/edit', {
        ...res.locals,
        title: `Edit Minecraft Shop - ${shop.name || shop.shop_id}`,
        shop: shop,
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async viewShopItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const shopId = req.params.id;
      const client = new MinecraftShopsMongoClient();
      const shop = await client.get(shopId);

      if (!shop) {
        res.status(404).render('errors/404', {
          ...res.locals,
          title: 'Shop Not Found',
          message: `Minecraft Shop with ID ${shopId} not found.`,
        });
        return;
      }

      res.render('minecraft/shop/item/list', {
        ...res.locals,
        title: `Minecraft Shop - ${shop.name || shop.shop_id}`,
        shop: shop,
        shopId: shopId,
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateShop(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const shopId = req.params.id;
      const updateData = req.body;

      const client = new MinecraftShopsMongoClient();
      const updatedShop = await client.update(updateData);

      if (!updatedShop) {
        res.status(404).json({ error: 'Shop Not Found' });
        return;
      }

      res.json({ message: 'Shop updated successfully', shop: updatedShop });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}