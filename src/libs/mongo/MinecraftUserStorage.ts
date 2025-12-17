import MinecraftUserStorageEntry, { MinecraftUserStorageItem } from "../../models/MinecraftUserStorageEntry";
import MinecraftUserStoragePagedItems from "../../models/MinecraftUserStoragePagedItems";
import PagedResults from "../../models/PagedResults";
import DatabaseMongoClient from "./Database";


export default class MinecraftUserStorageMongoClient extends DatabaseMongoClient<MinecraftUserStorageEntry> {
  constructor() {
    super();
    this.collectionName = 'minecraft_user_storage';
  }

  async getUserStorage(guildId: string, userId: string, uuid: string, skip: number = 0, take: number = 100): Promise<MinecraftUserStoragePagedItems> {
    const collection = await this.getCollection();

    const filter = {
      guild_id: guildId,
      user_id: userId,
      uuid: uuid
    };

    const item = await collection.findOne(filter);
    if (!item) {
      return new MinecraftUserStoragePagedItems();
    }

    const totalItems = Object.keys(item.storage).length;

    let filteredItems: MinecraftUserStorageItem[] = Object.values(item.storage);
    
    // Apply pagination
    filteredItems = filteredItems.slice(skip, skip + take);
    return new MinecraftUserStoragePagedItems({
      slots: item.slots,
      items: new PagedResults<MinecraftUserStorageItem>({
        totalItems: totalItems,
        items: filteredItems,
        currentPage: Math.floor(skip / take) + 1,
        pageSize: take
      })
    });
  }
}