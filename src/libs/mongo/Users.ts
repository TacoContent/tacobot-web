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

  async get(skip: number = 0, take: number = 100): Promise<DiscordUserEntry[]> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    return await collection.find({}).skip(skip).limit(take).sort({ created_at: -1 }).toArray();
  }

  async findById(id: IGuildUserPair): Promise<DiscordUserEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ user_id: id.userId });
  }

  async findByIds(ids: IGuildUserPair[]): Promise<DiscordUserEntry[]> {
    const collection = await this.getCollection();
    return await collection.find({ $or: ids.map(({ guildId, userId }) => ({ guild_id: guildId, user_id: userId })) }).toArray();
  }

}

export default DiscordUsersMongoClient;
