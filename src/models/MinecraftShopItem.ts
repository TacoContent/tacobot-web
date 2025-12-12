
export default class MinecraftShopItem {
  item_id: string = '';
  nbt: Record<string, any> | undefined = undefined;
  variant_id: string = '';
  quantity: number = -1;  // -1 means unlimited
  buy: number = 0;  // buy price; 0 means not for sale
  sell: number = 0;  // sell price; 0 means not for sale
  enabled: boolean = true;  // is the item enabled in the shop
  metadata: Record<string, any> = {};

  constructor(data: Partial<MinecraftShopItem> = {}) {
    Object.assign(this, data);
  }
}