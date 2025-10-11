# TacoBot Web Documentation

Comprehensive overview of reusable Handlebars partials and UI building blocks.

## Table of Contents

- [General Partials](./partials-general.md)
- [Modal Partial](./partials-modal.md)
- [Discord Partials](./partials-discord.md)
- [Minecraft Partials](./partials-minecraft.md)
- [Settings Field Partials](./partials-settings-fields.md)
- [Dropdown Control](./DropdownControl.md)
- [Generated Partials Reference](./partials-generated.md)

## Usage Notes

1. All partials live under `src/views/partials/` and are automatically registered at startup (`www.ts` walks the directory tree and registers `.hbs` files`).
2. Namespaces mirror directory structure. Example: `src/views/partials/minecraft/user.hbs` => `{{> minecraft/user ...}}`.
3. The `modal` partial wraps slot content; specialized bodies (e.g., `minecraft/new-whitelist-modal`) focus only on fields/layout.
4. Settings field partials share metadata helpers (description, units, deprecation attributes) enabling consistent layout and styling.
5. Dynamic behaviors (e.g., whitelist username lookup) are delegated to page-specific JS assets loaded via a `{{#section 'scripts'}}` block.

## Adding New Partials

1. Create the `.hbs` file under an appropriate directory (create a new subfolder if logically grouped).
2. Keep logic minimal; rely on helpers registered in `libs/hbs/helpers` for formatting or computed display.
3. If partial has dynamic behavior, place JS in `src/assets/javascript/` and include it through a section block on the consuming view.
4. Document it by adding a row to the relevant markdown doc and, if needed, a new markdown file linked from this README.

## Conventions

| Aspect | Guideline |
|--------|-----------|
| Naming | Use directory names as namespaces. |
| Data Attributes | Prefer `data-*` markers for deprecation or state over CSS classes. |
| Reusability | Extract repeated structures (forms, modals, rows) early to partials. |
| Accessibility | Always label form controls; use semantic markup inside partials. |
| Styling | Keep structural classes in partial; theme-specific or layout spacing can be applied by parent containers. |

## Future Enhancements

- Automate doc generation by parsing partial front-matter or inline comments.
- Add screenshots / visual examples for complex partials (modal, field types, op-level).
- Provide a style guide page rendering all partials in isolation.
