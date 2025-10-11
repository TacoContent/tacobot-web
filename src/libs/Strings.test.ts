import Strings from './Strings';

describe('Strings.titleCase', () => {
  it('capitalizes a single lowercase word', () => {
    expect(Strings.titleCase('taco')).toBe('Taco');
  });

  it('capitalizes each word in a multi-word lowercase string', () => {
    expect(Strings.titleCase('taco bot web')).toBe('Taco Bot Web');
  });

  it('normalizes mixed casing across words', () => {
    expect(Strings.titleCase('tAcO bOT wEb')).toBe('Taco Bot Web');
  });

  it('leaves already title-cased words as-is', () => {
    expect(Strings.titleCase('Taco Bot Web')).toBe('Taco Bot Web');
  });

  it('handles all caps input', () => {
    expect(Strings.titleCase('TACOBOT')).toBe('Tacobot');
  });

  it('returns empty string unchanged', () => {
    expect(Strings.titleCase('')).toBe('');
  });

  it('handles multiple spaces (collapses logic is not required, should capitalize each token)', () => {
    // Current implementation will treat consecutive spaces as separate delimiters and keep them.
    expect(Strings.titleCase('taco   bot')).toBe('Taco   Bot');
  });
});
