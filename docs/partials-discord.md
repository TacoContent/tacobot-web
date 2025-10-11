# Discord Partials

Directory: `src/views/partials/discord/`

Provides UI fragments for rendering Discord-related entities with consistent formatting and potential future caching / enrichment hooks.

## Partials

| Partial | File | Purpose |
|---------|------|---------|
| `discord/guild` | `guild.hbs` | Renders a guild (server) name/icon placeholder given an id. |
| `discord/user` | `user.hbs` | Displays a Discord user mention or resolved display name. |
| `discord/role` | `role.hbs` | Displays a role name, optionally colorized. |
| `discord/channel` | `channel.hbs` | Shows a channel reference (e.g., `#general`). |
| `discord/emoji` | `emoji.hbs` | Renders a custom emoji placeholder or unicode. |
| `discord/mentionable` | `mentionable.hbs` | Generic mentionable (user/role) abstraction. |

## Common Parameters

While each partial can accept different args, common patterns include:

- `id` or `user`
- `guild` (guild id for context)
- `role`
- `channel`

## Example Usage
 
```hbs
{{> discord/guild id=guild_id}}
{{> discord/user user=user_id guild=guild_id}}
{{> discord/role role=role_id guild=guild_id}}
{{> discord/channel channel=channel_id}}
```

## Styling / Icons

Currently relies on surrounding table or layout styling. Consider future enhancements to pull guild icon URLs or user avatars.
