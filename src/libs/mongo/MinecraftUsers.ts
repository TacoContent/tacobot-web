import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import PagedResults from '../../models/PagedResults';
import MinecraftUserEntry from '../../models/MinecraftUserEntry';

export default class MinecraftUsersMongoClient extends DatabaseMongoClient<MinecraftUserEntry> {
  constructor() {
    super();
    this.collectionName = 'minecraft_users';
    console.log("MinecraftUsersMongoClient initialized");
  }

  async getOps(skip: number = 0, take: number = 100): Promise<PagedResults<MinecraftUserEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    // select when op.enabled is true
    const items = await collection.find({
      "$or": [{ local: false }, { local: { $exists: false } }],
      "op.enabled": true,
      op: { $ne: null },
    }).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments({
      "$or": [{ local: false}, {local: { $exists: false } }],
      "op.enabled": true,
      op: { $ne: null },
    });

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async getWhitelist(skip: number = 0, take: number = 100): Promise<PagedResults<MinecraftUserEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    const page = Math.floor(skip / take) + 1;

    // select when op.enabled is false or op is null

    const items = await collection.find({}).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments({});

    return new PagedResults<MinecraftUserEntry>({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}