# Minecraft Partials

Directory: `src/views/partials/minecraft/`

## Partials

| Partial | File | Purpose |
|---------|------|---------|
| `minecraft/user` | `user.hbs` | Displays a Minecraft username + (optionally) avatar/skin hook. |
| `minecraft/op-level` | `op-level.hbs` | Renders operator level (e.g., numeric badges or icons). |
| `minecraft/new-op-modal` | `new-op-modal.hbs` | Body content for Add Operator modal (mock form fields). |
| `minecraft/new-whitelist-modal` | `new-whitelist-modal.hbs` | Body content for Add Whitelisted User modal (mock fields + preview). |

## New Operator Modal Body

Used inside the generic `modal` wrapper; provides input scaffolding for: guild, Discord user, Minecraft user, op level, bypass limit.

## New Whitelist Modal Body

Contains mock fields for Discord User, Minecraft Username, Guild, plus hidden UUID + preview image sized 158x360. JS (`minecraft-whitelist.js`) handles username→UUID lookup and preview.

## Example

```hbs
{{#> modal id="add-op-modal" title="Add Minecraft Operator" buttonText="Add" buttonClass="btn-success" formAction="/minecraft/ops/add" formMethod="POST"}}
  {{> minecraft/new-op-modal}}
{{/modal}}
```
