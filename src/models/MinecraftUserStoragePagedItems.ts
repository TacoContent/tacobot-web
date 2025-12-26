import { MinecraftUserStorageItem } from "./MinecraftUserStorageEntry";
import PagedResults from "./PagedResults";

export default class MinecraftUserStoragePagedItems {
  slots: number = 0;
  items?: PagedResults<MinecraftUserStorageItem> = undefined;
  constructor(params?: {
    slots?: number;
    items?: PagedResults<MinecraftUserStorageItem>;
  }) {
    if (params) {
      this.slots = params.slots ?? 0;
      this.items = params.items;
    }
  } 

  static empty(): MinecraftUserStoragePagedItems {
    return new MinecraftUserStoragePagedItems({
      slots: 0,
      items: PagedResults.empty<MinecraftUserStorageItem>()
    });
  }
}