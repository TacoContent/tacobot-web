# Settings Field Partials

Directory: `src/views/partials/settings/fields/`

These partials render dynamic settings inputs with consistent labeling, help metadata, and (deprecated) attribute handling via `settings/metadata/deprecated/attrs.hbs`.

## Field Partials

| Partial | File | Purpose |
|---------|------|---------|
| `settings/fields/array` | `array.hbs` | Renders an array input (likely comma or newline separated). |
| `settings/fields/boolean` | `boolean.hbs` | Boolean toggle (checkbox). |
| `settings/fields/channel` | `channel.hbs` | Channel selection input. |
| `settings/fields/date` | `date.hbs` | Date/time input. |
| `settings/fields/debug` | `debug.hbs` | Debug info / diagnostic display. |
| `settings/fields/duration` | `duration.hbs` | Duration picker (ties into `duration-picker.js`). |
| `settings/fields/emoji` | `emoji.hbs` | Emoji input field. |
| `settings/fields/image-url` | `image-url.hbs` | Image URL input with preview placeholder. |
| `settings/fields/json` | `json.hbs` | JSON editor/textarea. |
| `settings/fields/mentionable` | `mentionable.hbs` | User or role selector. |
| `settings/fields/number` | `number.hbs` | Numeric input. |
| `settings/fields/object` | `object.hbs` | Object (key/value) editor. |
| `settings/fields/password` | `password.hbs` | Password/secret input (masked). |
| `settings/fields/regex` | `regex.hbs` | Regular expression input with potential validation. |
| `settings/fields/role` | `role.hbs` | Role selection input. |
| `settings/fields/string` | `string.hbs` | Free-form text input. |
| `settings/fields/url` | `url.hbs` | URL input with validation hints. |

## Metadata Partials

| Partial | File | Purpose |
|---------|------|---------|
| `settings/metadata/description` | `description.hbs` | Field description/help text. |
| `settings/metadata/unit` | `unit.hbs` | Unit label (e.g., seconds, ms). |
| `settings/metadata/deprecated/attrs` | `deprecated/attrs.hbs` | Emits data attributes for deprecated status. |
| `settings/metadata/deprecated/alert` | `deprecated/alert.hbs` | Alert banner indicating deprecation. |
| `settings/metadata/deprecated/class` | `deprecated/class.hbs` | Legacy class injection (being phased out). |

## Deprecation Strategy

- New approach: use `data-*` attributes from `deprecated/attrs.hbs` and target them via CSS.
- Old class-based partial (`deprecated/class.hbs`) slated for removal once all references confirmed removed.

## Example

```hbs
<div class="mb-3" {{> settings/metadata/deprecated/attrs deprecated=field.deprecated}}>
  <label for="{{id}}" class="form-label">{{label}}</label>
  {{> settings/fields/string id=id name=name value=value placeholder=placeholder }}
  {{> settings/metadata/description text=description}}
</div>
```
