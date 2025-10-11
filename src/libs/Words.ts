
type WordType = 'adjectives' | 'nouns' | 'verbs';
export default class Words {
  static async get(types: WordType[] = ['adjectives', 'nouns'], count: number = 1): Promise<string[]> {
    const typesSet = new Set(types);
    const validTypes: WordType[] = ['adjectives', 'nouns', 'verbs'];
    const selectedTypes = Array.from(typesSet).filter(t => validTypes.includes(t as WordType)) as WordType[];
    if (selectedTypes.length === 0) selectedTypes.push('nouns');
    if (count <= 0) count = 1;
    else if (count > 10) count = 10;

    const allWords: string[] = [];
    await Promise.all(selectedTypes.map(async type => {
      try {
        // Dynamically import the word list JSON file
        const resp = await fetch(`https://gist.githubusercontent.com/camalot/8d2af3796ac86083e873995eab98190d/raw/b39de3a6ba03205380caf5d58e0cae8a869ac36d/${type}.js`)
        if (!resp.ok) throw new Error(`Failed to load word list for type "${type}"`);
        const text = await resp.text();
        const jsonText = text.replace(/(var\s(adjectives|nouns|verbs)\s=\s)|;$/g, '');
        const words: string[] = JSON.parse(jsonText);
        allWords.push(...Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]));
      } catch (error) {
        console.error(`Error loading word list for type "${type}":`, error);
      }
    }));
    return allWords;
  }
}