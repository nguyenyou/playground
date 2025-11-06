# ScalaJS Preview System

## Overview

The ScalaJS preview system allows you to write ScalaJS code directly in markdown files and automatically:
1. Generate mill package configuration
2. Compile ScalaJS code
3. Link compiled output to the playground
4. Preview the result

## Usage

### Basic Syntax

Simply write ScalaJS code in a code block with `scala preview`:

```mdx
<Playground preset="sjs">

```scala preview
div("hello world")
```

</Playground>
```

### How It Works

1. **Detection**: The remark plugin detects code blocks with `scala preview`
2. **Template Wrapping**: Code is automatically wrapped in a template that:
   - Creates a package structure
   - Adds necessary imports (Laminar, scala-js-dom)
   - Wraps code in a `@main` function
   - Renders to `#root` element
3. **Package Generation**: Creates:
   - `demos/inline/[demoId]/package.mill`
   - `demos/inline/[demoId]/src/demos/inline/[demoId]/index.scala`
4. **Compilation**: Runs `mill` to compile the ScalaJS code
5. **Integration**: Links compiled JS to the playground

### Templates

The system automatically detects the best template based on code structure:

- **Expression** (default for simple code): `div("hello")` → wrapped as expression
- **Component** (for complex code): Multi-line code → wrapped as component class
- **Standalone** (for complete programs): Code with `@main` → used as-is

You can also specify a template explicitly:

```mdx
```scala preview template=expression
div("hello world")
```
```

Available templates: `default`, `expression`, `component`, `standalone`

### Advanced Examples

#### Simple Expression
```mdx
<Playground preset="sjs">
```scala preview
div("Hello, ScalaJS!")
```
</Playground>
```

#### Component with State
```mdx
<Playground preset="sjs">
```scala preview
val countVar = Var(0)
div(
  button("Count: ", onClick --> Observer(_ => countVar.update(_ + 1))),
  " ",
  child.text <-- countVar.signal.map(_.toString)
)
```
</Playground>
```

#### Standalone Code
```mdx
<Playground preset="sjs">
```scala preview template=standalone
@main def main = {
  val container = dom.document.querySelector("#root")
  render(container, div("Custom main function"))
}
```
</Playground>
```

#### With CSS
```mdx
<Playground preset="sjs">
```css styles.css
body {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

```scala preview
div(
  fontSize := "32px",
  color := "blue",
  "Styled ScalaJS!"
)
```
</Playground>
```

### Comparison with Manual Setup

#### Before (Manual)
1. Create `demos/hello/src/hello/` directory
2. Create `demos/hello/package.mill`
3. Write `demos/hello/src/hello/index.scala`
4. Write `demos/hello/src/hello/App.scala`
5. Reference compiled output: `file=out/demos/hello/fullLinkJS.dest/main.js`
6. Build manually: `./mill build.demos.hello.package.fullLinkJS`

#### After (Automatic)
```mdx
<Playground preset="sjs">
```scala preview
div("hello world")
```
</Playground>
```

That's it! Everything is generated and compiled automatically.

### Technical Details

#### File Structure
```
demos/
  inline/
    [demoId]/
      package.mill          # Auto-generated
      src/
        demos/
          inline/
            [demoId]/
              index.scala   # Auto-generated from your code
```

#### Compilation
- Uses mill build system
- Target: `build.demos.inline.[demoId].package.fullLinkJS`
- Output: `out/demos/inline/[demoId]/fullLinkJS.dest/main.js`
- Caching: Compiled output is cached to avoid recompilation

#### Error Handling
- Compilation errors are caught and displayed as comments in the JS file
- Scala source code is still shown for debugging
- Original code is preserved in the files object

### Configuration

The system uses default settings but can be configured:

```typescript
{
  baseDir: 'demos/inline',      // Base directory for generated demos
  buildFile: 'build.mill',      // Mill build file path
  cache: true                    // Enable caching
}
```

### Benefits

1. **No Manual Work**: Write code directly in markdown
2. **Automatic Compilation**: Mill packages are generated automatically
3. **Template System**: Code is wrapped intelligently
4. **Caching**: Fast rebuilds with caching
5. **Error Handling**: Graceful error handling with helpful messages
6. **Flexible**: Supports multiple templates and code structures

## Implementation Notes

The system consists of:

1. **scala-template.ts**: Template system for wrapping code
2. **scala-compiler.ts**: Compilation orchestrator
3. **transform.ts**: Remark plugin that processes MDX

All files are in `plugins/playground/`

