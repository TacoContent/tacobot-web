import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import ShiftCodeEntry from '../../models/ShiftCodeEntry';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import PagedResults from '../../models/PagedResults';

class ShiftCodesMongoClient extends DatabaseMongoClient<ShiftCodeEntry> {
  constructor() {
    super();
    this.collectionName = 'shift_codes';
    console.log("ShiftCodesMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<ShiftCodeEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

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
            { reward: { "$regex": search, $options: 'i' } },
            { notes: { "$regex": search, $options: 'i' } },
            { code: { "$regex": search, $options: 'i' } },
            // search by game.id or game.name
            { 'games.id': { "$regex": search, $options: 'i' } },
            { 'games.name': { "$regex": search, $options: 'i' } },
            { source: { "$regex": search, $options: 'i' } },
            { source_id: { "$regex": search, $options: 'i' } },
          ],
        };
      }
    }

    const items = await collection.find(filter).skip(skip).limit(take).sort({ created_at: -1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }

  async findByCode(code: string): Promise<ShiftCodeEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ code: code });
  }

}

export default ShiftCodesMongoClient;
