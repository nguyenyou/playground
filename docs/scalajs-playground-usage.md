# ScalaJS Playground - Inline Code Preview

This enhanced system allows you to write ScalaJS code directly in your MDX files with automatic compilation and preview.

## Basic Usage

Simply add `preview` to your scala code block:

````markdown
```scala preview
div(
  h1("Hello from ScalaJS!"),
  p("This is automatically compiled and previewed")
)
```
````

## Templates

### Default Laminar Template (default)

```scala preview
div(
  "Count: ",
  child.text <-- Var(0).signal
)
```

### DOM Template

```scala preview template=dom
val element = document.createElement("div")
element.textContent = "Hello from vanilla ScalaJS!"
document.querySelector("#root").appendChild(element)
```

### Component Template

```scala preview template=laminar-component
div(
  className := "counter",
  h2("Counter Component"),
  button("+", onClick --> Observer(_ => println("clicked")))
)
```

### Laminar with Tailwind

```scala preview template=laminar-tailwind preset=sjs-tailwind
div(
  className := "flex flex-col items-center gap-4 p-8",
  h1(className := "text-3xl font-bold", "Tailwind + Laminar"),
  button(
    className := "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
    "Click me"
  )
)
```

## Advanced Usage

### Custom Title

```scala preview title=MyCounter
val count = Var(0)
div(
  button("-", onClick --> (_ => count.update(_ - 1))),
  span(child.text <-- count.signal.map(_.toString)),  
  button("+", onClick --> (_ => count.update(_ + 1)))
)
```

### Hidden Styles

```scala preview hidden
// The CSS will be hidden in the playground view
div("Content")
```

### Full Example - Counter App

```scala preview
val count = Var(0)

div(
  styleAttr := "display: flex; gap: 10px; align-items: center;",
  button(
    "-",
    onClick --> Observer(_ => count.update(_ - 1))
  ),
  span(
    styleAttr := "min-width: 2em; text-align: center;",
    text <-- count.signal.map(_.toString)
  ),
  button(
    "+", 
    onClick --> Observer(_ => count.update(_ + 1))
  )
)
```

## How It Works

1. The plugin detects `scala preview` code blocks
2. Wraps your code in a proper ScalaJS application template
3. Generates a temporary Mill project
4. Compiles the ScalaJS code
5. Caches the result for performance
6. Injects a Playground component with the compiled JS

## Configuration

In your `content-collections.ts`:

```typescript
import { createScalaJSPlaygroundPlugin } from './plugins/playground/remark-scalajs-playground'

// ...
remarkPlugins: [
  createScalaJSPlaygroundPlugin({
    defaultTemplate: 'laminar',
    autoImports: true,
    // Optional: custom templates
    customTemplates: {
      'my-template': {
        imports: ['import mylib._'],
        wrapper: { before: '...', after: '...' },
        dependencies: ['com.myorg::mylib::1.0.0']
      }
    }
  })
]
```

## Performance

- Compiled results are cached based on code content
- Unchanged code blocks are not recompiled
- Cache is stored in `.scalajs-cache/` directory

## Limitations

- Code must be self-contained (no external file imports)
- Compilation happens at build time (not in the browser)
- Mill must be installed and available in PATH
