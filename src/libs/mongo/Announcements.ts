import DatabaseMongoClient from './Database'
import AnnouncementEntry from '../../models/AnnouncementEntry';
import PagedResults from '../../models/PagedResults';
import DiscordUsersMongoClient from './Users';

class AnnouncementsMongoClient extends DatabaseMongoClient<AnnouncementEntry> {
  constructor() {
    super();
    this.collectionName = 'announcements';
    console.log("AnnouncementsMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<AnnouncementEntry>> {
    const collection = await this.getCollectionOf<AnnouncementEntry>();
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
            // match if any of the items in the permissions array match the search term
            // the `permissions` field is an array of strings. We want to match if any of the strings in the array match the search term
            { permissions: { "$regex": search, $options: 'i' } },
            { author_id: { $in: Array.from(filteredUserMap.keys()) } },
          ],
        };
      }
    }
    const items = await collection.find(filter).skip(skip).limit(take).sort({ guild_id: -1, channel_id: -1, updated_at: -1, created_at: -1 }).toArray();
    const totalItems = await collection.countDocuments(filter);

    return new PagedResults({
      items,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}

export default AnnouncementsMongoClient;