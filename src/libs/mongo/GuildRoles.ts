import DiscordRoleEntry from "../../models/DiscordGuildRoleEntry";
import PagedResults from "../../models/PagedResults";
import DatabaseMongoClient from "./Database";
import DiscordUsersMongoClient from "./Users";


export default class GuildRolesMongoClient extends DatabaseMongoClient<DiscordRoleEntry> {
  constructor() {
    super();
    this.collectionName = 'guild_roles';
    console.log("DiscordGuildRolesMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 10, search: string = '', additionalFilters?: Record<string, any>): Promise<PagedResults<DiscordRoleEntry>> {
    const collection = await this.getCollection();
    const users = new DiscordUsersMongoClient();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const filteredUsers = await users.get(search);
    const filteredUserMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));

  
    let filter: any = {};
    const andClauses: any[] = [{ deleted: { "$ne": true } }];
    const orClauses: any[] = [];


    if (additionalFilters) {
      filter = { ...filter, ...additionalFilters };
    }

    if (search) {
      search = search.trim();
      if (search.length > 0) {
        orClauses.push([
          { name: { $regex: search, $options: 'i' } },
          { role_id: { $regex: search, $options: 'i' } },
        ]);


        // If caller provided additionalFilters, include them as an AND clause
        if (additionalFilters && Object.keys(additionalFilters).length > 0) {
          andClauses.push(additionalFilters);
        }

      }
    }

    andClauses.push({ $or: orClauses });

    filter = { $and: andClauses };

    const items = await collection.find(filter).skip(skip).limit(take).sort({ published_date: -1, end_date: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async getAll(guildId: string): Promise<DiscordRoleEntry[]> {
      const collection = await this.getCollection();
      return await collection.find({}).sort({ created_at: -1 }).toArray();
    }
  
  async findById(guildId: string, id: string): Promise<DiscordRoleEntry | null> {
      const collection = await this.getCollection();
      return await collection.findOne({ guild_id: guildId, role_id: id });
    }
  
  async findByIds(guildId: string, ids: string[]): Promise<DiscordRoleEntry[]> {
      const collection = await this.getCollection();
      return await collection.find({ guild_id: guildId, role_id: { $in: ids } }).toArray();
    }
}