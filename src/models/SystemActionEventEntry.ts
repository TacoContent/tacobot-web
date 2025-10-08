import { SystemActions } from "../libs/consts/TacoBot/SystemActions";

export default class SystemActionEventEntry<T = SystemActionEventData | null | undefined> {
  _id?: string;
  guild_id: string | null | undefined;
  action: SystemActions | string | null | undefined;
  timestamp: number | null | undefined;
  data: T | null | undefined;
  constructor(o: Partial<SystemActionEventEntry<T>> = {}) {
    Object.assign(this, o);
  }
}

export interface SystemActionEventData { } // eslint-disable-line @typescript-eslint/no-empty-object-type
