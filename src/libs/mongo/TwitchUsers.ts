import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import PagedResults from '../../models/PagedResults';
import TwitchUserEntry from '../../models/TwitchUserEntry';
import DiscordUsersMongoClient from './Users';

export default class TwitchUsersMongoClient extends DatabaseMongoClient<TwitchUserEntry> {
  constructor() {
    super();
    this.collectionName = 'twitch_user';
    console.log("TwitchUsersMongoClient initialized");
  }


  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<TwitchUserEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const users = new DiscordUsersMongoClient();

    const filteredUsers = await users.get(search);
    const userMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));

    let filter = {};
    
    if (!search) {
      filter = {};
    } else {
      search = search.trim();
      if (search.length === 0) {
        filter = {};
      } else {
        filter = {
          $or: [
            { twitch_name: { "$regex": search, $options: 'i' } },
            { user_id: { $in: Array.from(userMap.keys()) } },
          ]
        };
      }
    }
    const items = await collection.find(filter).skip(skip).limit(take).sort({ twitch_name: -1 }).toArray();
    const totalItems = await collection.countDocuments(filter);


    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}