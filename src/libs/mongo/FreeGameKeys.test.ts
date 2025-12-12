// Avoid importing mongodb's ESM implementation inside Jest runtime by mocking it
jest.mock('mongodb', () => ({
  MongoClient: { connect: jest.fn() },
}));

// Provide a lightweight mock for config so code that reads config does not attempt to load files
jest.mock('../../../config', () => ({
  mongo: {
    database: 'testdb',
    url: 'mongodb://localhost:27017',
  },
}));

import FreeGameKeysMongoClient from './FreeGameKeys';

describe('FreeGameKeysMongoClient.get', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('calls collection.find with additionalFilters when no search provided', async () => {
    const mockCollection: any = {
      find: jest.fn().mockReturnValue({ skip: () => ({ limit: () => ({ sort: () => ({ toArray: async () => [] }) }) }) }),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    jest.spyOn(FreeGameKeysMongoClient.prototype as any, 'getCollection').mockResolvedValue(mockCollection);

    const client = new FreeGameKeysMongoClient();
    const additionalFilters = { platform: 'pc' };

    await client.get(0, 10, undefined, additionalFilters);

    expect(mockCollection.find).toHaveBeenCalledWith(additionalFilters);
    expect(mockCollection.countDocuments).toHaveBeenCalledWith(additionalFilters);
  });

  test('builds $and with additionalFilters and $or when search provided', async () => {
    const mockCollection: any = {
      find: jest.fn().mockReturnValue({ skip: () => ({ limit: () => ({ sort: () => ({ toArray: async () => [] }) }) }) }),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    jest.spyOn(FreeGameKeysMongoClient.prototype as any, 'getCollection').mockResolvedValue(mockCollection);

    const client = new FreeGameKeysMongoClient();
    const additionalFilters = { type: 'key' };
    const search = 'super';

    await client.get(0, 10, search, additionalFilters);

    // Expect the filter to be an $and with the additionalFilters and an $or clause
    const expectedOr = [
      { title: { $regex: search, $options: 'i' } },
      { platform: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
    ];

    const expectedAnd = [{ type: 'key' }, { $or: expectedOr }];

    expect(mockCollection.find).toHaveBeenCalledWith({ $and: expectedAnd });
    expect(mockCollection.countDocuments).toHaveBeenCalledWith({ $and: expectedAnd });
  });
});
