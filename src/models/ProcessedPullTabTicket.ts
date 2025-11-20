import e from 'express';
import SettingsMongoClient from '../libs/mongo/Settings';
import PullTabTicketEntry from './PullTabTicketEntry';


export default class ProcessedPullTabTicket extends PullTabTicketEntry {
  settings: SettingsMongoClient | null = null;
  lineResults: Array<{
    isWinner: boolean;
    lineReward: number;
    effectiveReward: number;
    line: string;
  }> = [];

  constructor(pulltabTicket: PullTabTicketEntry) {
    super(pulltabTicket);
    // Initialization if needed
    this.settings = new SettingsMongoClient();

  }

  async processLineResults() {
    for (const line of this.ticket) {
      const result = await this.isLineWinner(this.guild_id, line, this.effective_multiplier);
      this.lineResults.push(result);
    }
  }

  async isLineWinner(guildId: string, line: string | string[], effectiveMultiplier: number = 1) {
    if (!this.settings) {
      this.settings = new SettingsMongoClient();
    }
    const pline = typeof line === 'string' ? line : line.join('');
    const cogSettingsDocument = await this.settings.getByName(guildId, "pulltab");
    const cogSettings = cogSettingsDocument?.settings;
    const probabilities: Array<any> = (cogSettings && cogSettings.probabilities) || [];

    let lineReward = 0;
    let isWinner = false;
    let effectiveReward = 0;
    // const winningLines: Array<Record<string, number>> = [];

    const configuredSymbols = probabilities.map((p) => p.symbol);

    let rowSymbols: string[];
    if (typeof line === 'string') {
      // Use Array.from to properly split unicode code points
      rowSymbols = Array.from(line);
    } else if (Array.isArray(line)) {
      rowSymbols = Array.from(line.join(''));
    } else {
      rowSymbols = Array.from(String(line));
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
      return { isWinner: false, lineReward: 0, effectiveReward: 0, line: pline };
    }

    // Award all matched rules for the row
    for (const [_sym, matchLineReward, matchStr, _mult] of rowMatches) {
      const actualLineReward = Math.round(matchLineReward * effectiveMultiplier);
      lineReward += matchLineReward;
      effectiveReward += actualLineReward;
      if (actualLineReward > 0) isWinner = true;
    }

    return { isWinner, lineReward, effectiveReward, line: pline };
  }
}