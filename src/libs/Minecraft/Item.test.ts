import { calculateVariantId, calculateVariantIdFromSnbt } from './Item'

test('calculateVariantId from dict (netherite boots)', () => {
  const expected = 'a395b124c58e76569b695214eb532bbb979b8fa5fbeaa49d92778c7a73aac49a'
  const itemId = 'minecraft:netherite_boots'
  const nbt = {
    components: { 'minecraft:enchantments': { levels: { 'minecraft:fortune': 6, 'minecraft:unbreaking': 6 } } },
  }

  const got = calculateVariantId(itemId, nbt)
  expect(typeof got).toBe('string')
  expect(got.length).toBe(64)
  expect(got).toBe(expected)
})

test('calculateVariantIdFromSnbt string', () => {
  const expected = 'a395b124c58e76569b695214eb532bbb979b8fa5fbeaa49d92778c7a73aac49a'
  const itemId = 'minecraft:netherite_boots'
  const snbt = '{components:{"minecraft:enchantments":{levels:{"minecraft:fortune":6,"minecraft:unbreaking":6}}},count:1,id:"minecraft:netherite_boots"}'
  const got = calculateVariantIdFromSnbt(itemId, snbt)
  expect(got).toBe(expected)
})

test('empty snbt uses item id', () => {
  const itemId = 'minecraft:netherite_boots'
  expect(calculateVariantIdFromSnbt(itemId, undefined)).toBe(calculateVariantId(itemId, undefined))
  expect(calculateVariantIdFromSnbt(itemId, '')).toBe(calculateVariantId(itemId, undefined))
  expect(calculateVariantIdFromSnbt(itemId, '{}')).toBe(calculateVariantId(itemId, undefined))
})

test('dragon egg variants equivalent', () => {
  const itemId = 'minecraft:dragon_egg'
  const expected = '453e3e25e8500728b41b35fa69f0dc4020ec385661175cf9669098ff6ca10d64'
  expect(calculateVariantIdFromSnbt(itemId, '{count:2,id:"minecraft:dragon_egg"}')).toBe(expected)
  expect(calculateVariantIdFromSnbt(itemId, '')).toBe(expected)
  expect(calculateVariantIdFromSnbt(itemId, 'count:1,id:"minecraft:dragon_egg"')).toBe(expected)
  expect(calculateVariantId(itemId, undefined)).toBe(expected)
})

test('missing id is added for snbt (diamond helmet)', () => {
  const itemId = 'minecraft:diamond_helmet'
  const expected = '606635a7baefc2facf1e5e13c6d0064d1a3c377da1347aedcbf5a6c7542b5047'
  expect(calculateVariantIdFromSnbt(itemId, '{components:{"minecraft:damage":37},count:1}')).toBe(expected)
  expect(calculateVariantId(itemId, { components: { 'minecraft:damage': 37 } })).toBe(expected)
})

test('shulker box with contents', () => {
  const itemId = 'minecraft:shulker_box'
  const snbt = '{components:{"minecraft:container":[{item:{count:64,id:"minecraft:dirt"},slot:0},{item:{count:1,id:"minecraft:iron_helmet"},slot:1},{item:{count:5,id:"minecraft:apple"},slot:2},{item:{count:3,id:"minecraft:stick"},slot:3},{item:{count:4,id:"minecraft:coal"},slot:4}]},count:1,id:"minecraft:shulker_box"}'
  const expected = '376f09b92e89f3c3225d1f7f2e049a3621b14a4404c17d8937b8d7b6fe967977'
  expect(calculateVariantIdFromSnbt(itemId, snbt)).toBe(expected)
})

test('deterministic ordering independent of input object insertion order', () => {
  const expected = 'a395b124c58e76569b695214eb532bbb979b8fa5fbeaa49d92778c7a73aac49a'
  const itemId = 'minecraft:netherite_boots'
  const nbtA = { components: { 'minecraft:enchantments': { levels: { 'minecraft:unbreaking': 6, 'minecraft:fortune': 6 } } } }
  const nbtB = { components: { 'minecraft:enchantments': { levels: { 'minecraft:fortune': 6, 'minecraft:unbreaking': 6 } } } }
  expect(calculateVariantId(itemId, nbtA)).toBe(expected)
  expect(calculateVariantId(itemId, nbtB)).toBe(expected)
})
