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

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<UserTacoEntry>> {
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
            { username: { "$regex": search, $options: 'i' } },
            { discriminator: { "$regex": search, $options: 'i' } },
            { displayname: { "$regex": search, $options: 'i' } },
          ]
        };
      }
    }

    // need to join with users collection to get the usernames
    const userCollection = await this.getCollection('users');
    const users = await userCollection.find(filter).toArray();
    const userMap = new Map(users.map(user => [user.user_id, user.username]));

    // get all tacos and map usernames

    // user the user_id filter to get only relevant tacos
    filter = { user_id: { $in: Array.from(userMap.keys()) } };

    const items = await collection.find(filter).skip(skip).limit(take).sort({ count: -1 }).toArray();
    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}