// @ts-nocheck
import DatabaseMongoClient from './Database'
import config from '../../config';
import clc from 'cli-color';
import ShiftCodeEntry from '../../models/ShiftCodeEntry';
import { Collection, InsertManyResult, InsertOneResult } from 'mongodb';
import moment from 'moment-timezone';

class ShiftCodesMongoClient extends DatabaseMongoClient<ShiftCodeEntry> {
  constructor() {
    super();
    this.collectionName = 'shift_codes';
    console.log("ShiftCodesMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100): Promise<ShiftCodeEntry[]> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    return await collection.find({}).skip(skip).limit(take).toArray();
  }

  async findByCode(code: string): Promise<ShiftCodeEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ code: code });
  }

}

export default ShiftCodesMongoClient;
