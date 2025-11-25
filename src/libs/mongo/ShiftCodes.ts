import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import ShiftCodeEntry from '../../models/ShiftCodeEntry';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import PagedResults from '../../models/PagedResults';

class ShiftCodesMongoClient extends DatabaseMongoClient<ShiftCodeEntry> {
  tacoBotApiClient: any;
  constructor() {
    super();
    this.collectionName = 'shift_codes';
    console.log("ShiftCodesMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string, additionalFilters?: any): Promise<PagedResults<ShiftCodeEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    // Start with additionalFilters if provided
    let filter: any = {};
    if (additionalFilters && Object.keys(additionalFilters).length > 0) {
      // shallow copy so we don't mutate the caller's object
      filter = { ...additionalFilters };
    }

    if (search) {
      search = search.trim();
      if (search.length > 0) {
        const orClauses: any[] = [
          { reward: { "$regex": search, $options: 'i' } },
          { notes: { "$regex": search, $options: 'i' } },
          { code: { "$regex": search, $options: 'i' } },
          // search by game.id or game.name
          { 'games.id': { "$regex": search, $options: 'i' } },
          { 'games.name': { "$regex": search, $options: 'i' } },
          { source: { "$regex": search, $options: 'i' } },
          { source_id: { "$regex": search, $options: 'i' } },
        ];

        const andClauses: any[] = [];

        // If caller provided additionalFilters, include them as an AND clause
        if (additionalFilters && Object.keys(additionalFilters).length > 0) {
          andClauses.push(additionalFilters);
        }

        andClauses.push({ $or: orClauses });

        filter = { $and: andClauses };
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
