import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';
import GameKeyEntry from '../../models/GameKeyEntry';
import PagedResults from '../../models/PagedResults';

class GameKeysMongoClient extends DatabaseMongoClient<GameKeyEntry> {
  constructor() {
    super();
    this.collectionName = 'game_keys';
    console.log("GameKeysMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<GameKeyEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    let userFilter: any = {};

    if (!search) {
      userFilter = {};
    } else {
      search = search.trim();
      if (search.length === 0) {
        userFilter = {};
      } else {
        userFilter = {
          $or: [
            { username: { "$regex": search, $options: 'i' } },
            { discriminator: { "$regex": search, $options: 'i' } },
            { displayname: { "$regex": search, $options: 'i' } },
          ]
        };
      }
    }

    // need to join with users collection to get the usernames
    const userCollection = await this.getCollection('users');
    const filteredUsers = await userCollection.find(userFilter).toArray();
    const ownerUserMap = new Map(filteredUsers.map(user => [user.user_owner, user.owner_username]));
    // include the redeemed_by in the filter as well.

    const redeemedUserMap = new Map(filteredUsers.map(user => [user.redeemed_by, user.redeemed_username]));

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
            { user_owner: { $in: Array.from(ownerUserMap.keys()) } },
            //{ redeemed_by: { $in: Array.from(redeemedUserMap.keys()) } },
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
