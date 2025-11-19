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
    // Always only return pulltab tickets that have a reward > 0
    // If no search is provided, return all tickets with reward > 0
    // If search is provided, match either a Discord username (via DiscordUsers) or a direct user id
    let filter: any = { reward: { "$gt": 0 } };

    if (search) {
      search = search.trim();
      if (search.length > 0) {
        const userIds = Array.from(filteredUserMap.keys());

        // Build OR matching clause - allow lookup by user id (exact) or by the set of matched user ids
        const orClauses: any[] = [];

        if (userIds.length > 0) {
          orClauses.push({ user_id: { $in: userIds } });
        }

        // If search looks like a number (eg discord id), allow direct matches
        // Always include a direct user_id match because the user may search by id.
        orClauses.push({ user_id: search });

        // Final filter will always include reward > 0 plus an $or of username/user_id options
        filter = {
          $and: [
            { reward: { "$gt": 0 } },
            { $or: orClauses },
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
