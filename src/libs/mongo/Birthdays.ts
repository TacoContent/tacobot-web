import DatabaseMongoClient from './Database'
import BirthdayEntry from '../../models/BirthdayEntry';
import PagedResults from '../../models/PagedResults';
import moment from 'moment-timezone';
import DiscordUsersMongoClient from './Users';

class BirthdaysMongoClient extends DatabaseMongoClient<BirthdayEntry> {
  constructor() {
    super();
    this.collectionName = 'birthdays';
    console.log("BirthdaysMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100, search?: string): Promise<PagedResults<BirthdayEntry>> {
    const collection = await this.getCollection();
    const users = new DiscordUsersMongoClient();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;

    const filteredUsers = await users.get(search);
    const filteredUserMap = new Map(filteredUsers.map(user => [user.user_id, user.displayname]));

    // need to join with users collection to get the usernames
    const filter = { user_id: { $in: Array.from(filteredUserMap.keys()) } };
    
    // get all birthdays and map usernames
    const allBirthdays = await collection.find(filter).toArray();

    // sort them compared to today - month/day
    const now = moment();
    allBirthdays.sort((a, b) => {
      let thisYearA = moment({ year: now.year(), month: a.month - 1, day: a.day });
      if (thisYearA.isBefore(now, 'day')) {
        thisYearA.add(1, 'year');
      }

      let thisYearB = moment({ year: now.year(), month: b.month - 1, day: b.day });
      if (thisYearB.isBefore(now, 'day')) {
        thisYearB.add(1, 'year');
      }

      const diffA = thisYearA.diff(now, 'days');
      const diffB = thisYearB.diff(now, 'days');
      return diffA - diffB;
    });

    const sliced = allBirthdays.slice(skip, skip + take);

    const totalItems = allBirthdays.length;

    return new PagedResults({
      items: sliced,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}

export default BirthdaysMongoClient;