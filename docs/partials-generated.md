# Generated Partials Reference

> Auto-generated from leading Handlebars comments. Edit the first comment block in each partial to change this file.

### accountage/whitelist/item

_No header comment found._

### alert (`alert`)

settings/fields/role.hbs


### birthdays/card-class

_No header comment found._

### birthdays/item

_No header comment found._

### code (`code`)

A field that has an icon to copy the value in the element


### controls/Dropdown (`controls/Dropdown`)

Reusable multi/single select dropdown control with token display and freeform filtering.
Usage (multi-select):
{{#> Dropdown id="guilds" name="guild_ids" multiple=true placeholder="Select guild(s)" values=preselectedGuildIds}}
<li class="dropdown-item d-flex align-items-center gap-2" data-value="123">
<img src="/images/guilds/123.png" width="24" height="24" class="rounded" alt="" /> Guild 123
</li>
<li class="dropdown-item" data-value="456">Guild 456</li>
{{/Dropdown}}
Usage (single select):
{{#> Dropdown id="region" name="region" placeholder="Choose region" multiple=false}}
<li class="dropdown-item" data-value="na">North America</li>
<li class="dropdown-item" data-value="eu">Europe</li>
{{/Dropdown}}
Params:
id (required)            : Unique id for the control root
name                     : Name attribute for the hidden backing <select>
multiple (default=true)  : Allow multiple selection
placeholder              : Placeholder text shown when no selection
values                   : Array of pre-selected values (must match data-value of provided <li>)
class                    : Extra classes for root wrapper
label                    : Optional label text (for accessibility)
searchable (default=true): Whether freeform typing / filtering is enabled. Set to false to disable search and require selection from list only.
Block Content:
Provide one or more <li class="dropdown-item" data-value="...">Custom HTML ...</li>
Each must have a unique data-value.


### controls/GuildSelector

_No header comment found._

### currency

_No header comment found._

### date

_No header comment found._

### discord/channel (`discord/channel`)

Renders a Discord channel mention.
Parameters:
channel: The Discord channel ID.
guild: (Optional) The Discord guild ID to fetch the channel from. Defaults to the primary guild ID from config if not provided.


### discord/emoji

_No header comment found._

### discord/guild (`discord/guild`)

Renders a Discord guild icon with name.
Parameters:
id: The Discord guild ID.


### discord/mentionable

_No header comment found._

### discord/role

_No header comment found._

### discord/user (`discord/user`)

Renders a Discord user mention with avatar and username.
Parameters:
user: The Discord user ID.
guild: (Optional) The Discord guild ID to fetch the user from. Defaults to the primary guild ID from config if not provided.


### freegamekeys/item

_No header comment found._

### gamekeys/item

_No header comment found._

### gamekeys/offer

_No header comment found._

### highlight

_No header comment found._

### minecraft/new-op-modal

_No header comment found._

### minecraft/new-whitelist-modal

_No header comment found._

### minecraft/op-level

_No header comment found._

### minecraft/user

_No header comment found._

### Modal Partial (`modal`)

Generic Bootstrap 5 modal wrapper supporting inline body param or block content with optional form wrapping.

| Input | Description |
|-------|-------------|
| `id` | Unique modal id |
| `title` | Modal title |
| `body` | Static body HTML (ignored if block provided) |
| `buttonText` | Primary action label |
| `buttonClass` | Extra classes for primary button |
| `cancelText` | Cancel button label |
| `formAction` | Form action URL |
| `formMethod` | Form method when formAction given |
| `size` | Dialog size sm|lg|xl |
| `centered` | Vertically center dialog |
| `scrollable` | Scrollable body region |


### navbar

_No header comment found._

### pager

_No header comment found._

### permissions/item

_No header comment found._

### search

_No header comment found._

### settings/field (`settings/field`)

settings/field.hbs


### settings/fields/array (`settings/fields/array`)

settings/fields/array.hbs


### settings/fields/boolean (`settings/fields/boolean`)

settings/fields/boolean.hbs


### settings/fields/channel (`settings/fields/channel`)

settings/fields/channel.hbs


### settings/fields/date (`settings/fields/date`)

settings/fields/date.hbs


### settings/fields/debug (`settings/fields/debug`)

settings/fields/array.hbs


### settings/fields/duration (`settings/fields/duration`)

settings/fields/duration.hbs


### settings/fields/emoji (`settings/fields/emoji`)

settings/fields/emoji.hbs


### settings/fields/image-url (`settings/fields/image-url`)

settings/fields/image-url.hbs


### settings/fields/json (`settings/fields/json`)

settings/fields/json.hbs


### settings/fields/mentionable (`settings/fields/mentionable`)

settings/fields/mentionable.hbs


### settings/fields/number (`settings/fields/number`)

settings/fields/number.hbs


### settings/fields/object (`settings/fields/object`)

settings/fields/object.hbs --


### settings/fields/password (`settings/fields/password`)

settings/fields/password.hbs


### settings/fields/regex (`settings/fields/regex`)

settings/fields/regex.hbs


### settings/fields/role (`settings/fields/role`)

settings/fields/role.hbs


### settings/fields/string (`settings/fields/string`)

settings/fields/string.hbs


### settings/fields/url (`settings/fields/url`)

settings/fields/url.hbs


### settings/metadata/deprecated/alert

_No header comment found._

### Deprecated Attrs (`settings/metadata/deprecated/attrs`)

Emits data-* attributes describing deprecation state for a setting (data-deprecated, data-deprecated-level).

| Input | Description |
|-------|-------------|
| `metadata` | Full metadata object |
| `key` | Explicit setting key (optional) |
| `level` | Fallback deprecation level if metadata missing |


### settings/metadata/deprecated/class (`settings/metadata/deprecated/class`)

settings/helpers/deprecated/class.hbs


### settings/metadata/description (`settings/metadata/description`)

settings/metadata/description.hbs


### settings/metadata/unit

_No header comment found._

### shiftcodes/item

_No header comment found._

### sidebar/group

_No header comment found._

### sidebar/guild_link

_No header comment found._

### sidebar/link

_No header comment found._

### sidebar/separator

_No header comment found._

### sidebar/settings

_No header comment found._

### sidebar/sidebar

_No header comment found._

### taco

_No header comment found._

### templates/discord-channel-field

_No header comment found._

### templates/discord-emoji

_No header comment found._

### templates/discord-guild

_No header comment found._

### templates/discord-role-field

_No header comment found._

### templates/discord-user-field

_No header comment found._

### templates/discord-user

_No header comment found._

### templates/main

_No header comment found._

### templates/twitch-user

_No header comment found._

### twitch/dynamic-user

_No header comment found._

### twitch/user

_No header comment found._

### yes-no

_No header comment found._
