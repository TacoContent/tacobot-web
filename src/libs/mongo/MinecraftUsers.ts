import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import PagedResults from '../../models/PagedResults';
import MinecraftUserEntry from '../../models/MinecraftUserEntry';
import DiscordUsersMongoClient from './Users';

export default class MinecraftUsersMongoClient extends DatabaseMongoClient<MinecraftUserEntry> {
  constructor() {
    super();
    this.collectionName = 'minecraft_users';
    console.log("MinecraftUsersMongoClient initialized");
  }

  async get(search?: string): Promise<MinecraftUserEntry[]> {
    const collection = await this.getCollection();

    let filter: any = {};

    if (!search) {
      filter = {};
    } else {
      search = search.trim();
      if (search.length === 0) {
        filter = {};
      } else {
        filter = {
          $or: [
            { username: { "$regex": search, $options: 'i' } },
            { uuid: { "$regex": search, $options: 'i' } },
            { user_id: { "$regex": search, $options: 'i' } },
          ]
        };
      }
    }
    return await collection.find(filter).sort({ created_at: -1 }).toArray();
  }

  async getUser(uuid?: string, username?: string, user_id?: string): Promise<MinecraftUserEntry | null> {
    const collection = await this.getCollection();
    let filter: any = {};
    if (uuid) {
      filter.uuid = uuid;
    }
    if (username) {
      filter.username = username;
    }
    if (user_id) {
      filter.user_id = user_id;
    }
    if (!uuid && !username && !user_id) {
      return null;
    }
    const user = await collection.findOne(filter);
    return user;
  }

  async getOps(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<MinecraftUserEntry>> {
    const collection = await this.getCollection();
    const users = new DiscordUsersMongoClient();

    const filteredUsers = await users.get(search);
    const userMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    let filter: any = {
      "$and": [
        {
          "$or": [
            { username: { "$regex": search, $options: 'i' } },
            { uuid: { "$regex": search, $options: 'i' } },
            { user_id: { $in: Array.from(userMap.keys()) } },
          ],
        },
        {
          "$or": [
            { local: false },
            { local: { $exists: false } },
          ]
        }
      ],
      "op.enabled": true,
      op: { $ne: null },
    };

    if (!search || search.trim().length === 0) {
      filter = {
        "$and": [
          {
            "$or": [
              { local: false },
              { local: { $exists: false } },
            ],
          },
          // only include users that are in the discord users collection
          { 
            "$or": [
              { user_id: { $in: Array.from(userMap.keys()) } }
            ]
          },
          { "op.enabled": true },
          { op: { $ne: null } },
        ],
        
      };
    }
    // select when op.enabled is true
    const items = await collection.find(filter).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async getWhitelist(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<MinecraftUserEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    const users = new DiscordUsersMongoClient();

    const filteredUsers = await users.get(search);
    const userMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));
    let filter = {};
    if (!search || search.trim().length === 0) {
      filter = {};
    } else {
      filter = {
        "$or": [
          { user_id: { $in: Array.from(userMap.keys()) } },
          { username: { "$regex": search, $options: 'i' } },
          { uuid: { "$regex": search, $options: 'i' } },
        ]
      };
    }

    const items = await collection.find(filter).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults<MinecraftUserEntry>({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async addToWhitelist(entry: MinecraftUserEntry): Promise<InsertOneResult<MinecraftUserEntry>> {
    const collection = await this.getCollection();
    entry.whitelist = true
    return await collection.insertOne(entry);
  }

  async setWhitelistStatus(entry: Partial<MinecraftUserEntry>, enabled: boolean): Promise<SetWhitelistResult> {
    const collection = await this.getCollection();
    const filter: any = {
      user_id: entry.user_id,
      uuid: entry.uuid,
      guild_id: entry.guild_id,
    };
    const update = {
      $set: {
        whitelist: enabled,
      }
    };
    const result = await collection.updateOne(filter, update);
    return { status: result.modifiedCount > 0, whitelist: enabled };
  };
}

export interface SetWhitelistResult {
  status: boolean;
  whitelist: boolean;
}