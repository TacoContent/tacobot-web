#!/usr/bin/env node
/**
 * Generate documentation for Handlebars partials by reading leading comment blocks.
 *
 * Extraction Rules:
 * - Reads all .hbs files under src/views/partials
 * - If the file starts with a Handlebars comment {{!-- ... --}} (possibly multi-line)
 *   the inner text is parsed.
 * - Supports optional lightweight front-matter style lines in the leading comment:
 *     Title: Some Title
 *     Description: A sentence or two.
 *     Inputs: name=desc; name2=desc2
 * - Remaining text (after blank line) treated as free-form notes.
 */
import fs from 'fs';
import path from 'path';

const PARTIALS_ROOT = path.join(process.cwd(), 'src', 'views', 'partials');
const OUTPUT = path.join(process.cwd(), 'docs', 'partials-generated.md');

/** Recursively collect .hbs files */
function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(collectFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.hbs')) files.push(full);
  }
  return files;
}

function relativePartialName(fullPath) {
  // after PARTIALS_ROOT, replace Windows backslashes, drop extension
  const rel = path.relative(PARTIALS_ROOT, fullPath).replace(/\\/g, '/');
  return rel.replace(/\.hbs$/, '');
}

function parseHeaderComment(content) {
  // Match leading Handlebars comment(s)
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('{{!--')) return null;
  const match = trimmed.match(/^\{\{!--([\s\S]*?)--}}/);
  if (!match) return null;
  const inner = match[1].trim();
  const lines = inner.split(/\r?\n/).map(l => l.replace(/^\s*[*#-]?\s?/, '').trimEnd());

  let meta = { Title: '', Description: '', Inputs: '', Notes: '' };
  let notesStart = false;
  const inputMap = [];
  for (const line of lines) {
    if (!line.trim()) { notesStart = true; continue; }
    if (!notesStart) {
      const kv = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.+)$/);
      if (kv) {
        const key = kv[1];
        const value = kv[2];
        if (key.toLowerCase() === 'inputs') {
          // store raw for later parsing
          meta.Inputs = value;
        } else if (key.toLowerCase() === 'title') meta.Title = value;
        else if (key.toLowerCase() === 'description') meta.Description = value;
        else {
          // treat unknown header lines as part of notes
          meta.Notes += (meta.Notes ? '\n' : '') + line;
        }
        continue;
      }
    }
    // treat as notes
    meta.Notes += (meta.Notes ? '\n' : '') + line;
  }

  // parse Inputs string: name=desc; name2=desc2
  const inputs = [];
  if (meta.Inputs) {
    meta.Inputs.split(/;\s*/).forEach(pair => {
      const [k, v] = pair.split(/=/);
      if (k) inputs.push({ name: k.trim(), desc: (v || '').trim() });
    });
  }
  return { meta, inputs };
}

function generate() {
  const files = collectFiles(PARTIALS_ROOT).sort();
  const sections = [];

  for (const file of files) {
    const relName = relativePartialName(file);
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = parseHeaderComment(raw);
    const header = relName;

    if (!parsed) {
      sections.push(`### ${header}\n\n_No header comment found._\n`);
      continue;
    }

    const { meta, inputs } = parsed;
    const title = meta.Title || header;
    const desc = meta.Description || meta.Notes || '';
    let block = `### ${title} (\`${header}\`)\n\n`;
    if (desc) block += desc + '\n\n';
    if (inputs.length) {
      block += '| Input | Description |\n|-------|-------------|\n';
      for (const inp of inputs) block += `| \`${inp.name}\` | ${inp.desc || ''} |\n`;
      block += '\n';
    }
    sections.push(block);
  }

  const out = `# Generated Partials Reference\n\n> Auto-generated from leading Handlebars comments. Edit the first comment block in each partial to change this file.\n\n${sections.join('\n')}`;
  fs.writeFileSync(OUTPUT, out, 'utf8');
  console.log(`Generated documentation for ${files.length} partials → ${OUTPUT}`);
}

generate();
