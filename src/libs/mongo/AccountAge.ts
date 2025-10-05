import DatabaseMongoClient from './Database'
import PagedResults from '../../models/PagedResults';
import moment from 'moment-timezone';
import DiscordUsersMongoClient from './Users';
import AccountAgeWhiteListEntry from '../../models/AccountAgeWhiteListEntry';

class AccountAgeMongoClient extends DatabaseMongoClient<AccountAgeWhiteListEntry> {
  constructor() {
    super();
    this.collectionName = 'join_whitelist';
    console.log("AccountAgeMongoClient initialized");
  }

  async getJoinWhitelist(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<AccountAgeWhiteListEntry>> {
    const collection = await this.getCollection('join_whitelist');
    const users = new DiscordUsersMongoClient();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const filteredUsers = await users.get(search);
    const filteredUserMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));
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
            { user_id: { $in: Array.from(filteredUserMap.keys()) } },
            { added_by: { $in: Array.from(filteredUserMap.keys()) } },
          ],
        };
      }
    }
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

export default AccountAgeMongoClient;