// @ts-nocheck
import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';

class FreeGameKeysMongoClient extends DatabaseMongoClient<FreeGameKeyEntry> {
  constructor() {
    super();
    this.collectionName = 'free_game_keys';
    console.log("FreeGameKeysMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100): Promise<FreeGameKeyEntry[]> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    return await collection.find({}).skip(skip).limit(take).sort({ published_date: 1, end_date: 1 }).toArray();
  }
}

export default FreeGameKeysMongoClient;
