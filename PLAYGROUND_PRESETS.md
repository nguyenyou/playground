# Playground Presets System

The playground system has been refactored to use a **preset-based architecture** that provides more flexibility and better organization. You can now use predefined presets or create completely custom configurations.

## Available Presets

### `vanilla`
- **Description**: Pure HTML, CSS, and JavaScript
- **Features**: Basic setup with CSS reset
- **Use Case**: Simple web development without frameworks

### `tailwind`
- **Description**: HTML, CSS, JavaScript with Tailwind CSS
- **Features**: Includes Tailwind CSS CDN, CSS reset
- **Use Case**: Rapid UI development with utility classes

### `react`
- **Description**: React with JSX/TSX support and Tailwind CSS
- **Features**: React, Tailwind CSS, JSX/TSX compilation, root div, CSS reset
- **Use Case**: Full React development with styling framework

### `react-minimal`
- **Description**: React with JSX/TSX support, no additional styling
- **Features**: React, JSX/TSX compilation, root div, CSS reset (no Tailwind)
- **Use Case**: React development with custom CSS

### `vanilla-no-reset`
- **Description**: Pure HTML, CSS, and JavaScript without CSS reset
- **Features**: Preserves default browser styles
- **Use Case**: When you want default browser styling behavior

## Usage Examples

### Using Presets in MDX

```mdx
<!-- Use a predefined preset -->
<Playground preset="react">
```js index.js active
import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => <h1>Hello React!</h1>;
createRoot(document.getElementById('root')).render(<App />);
```
</Playground>

<!-- Using Tailwind preset -->
<Playground preset="tailwind">
```html index.html active
<div class="bg-blue-500 text-white p-4">Tailwind CSS</div>
```
</Playground>
```

### Programmatic Usage

```typescript
import { createPlaygroundBuilder, buildPlaygroundContent } from './playground-utils';

// Using presets
const builder = createPlaygroundBuilder('react');
const srcDoc = await builder.build(files);

// Using custom configuration
const customBuilder = createPlaygroundBuilder({
  supportReact: true,
  supportTailwind: false,
  includeResetCSS: true,
  includeRootDiv: true,
  additionalHead: '<meta name="theme-color" content="#000000">'
});

// Fluent API for modifications
const modifiedBuilder = createPlaygroundBuilder('vanilla')
  .withTailwind(true)
  .withAdditionalHead('<link rel="icon" href="/favicon.ico">');

// Utility function
const srcDoc = await buildPlaygroundContent(files, 'react');
```

## Builder Methods

### Core Methods

- `build(files)` - Build the HTML content for the iframe

### Fluent Configuration Methods

- `withConfig(overrides)` - Override specific configuration options
- `withTailwind(enabled)` - Enable/disable Tailwind CSS
- `withReact(enabled)` - Enable/disable React (also sets root div)
- `withResetCSS(enabled)` - Enable/disable CSS reset
- `withRootDiv(enabled)` - Enable/disable root div creation
- `withAdditionalHead(html)` - Add custom HTML to the head section

## Configuration Options

```typescript
interface PlaygroundConfig {
  supportTailwind?: boolean;    // Include Tailwind CSS CDN
  supportReact?: boolean;       // Enable React and JSX/TSX compilation
  includeResetCSS?: boolean;    // Include basic CSS reset
  includeRootDiv?: boolean;     // Add <div id="root"></div> to body
  additionalHead?: string;      // Custom HTML for <head> section
}
```

## Using the System

Choose the approach that fits your needs:

```typescript
// Use a preset
<Playground preset="react">

// Use custom configuration
<Playground config={{ supportReact: true, supportTailwind: false }}>

// Programmatic usage
const builder = createPlaygroundBuilder('react');
const srcDoc = await builder.build(files);
```

## Advanced Examples

### Custom Configuration with Overrides

```typescript
// Start with React preset but disable Tailwind
const builder = createPlaygroundBuilder('react')
  .withTailwind(false)
  .withAdditionalHead(`
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
  `);
```

### Creating Custom Configurations (No Presets)

You can completely bypass presets and define exactly what you need:

```typescript
// React with Bootstrap instead of Tailwind
const reactBootstrap: PlaygroundConfig = {
  supportReact: true,
  supportTailwind: false,
  includeResetCSS: true,
  includeRootDiv: true,
  additionalHead: `
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  `
};

// Vanilla with Alpine.js and Tailwind
const alpineConfig: PlaygroundConfig = {
  supportTailwind: true,
  supportReact: false,
  includeResetCSS: true,
  includeRootDiv: false,
  additionalHead: `
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  `
};

// Complete custom setup
const fullyCustom: PlaygroundConfig = {
  supportTailwind: false,
  supportReact: false,
  includeResetCSS: false,
  includeRootDiv: false,
  additionalHead: `
    <meta name="author" content="Your Name">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/three@0.150.0/build/three.min.js"></script>
  `
};

// Use any of these configurations
const builder = createPlaygroundBuilder(reactBootstrap);
```

### MDX Usage with Custom Configs

```mdx
<!-- React with Bootstrap -->
<Playground config={{ 
  supportReact: true, 
  supportTailwind: false, 
  includeResetCSS: true, 
  includeRootDiv: true, 
  additionalHead: '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' 
}}>

<!-- Alpine.js with Tailwind -->
<Playground config={{ 
  supportTailwind: true, 
  supportReact: false, 
  additionalHead: '<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>' 
}}>

<!-- Completely custom -->
<Playground config={{ 
  supportTailwind: false, 
  supportReact: false, 
  includeResetCSS: false, 
  additionalHead: '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">' 
}}>
```

## Benefits of the New System

1. **Flexibility**: Mix and match features as needed
2. **Extensibility**: Easy to add new presets or customize existing ones
3. **Maintainability**: Single builder class instead of multiple separate builders
4. **Type Safety**: Full TypeScript support with proper types
5. **Clean Architecture**: No legacy code or confusing options
6. **Fluent API**: Chain methods for readable configuration

The preset system makes it easy to get started quickly while providing the flexibility to customize exactly what you need for your playground environment. 