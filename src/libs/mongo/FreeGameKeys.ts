import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';
import FreeGameKeyEntry from '../../models/FreeGameKeyEntry';
import PagedResults from '../../models/PagedResults';

class FreeGameKeysMongoClient extends DatabaseMongoClient<FreeGameKeyEntry> {
  constructor() {
    super();
    this.collectionName = 'free_game_keys';
    console.log("FreeGameKeysMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string, additionalFilters: any = {}): Promise<PagedResults<FreeGameKeyEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    // Start with additionalFilters if provided
    let filter: any = {};
    if (additionalFilters && Object.keys(additionalFilters).length > 0) {
      // shallow copy so we don't mutate the caller's object
      filter = { ...additionalFilters };
    }

    // If there is a search term, build an $or clause and combine with any additionalFilters
    if (search) {
      search = search.trim();
      if (search.length > 0) {
        const orClauses: any[] = [
          { title: { $regex: search, $options: 'i' } },
          { platform: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } },
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
    
    const items = await collection.find(filter).skip(skip).limit(take).sort({ published_date: -1, end_date: 1 }).toArray();

    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}

export default FreeGameKeysMongoClient;
