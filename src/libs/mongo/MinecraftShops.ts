import MinecraftShopEntry from "../../models/MinecraftShopEntry";
import DatabaseMongoClient from "./Database";
import PagedResults from '../../models/PagedResults';
import MinecraftUsersMongoClient from './MinecraftUsers';
import DiscordUsersMongoClient from './Users';
import Identity from "../Identity";
import MinecraftShopItem from "../../models/MinecraftShopItem";
import moment from "moment";


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

  async updateShopItem(shopId: string, itemVariantId: string, itemData: Partial<MinecraftShopItem>): Promise<MinecraftShopItem> {
    const collection = await this.getCollection();

    const updateField = `shop.${itemVariantId}`;

    // find the shop to ensure it exists
    const shopEntry = await this.get(shopId);
    if (!shopEntry) {
      throw new Error(`MinecraftShopEntry with id ${shopId} not found`);
    }

    if (itemData.variant_id && itemData.variant_id !== itemVariantId) {
      // variant ID has changed, we need to remove the old item first
      await collection.updateOne(
        { shop_id: shopId },
        { $unset: { [`shop.${itemVariantId}`]: "" } }
      );
    }

    // if the item already exists, preserve its created_at and created_by fields
    const existingItem = shopEntry.shop ? shopEntry.shop[itemVariantId] : null;
    if (existingItem) {
      itemData.created_at = existingItem.created_at;
      itemData.created_by = existingItem.created_by;
      itemData.updated_at = moment().utc().unix();
      itemData.updated_by = itemData.updated_by || existingItem.updated_by;
    } else {
      itemData.created_at = moment().utc().unix();
    }
    itemData.updated_at = moment().utc().unix();


    await collection.updateOne(
      { shop_id: shopId },
      { $set: { [updateField]: itemData } }
    );

    const updatedShop = await this.get(shopId);
    if (!updatedShop || !updatedShop.shop || !updatedShop.shop[itemVariantId]) {
      throw new Error("Failed to retrieve updated MinecraftShopItem");
    }
    return updatedShop.shop[itemVariantId];
  }
}