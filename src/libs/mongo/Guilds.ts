import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import DiscordGuildEntry from '../../models/DiscordGuildEntry';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';

class DiscordGuildsMongoClient extends DatabaseMongoClient<DiscordGuildEntry> {
  constructor() {
    super();
    this.collectionName = 'guilds';
    console.log("DiscordGuildsMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100): Promise<DiscordGuildEntry[]> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    return await collection.find({}).skip(skip).limit(take).sort({ created_at: -1 }).toArray();
  }

  async findById(id: string): Promise<DiscordGuildEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ guild_id: id });
  }

  async findByIds(ids: string[]): Promise<DiscordGuildEntry[]> {
    const collection = await this.getCollection();
    return await collection.find({ guild_id: { $in: ids } }).toArray();
  }

}

export default DiscordGuildsMongoClient;
