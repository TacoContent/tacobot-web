import { SystemActionEventData } from "./SystemActionEventEntry";

export default class JoinWhitelistAddSystemActionEvent implements SystemActionEventData {
  user_id?: string;
  added_by?: string;

  constructor(data: Partial<JoinWhitelistAddSystemActionEvent> = {}) {
    Object.assign(this, data);
  }
}