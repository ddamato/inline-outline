# [`<inline-outline/>`](https://ddamato.github.io/inline-outline/)

[![npm version](https://img.shields.io/npm/v/inline-outline.svg)](https://www.npmjs.com/package/inline-outline)

Create and edit a document outline using a web component.

## Install

The project is distributed as an [`IIFE`](https://developer.mozilla.org/en-US/docs/Glossary/IIFE), so the easiest way is to just create a script tag pointing to the export hosted on [unpkg](https://unpkg.com/).

```html
<script src="unpkg.com/inline-outline" defer></script>
```

However, you can also install the package and add the script through some build process.

```html
<script src="dist/inline-outline.iife.js" defer></script>
```

## Usage

Once the script is loaded, you can add the new component to a page.

```html
<inline-outline></inline-outline>
```

## Navigation

### `Tab`

The `Tab` key will cause a item to move one level inward. away from the root list `Shift+Tab` will move the item one level outward, toward the root list. This will also increase/decrease the font size based on the nesting level and provide an updated ordering.

### `Enter`

The `Enter` key will create a new item underneath the current item in the same list.

### `Backspace`

The `Backspace` key will delete an item if does not contain any content.

> [!NOTE]
> When removing items, the component should always render at least one item, even if emptied.

### `ArrowDown` & `ArrowUp`

These keys will traverse the items. When the caret reaches either end of the text field, the caret will move to the next text field in that direction.

### Drag & Drop

You may grab the number of any item to begin a drag & drop experience. A placeholder element will appear to indicate where the dragged item will be placed when released. During this behavior, the numbers may be inaccurate as the component attempts to place the item.

## Purpose

When I was preparing a conference talk, I realized that editing the outline in markdown could have been improved if I was able to click and drag items around the outline to reorder the concepts. In writing this, I realize I could have probably looked up the keyboard shortcut to move a line of text in my code editor, but it's clearly too late now.