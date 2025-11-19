import PullTabsMongoClient from './PullTabs';
import DiscordUsersMongoClient from './Users';

describe('PullTabsMongoClient.get', () => {
  const sampleTickets = [
    { user_id: '1', reward: 0, created_at: 1 },
    { user_id: '2', reward: 5, created_at: 2 },
    { user_id: '3', reward: 10, created_at: 3 },
  ];

  function makeFakeCollection(items: any[]) {
    function evaluate(filter: any, item: any): boolean {
      if (!filter || Object.keys(filter).length === 0) return true;

      if (filter.reward && filter.reward.$gt !== undefined) {
        return item.reward > filter.reward.$gt;
      }

      if (filter.$and) {
        return filter.$and.every((sub: any) => evaluate(sub, item));
      }
      if (filter.$or) {
        return filter.$or.some((sub: any) => evaluate(sub, item));
      }

      if (filter.user_id) {
        // exact user id
        if (typeof filter.user_id === 'string') {
          return item.user_id === filter.user_id;
        }
        if (filter.user_id.$in) {
          return filter.user_id.$in.includes(item.user_id);
        }
      }

      return true;
    }

    return {
      find: (filter: any) => ({
        skip: (skip: number) => ({
          limit: (limit: number) => ({
            sort: (_sort: any) => ({
              toArray: async () => items.filter(i => evaluate(filter, i)).slice(skip, skip + limit),
            }),
          }),
        }),
      }),
      countDocuments: async (filter: any) => items.filter(i => evaluate(filter, i)).length,
    };
  }

  let client: PullTabsMongoClient;
  beforeEach(() => {
    client = new PullTabsMongoClient();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns only tickets where reward > 0 when no search provided', async () => {
    jest.spyOn(PullTabsMongoClient.prototype, 'getCollection').mockResolvedValue(makeFakeCollection(sampleTickets as any) as any);
    jest.spyOn(DiscordUsersMongoClient.prototype, 'get').mockResolvedValue([] as any);

    const results = await client.get();

    expect(results.items.length).toBe(2);
    expect(results.items.some((r: any) => r.user_id === '2')).toBe(true);
    expect(results.items.some((r: any) => r.user_id === '3')).toBe(true);
    expect(results.items.some((r: any) => r.user_id === '1')).toBe(false);
  });

  it('filters by username via DiscordUsers and only includes reward > 0', async () => {
    jest.spyOn(PullTabsMongoClient.prototype, 'getCollection').mockResolvedValue(makeFakeCollection(sampleTickets as any) as any);
    // simulate DiscordUsers returning user 3 when searching for "Lucky".
    jest.spyOn(DiscordUsersMongoClient.prototype, 'get').mockResolvedValue([{ user_id: '3', displayname: 'Lucky' }] as any);

    const results = await client.get(0, 100, 'Lucky');

    expect(results.items.length).toBe(1);
    expect(results.items[0].user_id).toBe('3');
  });

  it('filters by direct user id search and only includes reward > 0', async () => {
    jest.spyOn(PullTabsMongoClient.prototype, 'getCollection').mockResolvedValue(makeFakeCollection(sampleTickets as any) as any);
    jest.spyOn(DiscordUsersMongoClient.prototype, 'get').mockResolvedValue([] as any);

    const results = await client.get(0, 100, '2');

    expect(results.items.length).toBe(1);
    expect(results.items[0].user_id).toBe('2');
  });

});
