import MinecraftItemEntry, { MinecraftMod } from "../../models/MinecraftItemEntry";
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

    // Use aggregation and opt in to disk use for sorts that could exceed the server memory limit.
    // Long-term: add an index on { id: 1, name: 1 } and/or other searchable fields to avoid external sorting.
    const pipeline = [
      { $match: query },
      { $sort: { id: 1, name: 1 } },
      { $skip: skip },
      { $limit: take }
    ];
    const items = await collection.aggregate<MinecraftItemEntry>(pipeline, { allowDiskUse: true }).toArray();

    return new PagedResults<MinecraftItemEntry>({
      items,
      totalItems: total,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async getMods(search: string): Promise<MinecraftMod[]> {

    /*
    id: 'aether:nature_staff',
    asset: 'aether_nature_staff.png',
    name: 'Nature Staff',
    source: 'aether-1.21.1-1.5.10-neoforge.jar',
    mod: {
        id: 'aether',
        version: '1.5.10',
        name: 'The Aether'
    }
    */
    const collection = await this.getCollection();
    const regex = new RegExp(search, 'i'); // case-insensitive search

    // Find distinct mods matching the search term in either mod id or mod name
    // return only mod id, name, version, and icon
    const mods = await collection.aggregate<MinecraftMod>([
      { $match: { 
          mod: { $ne: null },
          $or: [
            { "mod.id": regex },
            { "mod.name": regex }
          ]
        } 
      },
      { $group: { 
          _id: "$mod.id",
          id: { $first: "$mod.id" },
          name: { $first: "$mod.name" },
          version: { $first: "$mod.version" },
          icon: { $first: "$mod.icon" }
        } 
      },
      { $project: { _id: 0, id: 1, name: 1, version: 1, icon: 1 } },
      { $sort: { id: 1 } }
    ]).toArray();

    return mods;
    
  }

  async get(id: string): Promise<MinecraftItemEntry | null> {
    const collection = await this.getCollection();
    const itemEntry = await collection.findOne({ id: id });
    return itemEntry || null;
  }

  async search(term: string, max: number = 25): Promise<MinecraftItemEntry[]> {
    const collection = await this.getCollection();
    const regex = new RegExp(term, 'i');
    const pipeline = [
      { $match: {
          $or: [
            { id: term },
            { name: term },
            { name: { $regex: regex } },
            { id: { $regex: regex } },
            { source: { $regex: regex } }
          ]
        }
      },
      { $sort: { id: 1, name: 1 } },
      { $limit: max }
    ];

    const items = await collection.aggregate<MinecraftItemEntry>(pipeline, { allowDiskUse: true }).toArray();
    return items;
  }
}
