import MinecraftItemEntry from "../../models/MinecraftItemEntry";
import PagedResults from "../../models/PagedResults";
import DatabaseMongoClient from "./Database";


export default class MinecraftItemsMongoClient extends DatabaseMongoClient<MinecraftItemEntry> {

  constructor() {
    super();
    this.collectionName = 'minecraft_items';
    console.log("MinecraftItemsMongoClient initialized");
  }

  async getPaged(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<MinecraftItemEntry>> {
    const collection = await this.getCollection();
    const query: any = {};
    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive search
      query.$or = [
        { id: regex },
        { name: regex },
        { source: regex }
      ];
    }

    const total = await collection.countDocuments(query);
    const items = await collection.find(query).skip(skip).limit(take).toArray();

    return new PagedResults<MinecraftItemEntry>({
      items: items,
      totalItems: total,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async get(id: string): Promise<MinecraftItemEntry | null> {
    const collection = await this.getCollection();
    const itemEntry = await collection.findOne({ id: id });
    return itemEntry || null;
  }

  async search(term: string, max: number = 25): Promise<MinecraftItemEntry[]> {
    const collection = await this.getCollection();
    const items = await collection.find({
      $or: [
        { id: { $eq: term } },
        { name: { $eq: term } },
        { name: { $regex: term, $options: 'i' } },
        { id: { $regex: term, $options: 'i' } },
        { name: { $regex: term, $options: 'i' } },
        { source: { $regex: term, $options: 'i' } }
      ]
    }).sort({ id: 1, name: 1 }, "asc").limit(max).toArray();
    return items;
  }
}
