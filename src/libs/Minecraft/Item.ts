/**
 * Utilities to create a canonical SNBT-like string and compute SHA-256 variant IDs
 * for Minecraft item stacks. This mirrors the behaviour of `bot/lib/minecraft/item.py`.
 */
import { createHash } from 'crypto'

function escapeSnbtString(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

function formatKey(k: string): string {
  if (/^[A-Za-z0-9_]+$/.test(k)) return k
  return escapeSnbtString(k)
}

export function toSnbtValue(val: any): string {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    const items = Object.entries(val).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return '{' + items.map(([k, v]) => `${formatKey(k)}:${toSnbtValue(v)}`).join(',') + '}'
  }
  if (Array.isArray(val)) {
    return '[' + val.map((v) => toSnbtValue(v)).join(',') + ']'
  }
  if (typeof val === 'boolean') {
    return val ? '1b' : '0b'
  }
  if (typeof val === 'number') {
    return String(val)
  }
  if (typeof val === 'string') {
    return escapeSnbtString(val)
  }
  // fallback
  return escapeSnbtString(String(val))
}

function sha256Hex(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex')
}

export function calculateVariantId(itemId: string, nbt?: Record<string, any>): string {
  let snbt: string
  if (nbt && Object.keys(nbt).length > 0) {
    let inner = toSnbtValue(nbt)
    if (inner.startsWith('{') && inner.endsWith('}')) inner = inner.slice(1, -1)
    snbt = '{' + inner + ',count:1,id:' + toSnbtValue(itemId) + '}'
  } else {
    snbt = '{count:1,id:' + toSnbtValue(itemId) + '}'
  }
  return sha256Hex(snbt)
}

export function calculateVariantIdFromSnbt(itemId: string, snbtStr?: string): string {
  if (!snbtStr || snbtStr.trim() === '{}') {
    const s = '{count:1,id:' + toSnbtValue(itemId) + '}'
    return sha256Hex(s)
  }

  let normalized = snbtStr.trim()
  if (!normalized.startsWith('{')) normalized = '{' + normalized + '}'

  // split top-level pairs respecting nested braces
  const inner = normalized.slice(1, -1)
  const pairs: string[] = []
  let cur = ''
  let depth = 0
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    if (ch === '{') {
      depth++
      cur += ch
    } else if (ch === '}') {
      depth--
      cur += ch
    } else if (ch === ',' && depth === 0) {
      pairs.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.trim().length > 0) pairs.push(cur.trim())

  let sawId = false
  const normalizedPairs: string[] = []
  for (const p of pairs) {
    if (!p) continue
    if (p.includes(':')) {
      const idx = p.indexOf(':')
      const key = p.slice(0, idx).trim().replace(/^['"]|['"]$/g, '')
      const val = p.slice(idx + 1)
      if (key.toLowerCase() === 'count') {
        normalizedPairs.push('count:1')
        continue
      }
      if (key.toLowerCase() === 'id') {
        sawId = true
        normalizedPairs.push('id:' + val.trim())
        continue
      }
    }
    normalizedPairs.push(p)
  }

  if (!sawId) normalizedPairs.push('id:' + toSnbtValue(itemId))

  const final = '{' + normalizedPairs.join(',') + '}'
  return sha256Hex(final)
}

export default {
  toSnbtValue,
  calculateVariantId,
  calculateVariantIdFromSnbt,
}
