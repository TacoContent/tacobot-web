// @ts-nocheck
import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import ShiftCodeEntry from '../../models/ShiftCodeEntry';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';
import PagedResults from '../../models/PagedResults';

export default class MinecraftUsersMongoClient extends DatabaseMongoClient<MinecraftUserEntry> {
  constructor() {
    super();
    this.collectionName = 'minecraft_users';
    console.log("MinecraftUsersMongoClient initialized");
  }

  async getOps(skip: number = 0, take: number = 100): Promise<PagedResults<MinecraftUserEntry[]>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    const page = Math.floor(skip / take) + 1;

    // select when op.enabled is true

    const items = await collection.find({ "op.enabled": true, op: { $ne: null }, guild_id: config.tacobot.primaryGuildId }).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments({ "op.enabled": true, op: { $ne: null }, guild_id: config.tacobot.primaryGuildId });
    const lastPage = Math.ceil(totalItems / take);

    const beforePages = [];
    for (let i = page - 2; i < page; i++) {
      if (i >= 1 && i <= page) beforePages.push(i);
    }
    const afterPages = [];
    for (let i = page + 1; i <= page + 2; i++) {
      if (i <= lastPage && i >= page) afterPages.push(i);
    }

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
      hasPrev: skip > 0,
      hasNext: skip + take < totalItems,
      prevPage: skip > 0 ? Math.floor(skip / take) : null,
      nextPage: skip + take < totalItems ? Math.floor(skip / take) + 2 : null,
      beforePages: beforePages,
      afterPages: afterPages,
      lastPage: Math.ceil(totalItems / take),
    });
  }

  async getNonOps(skip: number = 0, take: number = 100): Promise<PagedResults<MinecraftUserEntry[]>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    const page = Math.floor(skip / take) + 1;

    // select when op.enabled is false or op is null

    const items = await collection.find({
      $or: [{ "op.enabled": false }, { op: null }, { op: { $exists: false } }],
      guild_id: config.tacobot.primaryGuildId,
    }).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments({
      $or: [{ "op.enabled": false }, { op: null }, { op: { $exists: false } }],
      guild_id: config.tacobot.primaryGuildId,
    });
    const lastPage = Math.ceil(totalItems / take);

    const beforePages = [];
    for (let i = page - 2; i < page; i++) {
      if (i >= 1 && i <= page) beforePages.push(i);
    }
    const afterPages = [];
    for (let i = page + 1; i <= page + 2; i++) {
      if (i <= lastPage && i >= page) afterPages.push(i);
    }

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
      hasPrev: skip > 0,
      hasNext: skip + take < totalItems,
      prevPage: skip > 0 ? Math.floor(skip / take) : null,
      nextPage: skip + take < totalItems ? Math.floor(skip / take) + 2 : null,
      beforePages: beforePages,
      afterPages: afterPages,
      lastPage: Math.ceil(totalItems / take),
    });
  }
}