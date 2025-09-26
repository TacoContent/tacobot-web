import DatabaseMongoClient from './Database'
import config from '../../config';
import UserTacoEntry from '../../models/UserTacoEntry';
import PagedResults from '../../models/PagedResults';

export default class TacosMongoClient extends DatabaseMongoClient<UserTacoEntry> {
  constructor() {
    super();
    this.collectionName = 'tacos';
    console.log("TacosMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100): Promise<PagedResults<UserTacoEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const items = await collection.find({}).skip(skip).limit(take).sort({ count: -1 }).toArray();
    const totalItems = await collection.countDocuments();

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}