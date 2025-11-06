# 🚀 Quick Start - Automated ScalaJS Preview

## TL;DR

Write ScalaJS code directly in MDX. Everything else is automatic.

## Example

**In your MDX file** (`posts/my-demo.mdx`):

```mdx
---
title: "My Demo"
---

# Counter Example

```scala preview
val count = Var(0)

div(
  display.flex,
  gap := "10px",
  button("-", onClick --> Observer(_ => count.update(_ - 1))),
  span(text <-- count.signal.map(_.toString)),
  button("+", onClick --> Observer(_ => count.update(_ + 1)))
)
```
```

**Build and run**:

```bash
npm run build
npm run dev
```

**That's it!** 🎉

## What Just Happened?

The system automatically:
1. ✅ Extracted your ScalaJS code
2. ✅ Generated a Mill module with proper package structure
3. ✅ Wrapped your code in a template (imports, main function)
4. ✅ Compiled it to JavaScript via Mill
5. ✅ Cached the result for fast rebuilds
6. ✅ Created a preview component
7. ✅ Rendered it in your page

## Commands

```bash
# Build (includes auto-compilation)
npm run build

# Manual compilation (useful during dev)
npm run compile-scala

# Development server
npm run dev

# Test the system
bun scripts/test-scala-preview.ts
```

## More Examples

Check out `posts/scala-preview-demo.mdx` for:
- Counter with state
- Hello world
- Styled components
- Multiple previews in one file

## Documentation

- **This file** - Quick start (you are here)
- `SCALA_PREVIEW_README.md` - User guide
- `SCALA_PREVIEW_GUIDE.md` - Complete documentation
- `PROPOSAL.md` - Architecture details
- `IMPLEMENTATION_SUMMARY.md` - What was built

## Advanced Usage

### Custom Template
```scala preview template=component
div("Wrapped in component")
```

### Custom Imports
```scala preview imports="import cats.effect.*"
div("With extra imports")
```

### Show Imports in Editor
```scala preview show-imports
div("Imports visible")
```

## Troubleshooting

### Preview not showing?
```bash
# Compile manually
npm run compile-scala

# Check for errors in output
```

### Want fresh build?
```bash
# Clear cache
rm -rf node_modules/.cache/scala-previews
rm -rf demos/autogen
rm -rf out/demos/autogen

# Rebuild
npm run build
```

---

**Ready to build something awesome?** 🚀

Start with: `posts/scala-preview-demo.mdx`

