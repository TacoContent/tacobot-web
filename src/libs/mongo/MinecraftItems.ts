import MinecraftItemEntry from "../../models/MinecraftItemEntry";
import DatabaseMongoClient from "./Database";


export default class MinecraftItemsMongoClient extends DatabaseMongoClient<MinecraftItemEntry> {

  constructor() {
    super();
    this.collectionName = 'minecraft_items';
    console.log("MinecraftItemsMongoClient initialized");
  }

  async get(id: string): Promise<MinecraftItemEntry | null> {
    const collection = await this.getCollection();
    const itemEntry = await collection.findOne({ id: id });
    return itemEntry || null;
  }

  async search(term: string, max: number = 25): Promise<MinecraftItemEntry[]> {
    const collection = await this.getCollection();
    const regex = new RegExp(term, 'i'); // case-insensitive search
    const items = await collection.find({
      $or: [
        { id: regex },
        { name: regex },
        { source: regex }
      ]
    }).limit(max).toArray();
    return items;
  }
}
