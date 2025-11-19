import DatabaseMongoClient from './Database'
import config from '../../config';
import PullTabTicketEntry from '../../models/PullTabTicketEntry';
import PagedResults from '../../models/PagedResults';
import DiscordUsersMongoClient from './Users';

export default class PullTabsMongoClient extends DatabaseMongoClient<PullTabTicketEntry> {
  constructor() {
    super();
    this.collectionName = 'pulltab_tickets';
    console.log("PullTabsMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<PullTabTicketEntry>> {
    const collection = await this.getCollection();
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
        filter = { reward: { "$gt": 0 } };
      } else {
        filter = {
          $and: [
            { reward: { "$gt": 0 } },
            {
              $or: [
                // match if any of the items in the permissions array match the search term
                // the `permissions` field is an array of strings. We want to match if any of the strings in the array match the search term
                // { permissions: { "$regex": search, $options: 'i' } },
                { user_id: { $in: Array.from(filteredUserMap.keys()) } },
              ],
            },
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
}