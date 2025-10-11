# Modal Partial

File: `src/views/partials/modal.hbs`

## Purpose

Provides a reusable Bootstrap-based modal with configurable title, submit/cancel button labels, form action, method, and body slot.

## Usage

``` hbs
{{#> modal 
  id="remove-op-modal"
  title="Remove Minecraft Operator"
  buttonText="Remove"
  buttonClass="btn-danger"
  cancelText="Cancel"
  formAction="/minecraft/ops/remove"
  formMethod="POST"}}
  <!-- inner content / form fields -->
{{/modal}}
```

## Parameters (Hash Arguments)

| Name | Required | Description |
|------|----------|-------------|
| id | Yes | Unique modal DOM id. |
| title | Yes | Modal title text. |
| buttonText | Yes | Submit button label. |
| buttonClass | No | Extra classes for submit button (e.g. `btn-danger`). |
| cancelText | No | Cancel button label (default: `Close`). |
| formAction | No | If provided, wraps body in a `<form>` targeting this action. |
| formMethod | No | Form method (`GET`, `POST`, etc.). Default `POST` if `formAction` is set. |
| formEncType | No | Optional enctype for file uploads. |
| noFooter | No | If truthy, hides the footer (no buttons). |

## Body Slot

The block content between `{{#> modal ...}}` and `{{/modal}}` becomes the modal body. Place field partials or any markup here.

## Accessibility

- Focus management handled by Bootstrap’s modal JS.
- Provide concise `title` for clarity.
- Ensure form fields have associated `<label>` elements.

## Examples

### Confirmation Modal

``` hbs
{{#> modal id="confirm-delete" title="Delete Item" buttonText="Delete" buttonClass="btn-danger" formAction="/items/123?_method=DELETE"}}
  <p class="mb-0">Are you sure you want to delete this item?</p>
{{/modal}}
```

### Read-Only Info Modal

``` hbs
{{#> modal id="info-modal" title="Information" buttonText="Close" noFooter=true}}
  <p>Some informational content...</p>
{{/modal}}
```
