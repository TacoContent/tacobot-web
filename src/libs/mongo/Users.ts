import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import DiscordUserEntry from '../../models/DiscordUserEntry';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';

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

  async findById(guild_id: string, id: string): Promise<DiscordUserEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ user_id: id, guild_id: guild_id });
  }

  async findByIds(guild_id: string, ids: string[]): Promise<DiscordUserEntry[]> {
    const collection = await this.getCollection();
    return await collection.find({ user_id: { $in: ids }, guild_id: guild_id }).toArray();
  } 

}

export default DiscordUsersMongoClient;
