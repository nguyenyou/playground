---
title: Hello
date: '2025-06-03'
---

 ## Markup

Hello

<Playground>
```css styles.css hidden
:root {
  --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  --color-gray-100: oklch(96.7% 0.003 264.542);
  --color-gray-200: oklch(92.8% 0.006 264.531);
  --color-gray-300: oklch(87.2% 0.01 258.338);
  --spacing: 0.25rem;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
html, body {
  width: 100%;
  height: 100%;
}
body {
  display: flex;
  justify-content: center;
  align-items: center;
}
button {
  transition: all 0.1s, outline 0.3s;
  background-color: #fff;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.25rem;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
  outline-offset: 2px;
  outline: 12px solid #0000;
}
button:hover {
  background-color: var(--color-gray-100);
}
button:active {
  background-color: var(--color-gray-200);
}
button:focus {
  outline: 2px solid #acdbf8;
}
```
```js index.js active
console.log("hello")
```
```html index.html hidden
<div>
  <button>Button</button>
</div>
```
</Playground>