import { SystemActionEventData } from "./SystemActionEventEntry";

export default class NewAccountKickSystemActionEvent implements SystemActionEventData {
  user_id?: string;
  reason?: string;
  account_age?: number;

  constructor(data: Partial<NewAccountKickSystemActionEvent> = {}) {
    Object.assign(this, data);
  }
}