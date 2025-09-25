import DatabaseMongoClient from './Database'
import BirthdayEntry from '../../models/BirthdayEntry';
import PagedResults from '../../models/PagedResults';
import moment from 'moment-timezone';

class BirthdaysMongoClient extends DatabaseMongoClient<BirthdayEntry> {
  constructor() {
    super();
    this.collectionName = 'birthdays';
    console.log("BirthdaysMongoClient initialized");
  }

  async get(skip: number = 0, take: number = 100): Promise<PagedResults<BirthdayEntry>> {
    const collection = await this.getCollection();

    if (skip < 0) skip = 0;
    if (take <= 0 || take > 100) take = 100;
    // if we dont get them all now, we cant sort them properly
    const items = await collection.find({}).toArray();
    // sort them compared to today - month/day
    const now = moment();
    items.sort((a, b) => {
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
      // if (diffA < diffB) {
      //   return -1;
      // } else if (diffA > diffB) {
      //   return 1;
      // } else {
      //   return 0;
      // }
    });

    const sliced = items.slice(skip, skip + take);

    const totalItems = await collection.countDocuments({});

    return new PagedResults({
      items: sliced,
      totalItems,
      currentPage: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  }
}

export default BirthdaysMongoClient;