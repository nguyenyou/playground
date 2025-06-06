---
title: "Hello React"
---
 
# Hello React
 
This is my first post!

<ReactPlayground>
```css styles.css hidden
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
  border: 1px solid oklch(87.2% 0.01 258.338);
  border-radius: 0.25rem;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
  outline-offset: 2px;
  outline: 12px solid #0000;
}
button:hover {
  background-color: oklch(96.7% 0.003 264.542);
}
button:active {
  background-color: oklch(92.8% 0.006 264.531);
}
button:focus {
  outline: 2px solid #acdbf8;
}
```
```js index.js active
import React from 'react';
import { createRoot } from 'react-dom/client';

type Props = {
  initialCount: number
}

const Counter = (props: Props) => {
  const [count, setCount] = React.useState(props.initialCount)
  return <div className="flex items-center gap-4">
    <span>{count}</span>
    <button onClick={() => setCount(count + 1)}>Click me</button>
  </div>;
}

const App = () => {
  return <Counter initialCount={10}/>
};

let root = createRoot(document.getElementById("root"));
root.render(<App />);
```
```html index.html hidden

```
</ReactPlayground>