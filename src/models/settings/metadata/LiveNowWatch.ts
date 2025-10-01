import Metadata from "./Metadata";
import Role from "./Role";


export default class LiveNowWatch extends Metadata {
  roles: LiveNowWatchRole[] = [];
  add_roles: LiveNowWatchAddRole[] = [];
  remove_roles: LiveNowWatchRemoveRole[] = [];
}

export class LiveNowWatchRole extends Role {
  type?: string = 'role';
  enabled: boolean = true;
  deprecated?: boolean | undefined = false;
  name?: string = 'Roles';
  description?: string = 'Roles to watch for users goes that go live on supported streaming platforms.';
}

export class LiveNowWatchAddRole extends Role {
  type?: string = 'role';
  enabled: boolean = true;
  deprecated?: boolean | undefined = false;
  name?: string = 'Add Roles';
  description?: string = 'Roles to add when a user goes live on supported streaming platforms.';
}

export class LiveNowWatchRemoveRole extends Role {
  type?: string = 'role';
  enabled: boolean = true;
  deprecated?: boolean | undefined = false;
  name?: string = 'Remove Roles';
  description?: string = 'Roles to remove when a user is no longer live on supported streaming platforms.';
}