import PagedResults from '../models/PagedResults';

// Mock Logs to avoid ESM mongo import
jest.mock('../libs/mongo/Logs', () => {
  return jest.fn().mockImplementation(() => ({ error: jest.fn() }));
});

const mockGet = jest.fn();
jest.mock('../libs/mongo/FreeGameKeys', () => {
  return jest.fn().mockImplementation(() => ({ get: mockGet }));
});

import FreeGameKeysController from './FreeGameKeysController';
import moment from 'moment';

describe('FreeGameKeysController list', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockResolvedValue(new PagedResults({ items: [], totalItems: 0, currentPage: 1, pageSize: 10 }));
  });

  test('default includeExpired should be true and no end_date filter applied', async () => {
    const controller = new FreeGameKeysController();
    const req: any = { query: {} };
    const res: any = { locals: {}, render: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.list(req, res, jest.fn());

    expect(res.locals.includeExpired).toBe(true);
    expect(mockGet).toHaveBeenCalled();
    const additionalFilters = mockGet.mock.calls[0][3];
    expect(additionalFilters).not.toHaveProperty('end_date');
    expect(additionalFilters).not.toHaveProperty('$or');
  });

  test('explicit includeExpired=false should add $or: [ {end_date: {$gt: now}}, {end_date: null} ]', async () => {
    const controller = new FreeGameKeysController();
    const now = moment.utc().unix();
    const req: any = { query: { includeExpired: 'false' } };
    const res: any = { locals: {}, render: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.list(req, res, jest.fn());

    expect(res.locals.includeExpired).toBe(false);
    expect(mockGet).toHaveBeenCalled();
    const additionalFilters = mockGet.mock.calls[0][3];

    expect(additionalFilters).toHaveProperty('$or');
    const orClause = additionalFilters.$or;
    expect(Array.isArray(orClause)).toBe(true);
    expect(orClause.length).toBe(2);

    // one clause should be null-match and the other should be end_date $gt a number
    const hasNull = orClause.some((c: any) => c.end_date === null);
    const hasGt = orClause.some((c: any) => c.end_date && typeof c.end_date.$gt === 'number');

    expect(hasNull).toBe(true);
    expect(hasGt).toBe(true);
  });
});
