import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import PagedResults from '../../models/PagedResults';
import MinecraftUserEntry from '../../models/MinecraftUserEntry';
import DiscordUsersMongoClient from './Users';
import uuid from '../hbs/helpers/uuid';

export default class MinecraftUsersMongoClient extends DatabaseMongoClient<MinecraftUserEntry> {
  constructor() {
    super();
    this.collectionName = 'minecraft_users';
    console.log("MinecraftUsersMongoClient initialized");
  }

  async getOps(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<MinecraftUserEntry>> {
    const collection = await this.getCollection();
    const users = new DiscordUsersMongoClient();

    const filteredUsers = await users.get(search);
    const userMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    let filter: any = {
      "$and": [
        {
          "$or": [
            { username: { "$regex": search, $options: 'i' } },
            { uuid: { "$regex": search, $options: 'i' } },
            { user_id: { $in: Array.from(userMap.keys()) } },
          ],
        },
        {
          "$or": [
            { local: false },
            { local: { $exists: false } },
          ]
        }
      ],
      "op.enabled": true,
      op: { $ne: null },
    };

    if (!search || search.trim().length === 0) {
      filter = {
        "$and": [
          {
            "$or": [
              { local: false },
              { local: { $exists: false } },
            ],
          },
          // only include users that are in the discord users collection
          { 
            "$or": [
              { user_id: { $in: Array.from(userMap.keys()) } }
            ]
          },
          { "op.enabled": true },
          { op: { $ne: null } },
        ],
        
      };
    }
    // select when op.enabled is true
    const items = await collection.find(filter).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async getWhitelist(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<MinecraftUserEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    const users = new DiscordUsersMongoClient();

    const filteredUsers = await users.get(search);
    const userMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));
    let filter = {};
    if (!search || search.trim().length === 0) {
      filter = {};
    } else {
      filter = {
        "$or": [
          { user_id: { $in: Array.from(userMap.keys()) } },
          { username: { "$regex": search, $options: 'i' } },
          { uuid: { "$regex": search, $options: 'i' } },
        ]
      };
    }

    const items = await collection.find(filter).skip(skip).limit(take).sort({ username: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults<MinecraftUserEntry>({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}