import MinecraftShopEntry from "../../models/MinecraftShopEntry";
import DatabaseMongoClient from "./Database";
import PagedResults from '../../models/PagedResults';
import MinecraftUsersMongoClient from './MinecraftUsers';
import DiscordUsersMongoClient from './Users';
import Identity from "../Identity";
import MinecraftShopItem from "../../models/MinecraftShopItem";
import moment from "moment";
import { calculateVariantId } from "../Minecraft/Item";
import MinecraftItemsMongoClient from './MinecraftItems';
import { filter } from "mathjs";


export default class MinecraftShopsMongoClient extends DatabaseMongoClient<MinecraftShopEntry> {

  constructor() {
    super();
    this.collectionName = 'minecraft_shops';
    console.log("MinecraftShopsMongoClient initialized");
  }

  async get(id: string): Promise<MinecraftShopEntry | null> {
    const collection = await this.getCollection();
    const shopEntry = await collection.findOne({ shop_id: id });
    return shopEntry || null;
  }

  async getShops(skip: number = 0, take: number = 100, search?: string, additionalFilters?: any): Promise<PagedResults<MinecraftShopEntry>> {
    const collection = await this.getCollection();
    const discordUsers = new DiscordUsersMongoClient();
    const minecraftUsers = new MinecraftUsersMongoClient();

    const filteredDiscordUsers = await discordUsers.get(search);
    const discordUserMap = new Map(filteredDiscordUsers.map(discordUser => [discordUser.user_id, discordUser.displayname]));

    const filteredMinecraftUsers = await minecraftUsers.get(search);
    const minecraftUserMap = new Map(filteredMinecraftUsers.map(mcUser => [mcUser.uuid, mcUser.username]));
    /*

      {
        _id: new ObjectId("64f1e4f5d6e4f5a3b2c1d0e9"),
        name: 'Taco Shop',
        shop_id: 'TS1SHEtuo60CKzCs',
        guild_id: '942532970613473293',
        user_id: null,
        role_ids: [],
        enabled: true,

      }
    */

    let filter: any = {};

    if (additionalFilters && Object.keys(additionalFilters).length > 0) {
      // shallow copy so we don't mutate the caller's object
      filter = { ...additionalFilters };
    }

    console.log("filter", filter);

    if (search) {
      search = search.trim();
      if (search.length > 0) {
        const matchingUserIds = new Set<string>();

        for (const [userId, displayName] of discordUserMap) {
          if (displayName.toLowerCase().includes(search.toLowerCase())) {
            matchingUserIds.add(userId);
          }
        }

        for (const [uuid, username] of minecraftUserMap) {
          if (username.toLowerCase().includes(search.toLowerCase())) {
            const mcUser = filteredMinecraftUsers.find(u => u.uuid === uuid);
            if (mcUser && mcUser.user_id) {
              matchingUserIds.add(mcUser.user_id);
            }
          }
        }
        
        const orClauses: any[] = [
          { user_id: { $in: Array.from(matchingUserIds) } },
          { name: { $regex: search, $options: 'i' } },
        ];

        const andClauses: any[] = [];

        // If caller provided additionalFilters, include them as an AND clause
        if (additionalFilters && Object.keys(additionalFilters).length > 0) {
          andClauses.push(additionalFilters);
        }
        andClauses.push({ $or: orClauses });

        filter = { $and: andClauses };
      }
    }

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const totalResults = await collection.countDocuments(filter);
    const shopEntries = await collection.find(filter).skip(skip).limit(take).toArray();

    return new PagedResults<MinecraftShopEntry>({
      items: shopEntries,
      totalItems: totalResults,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async getShopItems(shopId: string, skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<MinecraftShopItem>> {
    const collection = await this.getCollection();

    const shopEntry = await this.get(shopId);
    if (!shopEntry) {
      throw new Error(`MinecraftShopEntry with id ${shopId} not found`);
    }

    const allItems = shopEntry.shop ? Object.values(shopEntry.shop) : [];
    const totalItems = allItems.length;

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    // filter by search term if provided
    let filteredItems = allItems;

    if (search && search.trim().length > 0) {
      const searchLower = search.trim().toLowerCase();
      filteredItems = allItems.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.item_id && item.item_id.toLowerCase().includes(searchLower))
      );
    }

    const pagedItems = filteredItems.slice(skip, skip + take);

    return new PagedResults<MinecraftShopItem>({
      items: pagedItems,
      totalItems: totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async update(entry: Partial<MinecraftShopEntry>): Promise<MinecraftShopEntry> {
    try {
      const collection = await this.getCollection();

      if (!entry.shop_id) {
        // create a new unique shop id
        entry.shop_id = Identity.generateId(16);
      }

      if (!entry.name) {
        entry.name = `Shop_${entry.shop_id}`;
      }

      // create a payload that excludes `shop` property. That property is updated separately.
      const { shop, ...updateData } = entry;

      await collection.updateOne(
        { shop_id: entry.shop_id },
        { $set: updateData },
        { upsert: true }
      );

      // return the full entry including shop
      const updatedEntry = await this.get(entry.shop_id);
      if (!updatedEntry) {
        throw new Error("Failed to retrieve updated MinecraftShopEntry");
      }
      return updatedEntry;
    } catch (error) {
      console.error("Error updating MinecraftShopEntry:", error);
      throw error;
    }
  }

  async updateShopItem(shopId: string, itemVariantId: string | undefined, itemData: Partial<MinecraftShopItem>): Promise<MinecraftShopItem> {
    const collection = await this.getCollection();

    // find the shop to ensure it exists
    const shopEntry = await this.get(shopId);
    if (!shopEntry) {
      throw new Error(`MinecraftShopEntry with id ${shopId} not found`);
    }

    // Determine whether this is an existing item (based on provided variant id)
    const existingItem = (itemVariantId && shopEntry.shop) ? shopEntry.shop[itemVariantId] : null;

    // For existing items, item_id comes from the stored item. For new items, item_id must be provided.
    if (existingItem) {
      // Ensure we use the stored item_id for existing items (immutable)
      itemData.item_id = existingItem.item_id;
    } else {
      if (!itemData.item_id) {
        throw new Error('item_id is required for new items');
      }
    }

    // Prefer provided NBT when calculating the canonical variant id; fall back to existing item's NBT or empty object
    const nbtForVariant = (itemData.nbt !== undefined) ? itemData.nbt : (existingItem ? existingItem.nbt : {});
    const canonicalVariantId = calculateVariantId(itemData.item_id!, nbtForVariant || {});

    // For existing items: DO NOT allow item_id or name to change — enforce previous values
    let finalVariantId = canonicalVariantId;
    if (existingItem) {
      // enforce immutable fields
      itemData.item_id = existingItem.item_id;
      itemData.name = existingItem.name;

      // if NBT/variant changed such that canonicalVariantId differs from provided variant key, we need to move the item
      if (canonicalVariantId !== itemVariantId) {
        // remove old key
        await collection.updateOne(
          { shop_id: shopId },
          { $unset: { [`shop.${itemVariantId}`]: "" } }
        );
        finalVariantId = canonicalVariantId;
      } else {
        finalVariantId = itemVariantId!;
      }

      // preserve creation metadata
      itemData.created_at = existingItem.created_at;
      itemData.created_by = existingItem.created_by;
      itemData.updated_at = moment().utc().unix();
      itemData.updated_by = itemData.updated_by || existingItem.updated_by;

    } else {
      // New item: ensure variant id matches canonical id and fetch name if missing
      itemData.variant_id = canonicalVariantId;
      finalVariantId = canonicalVariantId;

      // If name is missing or empty, try to fetch from MinecraftItems collection
      if (!itemData.name || (typeof itemData.name === 'string' && itemData.name.trim().length === 0)) {
        try {
          const itemsClient = new MinecraftItemsMongoClient();
          const item = await itemsClient.get(itemData.item_id);
          if (item && item.name) itemData.name = item.name;
        } catch (err) {
          console.warn('Failed to fetch item name for', itemData.item_id, err);
        }
      }

      // set timestamps
      itemData.created_at = moment().utc().unix();
      itemData.updated_at = moment().utc().unix();
    }

    const updateField = `shop.${finalVariantId}`;

    await collection.updateOne(
      { shop_id: shopId },
      { $set: { [updateField]: itemData } }
    );

    const updatedShop = await this.get(shopId);
    if (!updatedShop || !updatedShop.shop || !updatedShop.shop[finalVariantId]) {
      throw new Error("Failed to retrieve updated MinecraftShopItem");
    }
    return updatedShop.shop[finalVariantId];
  }

  async deleteShopItem(shopId: string, itemVariantId: string): Promise<void> {
    const collection = await this.getCollection();

    // find the shop to ensure it exists
    const shopEntry = await this.get(shopId);
    if (!shopEntry) {
      throw new Error(`MinecraftShopEntry with id ${shopId} not found`);
    }

    if (!shopEntry.shop || !shopEntry.shop[itemVariantId]) {
      throw new Error(`MinecraftShopItem with variant id ${itemVariantId} not found in shop ${shopId}`);
    }

    await collection.updateOne(
      { shop_id: shopId },
      { $unset: { [`shop.${itemVariantId}`]: "" } }
    );
  }
}