import type { Node } from 'unist'
import { ScalaJSCompiler, ScalaJSTemplate } from './scalajs-compiler'
import { FilesObject, FileData } from './transform'

interface ScalaJSCodeBlock extends Node {
  lang?: string
  meta?: string
  value?: string
}

interface ScalaJSPlaygroundOptions {
  compiler?: ScalaJSCompiler
  defaultTemplate?: 'laminar' | 'dom' | 'custom'
  customTemplates?: Record<string, ScalaJSTemplate>
  autoImports?: boolean
}

// Enhanced templates with common patterns
const ENHANCED_TEMPLATES: Record<string, ScalaJSTemplate> = {
  laminar: {
    imports: [
      'import org.scalajs.dom',
      'import com.raquo.laminar.api.L.*',
    ],
    wrapper: {
      before: '@main def app = {\n  val container = dom.document.querySelector("#root")\n  val appElement = ',
      after: '\n  render(container, appElement)\n}',
    },
    dependencies: [
      'org.scala-js::scalajs-dom::2.8.0',
      'com.raquo::laminar::17.2.1',
    ],
  },
  'laminar-component': {
    imports: [
      'import org.scalajs.dom',
      'import com.raquo.laminar.api.L.*',
    ],
    wrapper: {
      before: 'object App {\n  def apply() = ',
      after: '\n}\n\n@main def app = {\n  val container = dom.document.querySelector("#root")\n  render(container, App())\n}',
    },
    dependencies: [
      'org.scala-js::scalajs-dom::2.8.0',
      'com.raquo::laminar::17.2.1',
    ],
  },
  'laminar-tailwind': {
    imports: [
      'import org.scalajs.dom',
      'import com.raquo.laminar.api.L.*',
    ],
    wrapper: {
      before: '@main def app = {\n  val container = dom.document.querySelector("#root")\n  val appElement = ',
      after: '\n  render(container, appElement)\n}',
    },
    dependencies: [
      'org.scala-js::scalajs-dom::2.8.0',
      'com.raquo::laminar::17.2.1',
    ],
  },
  dom: {
    imports: [
      'import org.scalajs.dom',
      'import org.scalajs.dom.document',
      'import org.scalajs.dom.window',
    ],
    wrapper: {
      before: '@main def app = {\n  ',
      after: '\n}',
    },
    dependencies: [
      'org.scala-js::scalajs-dom::2.8.0',
    ],
  },
}

// Parse meta string to extract options
function parseScalaMeta(meta: string = ''): { 
  preview: boolean, 
  template?: string, 
  preset?: string,
  title?: string,
  hidden?: boolean 
} {
  const parts = meta.split(' ').filter(Boolean)
  const result: any = { preview: false }

  for (const part of parts) {
    if (part === 'preview') {
      result.preview = true
    } else if (part.startsWith('template=')) {
      result.template = part.substring('template='.length)
    } else if (part.startsWith('preset=')) {
      result.preset = part.substring('preset='.length)
    } else if (part.startsWith('title=')) {
      result.title = part.substring('title='.length)
    } else if (part === 'hidden') {
      result.hidden = true
    }
  }

  return result
}

export function remarkScalaJSPlayground(options: ScalaJSPlaygroundOptions = {}) {
  const compiler = options.compiler || new ScalaJSCompiler()
  const customTemplates = { ...ENHANCED_TEMPLATES, ...(options.customTemplates || {}) }

  return async function transformer(tree: Node, file: any) {
    const visit = await import('unist-util-visit').then(module => module.visit)
    const mdxFromMarkdown = await import('mdast-util-mdx').then(module => module.mdxFromMarkdown)
    const fromMarkdown = await import('mdast-util-from-markdown').then(module => module.fromMarkdown)
    
    const promises: Array<() => Promise<void>> = []

    visit(tree, 'code', (node: ScalaJSCodeBlock, index: number, parent: Node & { children: Node[] }) => {
      if (!node.lang?.startsWith('scala') || !node.meta) return
      
      const meta = parseScalaMeta(node.meta)
      if (!meta.preview) return

      promises.push(async () => {
        try {
          // Determine template
          const templateName = meta.template || options.defaultTemplate || 'laminar'
          const template = customTemplates[templateName]
          
          if (!template) {
            throw new Error(`Unknown template: ${templateName}`)
          }

          // Compile the ScalaJS code
          const compiledJS = await compiler.compile(node.value || '', {
            template,
            id: meta.title
          })

          // Determine playground preset based on template
          let playgroundPreset = meta.preset || 'sjs'
          if (templateName === 'laminar-tailwind') {
            playgroundPreset = 'sjs-tailwind'
          }

          // Create the files object for the playground
          const files: FilesObject = {
            '/App.scala': {
              code: node.value || '',
              hidden: false,
              active: true,
              lang: 'scala'
            },
            '/index.js': {
              code: compiledJS,
              hidden: true,
              active: false,
              lang: 'javascript'
            }
          }

          // Add default styles if not using Tailwind
          if (!templateName.includes('tailwind')) {
            files['/styles.css'] = {
              code: `html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
}

#root {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}`,
              hidden: meta.hidden || false,
              active: false,
              lang: 'css'
            }
          }

          // Create the Playground component JSX
          const playgroundJsx = `
<Playground preset="${playgroundPreset}">
${Object.entries(files).map(([path, file]) => {
  const fileName = path.substring(1) // Remove leading slash
  const hidden = file.hidden ? ' hidden' : ''
  const active = file.active ? ' active' : ''
  return `
\`\`\`${file.lang} ${fileName}${hidden}${active}
${file.code}
\`\`\``
}).join('\n')}
</Playground>`

          // Parse the JSX and replace the code node
          const mdxTree = fromMarkdown(playgroundJsx, {
            extensions: [],
            mdastExtensions: [mdxFromMarkdown()]
          })

          if (parent && parent.children && mdxTree.children[0]) {
            parent.children[index] = mdxTree.children[0]
          }
        } catch (error) {
          console.error('Failed to compile ScalaJS:', error)
          // Keep the original code block on error
        }
      })
    })

    await Promise.all(promises.map(p => p()))
  }
}

// Export convenience function to create a configured plugin
export function createScalaJSPlaygroundPlugin(options?: ScalaJSPlaygroundOptions) {
  return remarkScalaJSPlayground(options)
}
