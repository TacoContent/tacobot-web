# General Partials

Miscellaneous reusable fragments.

## List

| Partial | File | Purpose |
|---------|------|---------|
| `alert` | `alert.hbs` | Generic alert banner component. |
| `navbar` | `navbar.hbs` | Top navigation bar. |
| `pager` | `pager.hbs` | Reusable pagination control (accepts pager object). |
| `search` | `search.hbs` | Search input form segment. |
| `yes-no` | `yes-no.hbs` | Renders boolean as icon/badge. |
| `sidebar/*` | `sidebar/` | Sidebar groups/links partials loaded dynamically. |
| `taco` | `taco.hbs` | Fun decorative partial / mascot element. |
| `code` | `code.hbs` | Inline or block code highlighting wrapper. |
| `currency` | `currency.hbs` | Currency formatting display. |
| `date` | `date.hbs` | Date formatting output. |
| `highlight` | `highlight.hbs` | Highlighted text snippet. |
| `templates/*` | `templates/` | Template snippets for dynamic cloning. |

## Pager Data Contract

Expected pager object shape:

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 123,
  "pageCount": 13,
  "hasPrev": true,
  "hasNext": true
}
```

## Search Partial

Wraps an `<input>` and optional hidden fields for preserving other query params. Provide `id`, `name`, and `placeholder`.
