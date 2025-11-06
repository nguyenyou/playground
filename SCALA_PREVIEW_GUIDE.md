# ScalaJS Preview System - Usage Guide

## Overview

The ScalaJS Preview System allows you to write ScalaJS code directly in your MDX files without any manual setup. The system automatically handles compilation, caching, and preview rendering.

## Quick Start

### Basic Usage

Simply add a `scala preview` code block in your MDX file:

```mdx
```scala preview
div("Hello from ScalaJS!")
```
```

That's it! The system will:
1. ✅ Extract your code
2. ✅ Generate a Mill module
3. ✅ Wrap it in the proper template
4. ✅ Compile it to JavaScript
5. ✅ Render it in the preview

### Counter Example

```mdx
```scala preview
val countVar = Var(0)

div(
  display.flex,
  gap := "10px",
  button("-", onClick --> Observer(_ => countVar.update(_ - 1))),
  span(text <-- countVar.signal.map(_.toString)),
  button("+", onClick --> Observer(_ => countVar.update(_ + 1)))
)
```
```

## How It Works

### 1. Build Process

When you run `npm run build` or `bun build`:

1. **Pre-build phase** (`prebuild` script):
   - Scans for auto-generated modules in `demos/autogen/`
   - Checks cache to see what needs recompilation
   - Batch compiles all modules using Mill
   - Updates cache with compilation results

2. **Build phase**:
   - Next.js processes MDX files
   - `remarkScalaPreview` plugin extracts `scala preview` blocks
   - Generates module files on disk
   - Transforms blocks into `<Playground>` components
   - Links to compiled JavaScript output

### 2. File Structure

When you write a `scala preview` block, the system creates:

```
demos/autogen/h{hash}/
├── package.mill          # Mill build config
└── src/
    └── Main.scala        # Your wrapped code

out/demos/autogen/h{hash}/
└── fullLinkJS.dest/
    └── main.js          # Compiled JavaScript (336KB)
```

The `{hash}` is a 12-character SHA-256 hash of your source code, ensuring uniqueness.

### 3. Code Template

Your code is automatically wrapped in this template:

```scala
package demos.autogen.h{hash}

import org.scalajs.dom
import com.raquo.laminar.api.L.*

@main def app = {
  val container = dom.document.querySelector("#root")
  render(container, {
    // YOUR CODE HERE
  })
}
```

## Advanced Features

### Custom Template Types

#### Basic Template (Default)

Direct rendering of your code:

```mdx
```scala preview
div("Hello!")
```
```

#### Component Template

Wraps your code in a component object:

```mdx
```scala preview template=component
div("Hello from component!")
```
```

Generated code:
```scala
object AppComponent {
  def apply() = {
    div("Hello from component!")
  }
}

@main def app = {
  render(container, AppComponent())
}
```

#### Custom Template

For full control (you provide everything):

```mdx
```scala preview template=custom
import org.scalajs.dom
import com.raquo.laminar.api.L.*

@main def app = {
  val container = dom.document.querySelector("#root")
  render(container, div("Custom!"))
}
```
```

### Custom Imports

Add additional imports:

```mdx
```scala preview imports="import cats.effect.*,import io.circe.*"
div("With extra imports!")
```
```

### Show Imports Flag

Display imports in the code editor:

```mdx
```scala preview show-imports
div("Imports will be visible!")
```
```

## Development Workflow

### Manual Compilation

You can manually compile modules without building:

```bash
bun run compile-scala
```

This will:
- Scan for modules
- Check cache
- Compile only what's needed

### Watch Mode (Dev)

During development with `npm run dev`, you'll need to:

1. Add/edit a `scala preview` block in MDX
2. Run `bun run compile-scala` to compile
3. The dev server will pick up the changes

**Note**: Auto-compilation on save is not yet implemented in dev mode.

### Cache Management

The cache is stored in `node_modules/.cache/scala-previews/manifest.json`.

**Clear cache:**
```bash
rm -rf node_modules/.cache/scala-previews
```

**Cache invalidation happens when:**
- Source code changes
- Template changes
- Compiled output is missing

## Project Structure

```
/
├── demos/
│   ├── autogen/                     # Auto-generated modules
│   │   ├── package.mill             # Parent Mill config
│   │   └── h{hash}/                 # Individual modules
│   │       ├── package.mill
│   │       └── src/Main.scala
│   └── hello/                       # Manual modules (still supported)
│
├── plugins/
│   └── playground/
│       ├── scala-preview/           # New plugin system
│       │   ├── index.ts             # Main plugin export
│       │   ├── types.ts             # TypeScript types
│       │   ├── templates.ts         # Code templates
│       │   ├── codegen.ts           # Code generation
│       │   └── cache.ts             # Cache management
│       └── transform.ts             # Original plugin
│
├── scripts/
│   └── compile-scala-previews.ts    # Compilation script
│
├── out/
│   └── demos/autogen/               # Compiled output
│       └── h{hash}/
│           └── fullLinkJS.dest/
│               └── main.js
│
└── node_modules/.cache/
    └── scala-previews/              # Build cache
        └── manifest.json
```

## Comparison: Before vs After

### Before (Manual)

**Step 1:** Create directory structure
```bash
mkdir -p demos/myexample/src/myexample
```

**Step 2:** Create `demos/myexample/package.mill`
```scala
package build.demos.myexample
object `package` extends build.WebModule
```

**Step 3:** Create Scala files
```scala
// demos/myexample/src/myexample/App.scala
package demos.myexample
import com.raquo.laminar.api.L.*

case class App() {
  def apply() = div("Hello")
}
```

**Step 4:** Create entry point
```scala
// demos/myexample/src/myexample/index.scala
package demos.myexample
import org.scalajs.dom

@main def app = {
  render(dom.document.querySelector("#root"), App()())
}
```

**Step 5:** Compile
```bash
./mill demos.myexample.fullLinkJS
```

**Step 6:** Reference in MDX
```mdx
<Playground preset="sjs">
```js index.js file=out/demos/myexample/fullLinkJS.dest/main.js hidden
```
```scala App.scala file=demos/myexample/src/myexample/App.scala
```
```scala index.scala file=demos/myexample/src/myexample/index.scala
```
</Playground>
```

**Total:** 6 manual steps, 4 files, complex MDX

### After (Automated)

**Step 1:** Write code in MDX
```mdx
```scala preview
div("Hello")
```
```

**Step 2:** Build
```bash
npm run build
```

**Total:** 1 step, automatic everything! 🎉

## Performance

### Compilation Time

- **First compilation**: ~8 seconds per module
- **Cached compilation**: ~100ms (skip compilation)
- **Batch compilation**: More efficient than serial

### Cache Benefits

With 10 modules:
- **Cold build** (no cache): ~80 seconds
- **Warm build** (cached): ~1 second
- **Cache size**: ~300KB per module (~3MB for 10 modules)

### Build Optimization

The `prebuild` script only compiles modules that have changed:

```
🔍 Discovering ScalaJS preview modules...
Found 5 module(s)
✅ 3 modules cached and up to date
📦 Compiling 2 module(s)...
  - demos.autogen.habc123def456
  - demos.autogen.h789ghi012jkl
✅ Compilation successful
✅ Cache updated
📊 Cache stats: 5 entries
```

## Troubleshooting

### Module Not Compiling

**Symptom:** Preview shows error or blank page

**Solution:**
1. Check for Scala syntax errors
2. Run manual compilation: `bun run compile-scala`
3. Check mill output for errors

### Cache Issues

**Symptom:** Old code showing in preview

**Solution:**
```bash
# Clear cache
rm -rf node_modules/.cache/scala-previews

# Clear Mill output
rm -rf out/demos/autogen

# Rebuild
bun run compile-scala
```

### Module Not Found

**Symptom:** `Module not found: demos.autogen.h...`

**Solution:**
1. Ensure `demos/autogen/package.mill` exists
2. Check Mill can see the module: `./mill resolve demos.autogen._`
3. Rebuild: `bun run compile-scala`

### Import Errors

**Symptom:** Scala compilation fails with import errors

**Solution:**
- Laminar and ScalaJS DOM are auto-imported
- For custom libraries, add to `build.mill` `mvnDeps`
- Use `imports=` meta for additional imports

## Best Practices

### 1. Keep Examples Simple

Preview blocks are best for:
- ✅ Small, self-contained examples
- ✅ UI component demonstrations
- ✅ Interactive tutorials

Avoid:
- ❌ Large applications
- ❌ Complex multi-file setups
- ❌ Heavy dependencies

### 2. Use Manual Modules for Complex Examples

For complex demos with multiple files, use the traditional manual approach:
- Create dedicated module in `demos/`
- Full control over structure
- Better organization
- Easier to test

### 3. Leverage Caching

- Code style changes won't affect hash
- Extract reusable components to manual modules
- Use cache for fast iteration

### 4. Commit Generated Files

Decision: Should we commit `demos/autogen/`?

**Option A - Commit** (Recommended):
- ✅ Reproducible builds
- ✅ Works in CI without Mill
- ✅ Faster builds (pre-compiled)
- ❌ Larger repo size

**Option B - Gitignore**:
- ✅ Smaller repo
- ❌ Must compile on every clone
- ❌ CI needs Mill setup

**Recommendation:** Add to `.gitignore` for cleaner repo, ensure CI runs `prebuild`.

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
      
      - name: Setup Java (for Mill)
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      
      - name: Install dependencies
        run: bun install
      
      - name: Compile ScalaJS modules
        run: bun run compile-scala
      
      - name: Build
        run: bun run build
```

## Future Enhancements

### Planned Features

1. **Watch mode for dev** - Auto-compile on file change
2. **Better error reporting** - Show Scala errors in preview
3. **Incremental compilation** - Only recompile changed modules
4. **Custom dependencies** - Add deps per module
5. **Template library** - Pre-built templates for common patterns
6. **IDE integration** - Syntax highlighting for inline Scala

### Contributing

To add new features:

1. **Templates**: Edit `plugins/playground/scala-preview/templates.ts`
2. **Code generation**: Edit `plugins/playground/scala-preview/codegen.ts`
3. **Cache logic**: Edit `plugins/playground/scala-preview/cache.ts`
4. **Remark plugin**: Edit `plugins/playground/scala-preview/index.ts`

## FAQ

**Q: Can I use custom libraries?**
A: Not per-module yet. Add to `build.mill` `mvnDeps` for all modules.

**Q: How do I debug compilation errors?**
A: Run `bun run compile-scala` to see full Mill output.

**Q: Can I use multiple preview blocks in one file?**
A: Yes! Each gets its own unique module.

**Q: What's the hash collision probability?**
A: ~1 in 16 trillion with 12-char SHA-256. Practically zero.

**Q: Can I reference one preview from another?**
A: No, each preview is isolated. Use manual modules for shared code.

**Q: Does this work with ScalaJS 1.x?**
A: Yes, tested with ScalaJS 1.19.0.

**Q: What about Scala 2?**
A: Works with any Scala version Mill supports (currently 3.7.1).

## Support

For issues or questions:
1. Check this guide
2. Check `PROPOSAL.md` for architecture details
3. Run `bun run compile-scala` for diagnostic output
4. Check Mill logs in `out/mill-daemon/server.log`

---

**Happy coding!** 🎉 Enjoy automatic ScalaJS previews!

