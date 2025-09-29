import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import PagedResults from '../../models/PagedResults';
import TwitchChannelEntry from '../../models/TwitchChannelEntry';
import TwitchUserEntry from '../../models/TwitchUserEntry';
import DiscordUsersMongoClient from './Users';

export default class TwitchChannelsMongoClient extends DatabaseMongoClient<TwitchChannelEntry> {
  constructor() {
    super();
    this.collectionName = 'twitch_channels';
    console.log("TwitchChannelsMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<TwitchChannelEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
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
            { channel_name: { "$regex": search, $options: 'i' } },
          ]
        };
      }
    }

    const items = await collection.find(filter).skip(skip).limit(take).sort({ timestamp: -1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}