import { SystemActionEventData } from "./SystemActionEventEntry";

export default class JoinWhitelistRemoveSystemActionEvent implements SystemActionEventData {
  user_id?: string;
  removed_by?: string;

  constructor(data: Partial<JoinWhitelistRemoveSystemActionEvent> = {}) {
    Object.assign(this, data);
  }
}