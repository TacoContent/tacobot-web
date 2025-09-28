import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';
import GameKeyEntry from '../../models/GameKeyEntry';
import PagedResults from '../../models/PagedResults';
import DiscordUsersMongoClient from './Users';

class GameKeysMongoClient extends DatabaseMongoClient<GameKeyEntry> {
  constructor() {
    super();
    this.collectionName = 'game_keys';
    console.log("GameKeysMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<GameKeyEntry>> {
    const collection = await this.getCollection();
    const users = new DiscordUsersMongoClient();
    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    // need to join with users collection to get the usernames
    const filteredUsers = await users.get(search);
    const filteredUserMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));


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
            { title: { "$regex": search, $options: 'i' } },
            { key: { "$regex": search, $options: 'i' } },
            { type: { "$regex": search, $options: 'i' } },
            { user_owner: { $in: Array.from(filteredUserMap.keys()) } },
            { redeemed_by: { $in: Array.from(filteredUserMap.keys()) } },
          ],
        };
      }
    }


    const items = await collection.find(filter).skip(skip).limit(take).sort({ redeemed_timestamp: 1, title: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}

export default GameKeysMongoClient;
