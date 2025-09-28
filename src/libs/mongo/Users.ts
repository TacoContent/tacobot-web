import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import DiscordUserEntry from '../../models/DiscordUserEntry';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';

interface IGuildUserPair {
  guildId: string;
  userId: string;
}

class DiscordUsersMongoClient extends DatabaseMongoClient<DiscordUserEntry> {
  constructor() {
    super();
    this.collectionName = 'users';
    console.log("DiscordUsersMongoClient initialized");
  }

  async get(search?: string): Promise<DiscordUserEntry[]> {
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
            { discriminator: { "$regex": search, $options: 'i' } },
            { displayname: { "$regex": search, $options: 'i' } },
            { user_id: { "$regex": search, $options: 'i' } },
          ]
        };
      }
    }
    return await collection.find(filter).sort({ created_at: -1 }).toArray();
  }

  async findById(id: IGuildUserPair): Promise<DiscordUserEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ user_id: id.userId });
  }

  async findByIds(ids: IGuildUserPair[]): Promise<DiscordUserEntry[]> {
    const collection = await this.getCollection();
    // if guildId is not provided, match only by userId
    // if guildId is provided, match by both guildId and userId

    const userIds = ids.map(id => id.userId);
    const guildIds = ids.map(id => id.guildId).filter(Boolean);
    if (guildIds.length > 0) {
      return await collection.find({ user_id: { $in: userIds }, guild_id: { $in: guildIds } }).toArray();
    }
    return await collection.find({ user_id: { $in: userIds } }).toArray();
    
  }

}

export default DiscordUsersMongoClient;
