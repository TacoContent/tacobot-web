
function stripIndent(value: any): string {
    if (value === undefined) return '';
    // ensure we have a string
    let text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    // split into lines
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    // remove leading/trailing blank lines
    while (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    // find minimum indentation (spaces or tabs) among non-empty lines
    let minIndent: number | null = null;
    for (const line of lines) {
      if (line.trim() === '') continue;
      const match = line.match(/^[ \t]*/);
      const indentLen = match ? match[0].length : 0;
      if (minIndent === null || indentLen < minIndent) minIndent = indentLen;
    }

    if (minIndent && minIndent > 0) {
      for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].slice(minIndent);
      }
    }
    return lines.join('\n');
}

function jsonPretty(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    return JSON.stringify(value, null, 2).trim();
}

const testObj = {
  "components": {
    "minecraft:enchantments": {
      "levels": {
        "minecraft:fortune": 6,
        "minecraft:unbreaking": 6
      }
    }
  },
  "count": 1,
  "id": "minecraft:netherite_leggings"
};

console.log("--- jsonPretty output ---");
const pretty = jsonPretty(testObj);
console.log(pretty);
console.log("-------------------------");

console.log("--- stripIndent output ---");
const stripped = stripIndent(pretty);
console.log(stripped);
console.log("--------------------------");

console.log("--- stripIndent on indented string ---");
const indented = `
          {
            "a": 1
          }
`;
const strippedIndented = stripIndent(indented);
console.log(strippedIndented);
console.log("--------------------------------------");
