# Automated ScalaJS Preview System - Design Proposal

## Goal
Enable writing ScalaJS code directly in markdown with automatic compilation and preview:

```scala preview
div("hello world")
```

## Current Pain Points
1. Manual Mill package creation for each demo
2. Manual compilation step required
3. Manual linking of source files and compiled output in MDX
4. File path management complexity
5. No automatic code wrapping/templating

## Proposed Solution Architecture

### Phase 1: Enhanced Remark Plugin

Create `plugins/playground/scala-preview.ts` that:

1. **Detects inline ScalaJS code blocks** with `preview` meta:
   ```
   ```scala preview
   div("hello world")
   ```
   ```

2. **Generates unique module identifiers** from content hash:
   ```
   demos/auto-generated/{hash}/
   ```

3. **Wraps code in template**:
   ```scala
   package demos.autogen.{hash}
   import org.scalajs.dom
   import com.raquo.laminar.api.L.*
   
   @main def app = {
     val container = dom.document.querySelector("#root")
     render(container, {USER_CODE})
   }
   ```

4. **Generates Mill build file**:
   ```scala
   package build.demos.autogen.{hash}
   object `package` extends build.WebModule
   ```

5. **Triggers compilation** during build process
6. **Injects compiled output** into Playground component

### Phase 2: Build Integration

#### Option A: Pre-build Hook (Recommended)
```json
// package.json
{
  "scripts": {
    "prebuild": "bun run compile-scala-previews",
    "compile-scala-previews": "tsx scripts/compile-scala-previews.ts"
  }
}
```

**Flow:**
1. Scan all `.mdx` files for `scala preview` blocks
2. Extract code and generate Mill modules
3. Run `./mill demos.autogen._.fullLinkJS` (batch compile)
4. Continue with normal Next.js build

**Pros:**
- Clean separation of concerns
- Explicit build step
- Easy to debug
- Works with Next.js caching

**Cons:**
- Adds extra build step

#### Option B: Content Collections Transform
Integrate directly into `content-collections.ts` transform step.

**Pros:**
- Single build process
- Automatic dependency tracking

**Cons:**
- More complex integration
- Harder to debug
- May block parallel processing

### Phase 3: Template System

Create `templates/scala-preview/` with variants:

#### Basic Template
```scala
package demos.autogen.{hash}
import org.scalajs.dom
import com.raquo.laminar.api.L.*

@main def app = {
  val container = dom.document.querySelector("#root")
  render(container, {USER_CODE})
}
```

#### Component Template
```scala
package demos.autogen.{hash}
import org.scalajs.dom
import com.raquo.laminar.api.L.*

object App {
  def apply() = {
    {USER_CODE}
  }
}

@main def app = {
  val container = dom.document.querySelector("#root")
  render(container, App())
}
```

#### Custom Import Template
Allow specifying imports:
```scala preview imports="import cats.effect.*, import fs2.*"
div("hello world")
```

### Phase 4: Caching Strategy

To avoid recompiling unchanged code:

```typescript
// scripts/scala-preview-cache.ts
interface CacheEntry {
  hash: string
  sourceCode: string
  compiledPath: string
  timestamp: number
}

class ScalaPreviewCache {
  private cacheFile = 'node_modules/.cache/scala-previews/manifest.json'
  
  shouldCompile(code: string): boolean {
    const hash = this.hashCode(code)
    const cached = this.getCached(hash)
    
    if (!cached) return true
    
    const compiledExists = fs.existsSync(cached.compiledPath)
    return !compiledExists
  }
  
  // ... implementation
}
```

**Cache invalidation:**
- Content hash change
- Template change
- Mill version change
- Dependency version change

## Implementation Plan

### Step 1: Create Core Infrastructure
```
plugins/
  playground/
    scala-preview/
      index.ts              # Main plugin
      template.ts           # Template system
      codegen.ts            # Mill file generation
      cache.ts              # Cache management
      types.ts              # TypeScript types
```

### Step 2: Implement Remark Plugin
```typescript
export const remarkScalaPreview = () => {
  return async (tree: Node, file: VFile) => {
    const visit = await import('unist-util-visit')
    const scalaBlocks: ScalaPreviewBlock[] = []
    
    visit(tree, 'code', (node: CodeNode) => {
      if (node.lang === 'scala' && node.meta?.includes('preview')) {
        scalaBlocks.push(extractScalaBlock(node))
      }
    })
    
    // Generate modules and compile
    await processScalaBlocks(scalaBlocks, file)
    
    // Transform nodes to Playground components
    transformToPlayground(tree, scalaBlocks)
  }
}
```

### Step 3: Create Compilation Script
```typescript
// scripts/compile-scala-previews.ts
import { glob } from 'glob'
import { readFile } from 'fs/promises'
import { extractScalaPreviewBlocks } from '../plugins/playground/scala-preview'

async function main() {
  const mdxFiles = await glob('posts/**/*.mdx')
  const allBlocks: ScalaBlock[] = []
  
  for (const file of mdxFiles) {
    const content = await readFile(file, 'utf-8')
    const blocks = extractScalaPreviewBlocks(content)
    allBlocks.push(...blocks)
  }
  
  // Generate Mill modules
  for (const block of allBlocks) {
    await generateMillModule(block)
  }
  
  // Compile all at once
  const modules = allBlocks.map(b => `demos.autogen.${b.hash}`)
  await runMill(`${modules.join('.fullLinkJS ')}`)
}
```

### Step 4: Integrate with Content Collections
```typescript
// content-collections.ts
import { remarkPlayground } from './plugins/playground'
import { remarkScalaPreview } from './plugins/playground/scala-preview'

const posts = defineCollection({
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [
        remarkScalaPreview,  // Process BEFORE remarkPlayground
        remarkPlayground,
      ],
    })
    return { ...document, mdx }
  },
})
```

## Advanced Features

### 1. Template Selection
```scala preview template="component"
div("hello")
```

### 2. Custom Imports
```scala preview imports="import cats.effect.*, import io.circe.*"
div("hello")
```

### 3. Dependencies
```scala preview deps="io.circe::circe-core::0.14.1"
div("hello")
```

### 4. Hidden Boilerplate
```scala preview show-imports
import org.scalajs.dom
import com.raquo.laminar.api.L.*

div("hello")  // Only this is shown in editor
```

### 5. Live Compilation (Future)
Watch mode that recompiles on code change:
```bash
npm run dev:watch-scala
```

## File Structure After Implementation

```
/Users/tunguyen/.cursor/worktrees/playground/HPMQl/
├── demos/
│   ├── autogen/                    # Auto-generated modules
│   │   ├── {hash1}/
│   │   │   ├── package.mill
│   │   │   └── src/
│   │   │       └── Main.scala
│   │   └── {hash2}/
│   │       ├── package.mill
│   │       └── src/
│   │           └── Main.scala
│   └── hello/                      # Manual demos (still supported)
├── out/
│   └── demos/
│       └── autogen/
│           └── {hash}/
│               └── fullLinkJS.dest/
│                   └── main.js
├── plugins/
│   └── playground/
│       ├── scala-preview/
│       │   ├── index.ts
│       │   ├── template.ts
│       │   ├── codegen.ts
│       │   └── cache.ts
│       └── transform.ts
├── scripts/
│   └── compile-scala-previews.ts
└── templates/
    └── scala-preview/
        ├── basic.scala.template
        ├── component.scala.template
        └── custom.scala.template
```

## Benefits

1. ✅ **Zero boilerplate** - Write ScalaJS code directly in markdown
2. ✅ **Automatic compilation** - No manual Mill commands
3. ✅ **Smart caching** - Only recompile changed code
4. ✅ **Template system** - Consistent code wrapping
5. ✅ **Type safety** - Full ScalaJS type checking
6. ✅ **Fast iteration** - Quick feedback loop
7. ✅ **Clean MDX** - No file path management
8. ✅ **Backward compatible** - Existing manual demos still work

## Migration Path

### Phase 1: Implement core system (Week 1-2)
- Basic remark plugin
- Template system
- Compilation script

### Phase 2: Add caching (Week 3)
- Cache implementation
- Incremental compilation

### Phase 3: Advanced features (Week 4)
- Custom templates
- Custom imports
- Dependencies

### Phase 4: Developer experience (Week 5)
- Watch mode
- Better error messages
- IDE integration

## Example Usage

### Before (Current)
```mdx
<Playground preset="sjs">

```css styles.css
body { margin: 0; }
```

```js index.js file=out/demos/hello/fullLinkJS.dest/main.js hidden
```

```scala App.scala file=demos/hello/src/hello/App.scala
```

```scala index.scala file=demos/hello/src/hello/index.scala
```

```html index.html hidden
```

</Playground>
```

Manual steps:
1. Create `demos/hello/package.mill`
2. Create source files
3. Run `./mill demos.hello.fullLinkJS`
4. Reference in MDX

### After (Proposed)
```mdx
```scala preview
import org.scalajs.dom
import com.raquo.laminar.api.L.*

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

Or even simpler with default imports:
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

The system automatically:
1. ✅ Generates Mill module
2. ✅ Wraps in proper template
3. ✅ Compiles during build
4. ✅ Injects into Playground

## Technical Considerations

### Build Time
- First build: ~8s per module (as seen in current system)
- Cached builds: ~100ms (skip compilation)
- Batch compilation: More efficient than serial

### Cache Size
- Compiled JS per module: ~300KB
- Source code per module: ~5KB
- Total cache for 100 modules: ~30MB (acceptable)

### Error Handling
- Scala compilation errors should be captured and displayed
- Fallback to showing source code if compilation fails
- Clear error messages in development

### Developer Experience
- Fast feedback loop (with caching)
- Clear error messages
- Optional watch mode for live recompilation
- VS Code integration for syntax highlighting in markdown

## Security Considerations
- Auto-generated modules are deterministic (hash-based)
- No arbitrary code execution beyond ScalaJS sandbox
- Same security model as current system
- Compiled output is static and vetted by Scala compiler

## Conclusion

This system will:
1. Eliminate manual Mill package management
2. Reduce MDX boilerplate by ~80%
3. Enable faster iteration on examples
4. Maintain type safety and performance
5. Support both inline and file-based workflows

The implementation is straightforward and builds on existing infrastructure. It's backward compatible and can be rolled out incrementally.

