import { isLineWinner } from './PullTabsHelper';

describe('PullTabsHelper', () => {

  it('isLineWinner finds winning lines and calculates rewards (exact match)', async () => {
    const cogSettings = {
      probabilities: [
        {
          symbol: '🌮',
          weight: 1,
          rules: [
            { match: '🌮', reward: 100 },
            { match: '🌮🌮', reward: 1000 },
            { match: '🌮🌮🌮', reward: 10000 },
          ],
        },
      ],
    };
    const guildId = '1234567890';
    const ticket = '🌮🌮🌮';
    const { isWinner, totalReward, winningLines } = await isLineWinner(guildId, ticket, 1);

    expect(isWinner).toBe(true);
    expect(totalReward).toBe(10000);
    expect(winningLines.length).toBe(1);
    expect(winningLines[0]['🌮🌮🌮']).toBe(10000);
  });

  it('processPulltabTicket finds count-match wins and respects deny rules with multiplier 0', async () => {
    const cogSettings = {
      probabilities: [
        {
          symbol: '🌮',
          weight: 1,
          rules: [
            { match: '🌮🌮', reward: 1000 },
            { match: '💀', reward: 0, multiplier: 0 }, // deny rule example
          ],
        },
      ],
    };
    const guildId = '1234567890';

    let ticket = '🌮🌮🍎';
    let res = await isLineWinner(guildId, ticket, 1);
    expect(res.isWinner).toBe(true);
    expect(res.totalReward).toBe(1000);

    // Now include the deny symbol to cause row to be losing
    ticket = '🌮💀🌮';
    res = await isLineWinner(guildId, ticket, 1);
    expect(res.isWinner).toBe(false);
    expect(res.totalReward).toBe(0);
  });
});