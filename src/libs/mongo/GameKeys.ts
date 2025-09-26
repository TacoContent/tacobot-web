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

  async get(skip: number = 0, take: number = 100): Promise<PagedResults<GameKeyEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const items = await collection.find({
      
    }).skip(skip).limit(take).sort({ redeemed_timestamp: 1, title: 1 }).toArray();

    const totalItems = await collection.countDocuments({
      
    });

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}

export default GameKeysMongoClient;
