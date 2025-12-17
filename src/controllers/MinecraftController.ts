import configs from '../config';
import LogsMongoClient from '../libs/mongo/Logs';
import Reflection from '../libs/Reflection';
import { Request, Response, NextFunction } from 'express';
import MinecraftUsersMongoClient from '../libs/mongo/MinecraftUsers';
import MinecraftWorldsMongoClient from '../libs/mongo/MinecraftWorlds';
import MinecraftShopsMongoClient from '../libs/mongo/MinecraftShops';
import moment from 'moment';
import MinecraftItemsMongoClient from '../libs/mongo/MinecraftItems';
import MinecraftShopItem from '../models/MinecraftShopItem';
import MinecraftUserStorageMongoClient from '../libs/mongo/MinecraftUserStorage';
export default class MinecraftController {
  private logger = new LogsMongoClient();
  private MODULE = this.constructor.name;

  async searchItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const term = req.query.term as string;
      if (!term || term.trim().length === 0) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const client = new MinecraftItemsMongoClient();
      const items = await client.search(term, 25);

      res.json({ items: items });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getItemImageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const itemId = req.params.id;
      const client = new MinecraftItemsMongoClient();
      const item = await client.get(itemId);

      if (!item) {
        res.status(404).json({ error: 'Item Not Found' });
        return;
      }

      const assetBuffer = Buffer.from(item.asset_b64, 'base64');
      res.writeHead(200, {
        // add the file name to the content-disposition so browsers can download with the correct name
        'Content-Disposition': `inline; filename="${item.name}.png"`,
        'Content-Type': 'image/png',
        'Content-Length': assetBuffer.length
      });
      res.end(assetBuffer);

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

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

  async listUserStorage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const guildId = req.params.guildId;
      const userId = req.params.userId;
      const uuid = req.params.uuid;

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;


      const client = new MinecraftUserStorageMongoClient();
      const userStorage = await client.getUserStorage(guildId, userId, uuid, (page - 1) * pageSize, pageSize);

      res.render('minecraft/storage/user', {
        ...res.locals,
        title: 'Minecraft User Storage',
        slots: userStorage ? userStorage.slots : 0,
        pager: userStorage ? userStorage.items?.getPager() : null,
        items: userStorage ? userStorage.items?.items : [],
        guildId: guildId,
        userId: userId,
        uuid: uuid,
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

  async listShopItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 10;
      const search: string | undefined = (req.query.search as string) || undefined;

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

      const pagedResults = await client.getShopItems(shopId, (page - 1) * pageSize, pageSize, search);
      res.render('minecraft/shop/item/list', {
        ...res.locals,
        title: `Minecraft Shop - ${shop.name || shop.shop_id}`,
        items: pagedResults.items,
        pager: pagedResults.getPager(),
        shop: shop,
        shopId: shopId,
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listMinecraftItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = 24;
      const search: string | undefined = (req.query.search as string) || undefined;

      const client = new MinecraftItemsMongoClient();
      const pagedResults = await client.getPaged((page - 1) * pageSize, pageSize, search);

      res.render('minecraft/items/list', {
        ...res.locals,
        title: 'Minecraft Items',
        items: pagedResults.items,
        pager: pagedResults.getPager(),
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async editShopItemForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const shopId = req.params.id;
      const variantId = req.params.variantId;

      const client = new MinecraftShopsMongoClient();
      const shop = await client.get(shopId);

      if (!shop || !shop.shop) {
        res.status(404).render('errors/404', {
          ...res.locals,
          title: 'Shop Not Found',
          message: `Minecraft Shop with ID ${shopId} not found.`,
        });
        return;
      }

      let title = "Edit Shop Item";
      let item = null;
      if (!variantId) {
        // this means we are creating a new item
        title = "Add Shop Item";
      } else {
        // we need to find the property of shop.shop with the key name variant_id === variantId
        // shop.shop is a Record<string, MinecraftShopItem>
        item = shop.shop[variantId];
        
        if (!item) {
          res.status(404).render('errors/404', {
            ...res.locals,
            title: 'Shop Item Not Found',
            message: `Shop Item with Variant ID ${variantId} not found in Shop ${shopId}.`,
          });
          return;
        }
        title = `Edit Shop Item - ${item.item_id}`;
      }
      res.render('minecraft/shop/item/edit', {
        ...res.locals,
        title: title,
        shopId: shopId,
        item: item,
      });
    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createShopItemForm(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      res.render('minecraft/shop/item/edit', {
        ...res.locals,
        title: 'Add Shop Item',
        shopId: shopId,
      });

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  private truthyString(value: any): boolean {
    if (!value) return false;
    if (typeof value === 'string') {
      const lowered = value.toLowerCase();
      return lowered === 'true' || lowered === '1' || lowered === 'yes' || lowered === 'on';
    }
    return Boolean(value);
  }

  async updateShopItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      // get the shop data from the form post
      const formData = req.body as Partial<{
        shop_id: string;
        variant_id?: string;
        item_id?: string;
        name?: string;
        enabled: boolean;
        expires_at: string | null; // date string or null
        quantity: number;
        buy: number | null;
        sell: number | null;
        nbt: any;
      }>;

      const expiry = formData.expires_at ? moment(formData.expires_at).utc().unix() : null;
      const shopId = formData.shop_id;

      let variantId = formData.variant_id;
      const itemId = formData.item_id;

      const isEnabled =  this.truthyString(formData.enabled);

      const updateData: Partial<MinecraftShopItem> = {
        item_id: formData.item_id!,
        name: formData.name,
        enabled: isEnabled,
        expires_at: expiry || null,
        quantity: Number(formData.quantity || -1),
        buy: !formData.buy ? 0 : Number(formData.buy),
        sell: !formData.sell ? 0 : Number(formData.sell),
        nbt: formData.nbt ? JSON.parse(formData.nbt) : {},
      };

      if (!itemId) {
        res.status(400).json({ error: 'item_id is required' });
        return;
      }

      if (!shopId) {
        res.status(400).json({ error: 'shop_id is required' });
        return;
      }

      // Normalize variantId: treat empty string as undefined for new items
      if (variantId && typeof variantId === 'string' && variantId.trim().length === 0) variantId = undefined;

      const client = new MinecraftShopsMongoClient();
      const updatedItem = await client.updateShopItem(shopId, variantId, updateData);

      if (!updatedItem) {
        res.status(404).json({ error: 'Shop Item Not Found' });
        return;
      }


      res.redirect(`/minecraft/shop/${shopId}/items`);

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async setShopItemEnabled(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const shopId = req.body.shop_id;
      const variantId = req.body.variant_id;
      const enabled = this.truthyString(req.body.enabled);

      if (!shopId || !variantId) {
        res.status(400).json({ error: 'shop_id and variant_id are required' });
        return;
      }

      const client = new MinecraftShopsMongoClient();
      console.log(`Setting enabled=${enabled} for shop item ${variantId} in shop ${shopId}`);
      const shop = await client.get(shopId);
      if (!shop || !shop.shop || !shop.shop[variantId]) {
        res.status(404).json({ error: 'Shop Item Not Found' });
        return;
      }

      // Update the enabled status
      await client.updateShopItem(shopId, variantId, { enabled: enabled });

      res.redirect(`/minecraft/shop/${shopId}/items`);

    } catch (error: any) {
      // this.logger.error(METHOD, error);
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteShopItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    const METHOD = Reflection.getCallingMethodName();
    try {
      const shopId = req.params.id;
      const variantId = req.params.variantId;

      const client = new MinecraftShopsMongoClient();
      await client.deleteShopItem(shopId, variantId);

      res.redirect(`/minecraft/shop/${shopId}/items`);

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