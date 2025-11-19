import DatabaseMongoClient from './Database'
import config from '../../config';
import PullTabTicketEntry from '../../models/PullTabTicketEntry';
import PagedResults from '../../models/PagedResults';
import DiscordUsersMongoClient from './Users';
import SettingsMongoClient from './Settings';

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

// Helper: convert pulltab ticket logic to TypeScript for verifying winning lines
export async function processPulltabTicket(guildId: string, ticket: string[] | any[], effectiveMultiplier: number = 1) {
  const settings = new SettingsMongoClient();
  const cogSettingsDocument = await settings.getByName(guildId, "pulltab");
  const cogSettings = cogSettingsDocument?.settings;
  const probabilities: Array<any> = (cogSettings && cogSettings.probabilities) || [];

  let totalReward = 0;
  let isWinner = false;
  const winningLines: Array<Record<string, number>> = [];

  const configuredSymbols = probabilities.map((p) => p.symbol);

  for (const rowRaw of ticket) {
    let rowSymbols: string[];
    if (typeof rowRaw === 'string') {
      // Use Array.from to properly split unicode code points
      rowSymbols = Array.from(rowRaw);
    } else if (Array.isArray(rowRaw)) {
      rowSymbols = Array.from(rowRaw.join(''));
    } else {
      rowSymbols = Array.from(String(rowRaw));
    }

    // For this row, collect the best matched rule for each symbol
    const rowMatches: Array<[string, number, string, number]> = []; // [symbol, reward, match_str, multiplier]

    for (const p of probabilities) {
      const rules = p.rules || [];
      const matchedRules: Array<{ lineReward: number; match: string; multiplier: number }> = [];

      for (const rule of rules) {
        const match = rule.match as string;
        const reward = Number(rule.reward || 0);
        const multiplier = rule.multiplier === undefined ? 1 : Number(rule.multiplier);

        const matchCounts: Record<string, number> = {};
        for (const sym of configuredSymbols) {
          const re = new RegExp(sym, 'g');
          const m = match.match(re);
          matchCounts[sym] = m ? m.length : 0;
        }

        const rowCounts: Record<string, number> = {};
        for (const s of rowSymbols) {
          rowCounts[s] = (rowCounts[s] || 0) + 1;
        }

        // exact_match (order and count)
        const exactMatch = match === rowSymbols.join('');

        // count_match: all symbols in match appear in the row at least the same number of times
        let countMatch = false;
        const matchCountTotal = Object.values(matchCounts).reduce((a, b) => a + b, 0);
        if (matchCountTotal < rowSymbols.length) {
          // ensure match has at least one configured symbol
          if (Object.values(matchCounts).some((v) => v > 0)) {
            countMatch = Object.entries(matchCounts)
              .filter(([_, v]) => v > 0)
              .every(([sym, need]) => (rowCounts[sym] || 0) >= need);
          }
        }

        const matched = exactMatch || countMatch;

        if (matched) {
          const lineReward = reward * multiplier;
          matchedRules.push({ lineReward, match, multiplier });
        }
      }

      if (matchedRules.length > 0) {
        // choose the highest reward for this symbol's rule set
        const best = matchedRules.reduce((a, b) => (a.lineReward >= b.lineReward ? a : b));
        rowMatches.push([p.symbol, best.lineReward, best.match, best.multiplier]);
      }
    }

    // If any matched rule has multiplier == 0 then whole row is a losing line
    if (rowMatches.some(([_sym, _r, _m, mult]) => mult === 0)) {
      continue;
    }

    // Award all matched rules for the row
    for (const [_sym, lineReward, matchStr, _mult] of rowMatches) {
      const actualLineReward = Math.round(lineReward * effectiveMultiplier);
      totalReward += actualLineReward;
      if (actualLineReward > 0) isWinner = true;
      winningLines.push({ [matchStr]: actualLineReward });
    }
  }

  return { isWinner, totalReward, winningLines };
}