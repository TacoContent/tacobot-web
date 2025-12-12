import PagedResults from '../models/PagedResults';

// Mock out model and mongo clients before importing controller so Jest doesn't try to load mongodb ESM modules
jest.mock('../models/ProcessedPullTabTicket', () => {
  return jest.fn().mockImplementation((item: any) => {
    return {
      processLineResults: jest.fn().mockResolvedValue(undefined),
    };
  });
});

// Mock PullTabsMongoClient so we can capture calls to get()
const mockGet = jest.fn();
// Mock Logs Mongo client to avoid importing real mongodb during unit tests
jest.mock('../libs/mongo/Logs', () => {
  return jest.fn().mockImplementation(() => ({
    error: jest.fn(),
  }));
});

jest.mock('../libs/mongo/PullTabs', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockGet,
  }));
});

import PullTabsController from './PullTabsController';

describe('PullTabsController list', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockResolvedValue(new PagedResults({ items: [], totalItems: 0, currentPage: 1, pageSize: 12 }));
  });

  it('should default includeRedeemedTickets to true when not present and, with pending=true, include all (no redeemed_at filter)', async () => {
    const controller = new PullTabsController();
    const req: any = {
      query: {
        includePendingTickets: 'true',
      },
    };
    const res: any = {
      locals: {},
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.list(req, res, jest.fn());

    expect(res.locals.includeRedeemedTickets).toBe(true);
    // additionalFilters should NOT include redeemed_at when redeemed default = true and pending = true
    expect(mockGet).toHaveBeenCalled();
    const lastCallArgs = mockGet.mock.calls[0];
    const additionalFilters = lastCallArgs[3];
    expect(additionalFilters).not.toHaveProperty('redeemed_at');
  });

  it('should treat explicit includeRedeemedTickets=false and includePendingTickets=true as pending-only (redeemed_at = null)', async () => {
    const controller = new PullTabsController();
    const req: any = { query: { includeRedeemedTickets: 'false', includePendingTickets: 'true' } };
    const res: any = { locals: {}, render: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.list(req, res, jest.fn());

    expect(res.locals.includeRedeemedTickets).toBe(false);
    expect(res.locals.includePendingTickets).toBe(true);
    expect(mockGet).toHaveBeenCalled();
    const additionalFilters = mockGet.mock.calls[0][3];
    expect(additionalFilters).toEqual({ reward: { $gt: 0 }, redeemed_at: null });
  });

  it('should set redeemed filter to $ne null when includeRedeemedTickets=true and pending=false', async () => {
    const controller = new PullTabsController();
    const req: any = {
      query: {
        includeRedeemedTickets: 'true',
      },
    };
    const res: any = { locals: {}, render: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.list(req, res, jest.fn());

    expect(res.locals.includeRedeemedTickets).toBe(true);
    expect(mockGet).toHaveBeenCalled();
    const additionalFilters = mockGet.mock.calls[0][3];
    expect(additionalFilters).toEqual({ reward: { $gt: 0 }, redeemed_at: { $ne: null } });
  });

  it('should, when includeLosingTickets=true, pending=false, redeemed=true, filter out pending and allow reward >=0', async () => {
    const controller = new PullTabsController();
    const req: any = { query: { includeLosingTickets: 'true', includeRedeemedTickets: 'true', includePendingTickets: 'false' } };
    const res: any = { locals: {}, render: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.list(req, res, jest.fn());

    expect(res.locals.includeLosingTickets).toBe(true);
    expect(res.locals.includeRedeemedTickets).toBe(true);
    expect(res.locals.includePendingTickets).toBe(false);
    expect(mockGet).toHaveBeenCalled();
    const additionalFilters = mockGet.mock.calls[0][3];
    expect(additionalFilters).toEqual({ reward: { $gte: 0 }, redeemed_at: { $ne: null } });
  });

  it('should not filter redeemed_at when includeRedeemedTickets=true and pending=true (include all)', async () => {
    const controller = new PullTabsController();
    const req: any = { query: { includeRedeemedTickets: 'true', includePendingTickets: 'true' } };
    const res: any = { locals: {}, render: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.list(req, res, jest.fn());

    expect(res.locals.includeRedeemedTickets).toBe(true);
    expect(res.locals.includePendingTickets).toBe(true);
    expect(mockGet).toHaveBeenCalled();
    const additionalFilters = mockGet.mock.calls[0][3];
    // No redeemed_at filter expected when both redeemed and pending are included
    expect(additionalFilters).not.toHaveProperty('redeemed_at');
  });
});
