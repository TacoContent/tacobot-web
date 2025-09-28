import DatabaseMongoClient from './Database'
import config from '../../config';
import UserTacoEntry from '../../models/UserTacoEntry';
import PagedResults from '../../models/PagedResults';
import DiscordUsersMongoClient from './Users';

export default class TacosMongoClient extends DatabaseMongoClient<UserTacoEntry> {
  constructor() {
    super();
    this.collectionName = 'tacos';
    console.log("TacosMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<UserTacoEntry>> {
    const collection = await this.getCollection();
    const users = new DiscordUsersMongoClient();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const filteredUsers = await users.get(search);
    const userMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));


    // user the user_id filter to get only relevant tacos
    const filter = { user_id: { $in: Array.from(userMap.keys()) } };

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