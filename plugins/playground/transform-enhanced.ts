import type { Node } from 'unist'
import { basename, join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { ScalaJSCompiler } from './scalajs-compiler'

export interface JsxNodeElement extends Node {
  name: string
  attributes: Array<{ name: string; type: string; value: unknown }>
}

interface ProcessMetaResult {
  fileName: string | null
  hidden: boolean
  active: boolean
}

export interface FileData {
  code: string
  hidden: boolean
  active: boolean
  lang: string
}

export interface FilesObject {
  [path: string]: FileData
}

interface CodeNodeElement extends JsxNodeElement {
  meta?: string
  lang?: string
  value?: string
}

interface PlaygroundNode extends Node {
  name: string
  children: CodeNodeElement[]
  attributes: Array<{
    type: string
    name: string
    value: string
  }>
}

export const resolveCodeMeta = (codeNode: CodeNodeElement): CodeNodeMeta => {
  const joinedMeta = codeNode.lang + ' ' + (codeNode.meta || '')
  return joinedMeta
    .split(' ')
    .filter((meta) => meta.length)
    .reduce<CodeNodeMeta>((meta, expression) => {
      const [key, value] = expression.split('=')

      if (!value && isFilename(key)) {
        meta.name = key
      } else {
        // @ts-ignore
        meta[key] = value || true
      }
      return meta
    }, {} as CodeNodeMeta)
}

export interface CodeNodeMeta extends Omit<FileData, 'code'> {
  name?: string
  file?: string
  dir?: string
  preview?: boolean
  template?: string
}

const isFilename = (str: string): boolean => {
  return /[\w]+\.[\w]+/.test(str)
}

interface VFile {
  history: string[]
  cwd: string
}

// Singleton compiler instance
let scalaJSCompiler: ScalaJSCompiler | null = null

const getScalaJSCompiler = () => {
  if (!scalaJSCompiler) {
    scalaJSCompiler = new ScalaJSCompiler()
  }
  return scalaJSCompiler
}

export const transformCode = async (node: PlaygroundNode, file: VFile): Promise<void> => {
  const files: FilesObject = {}

  const visit = await import('unist-util-visit').then((module) => module.visit)

  // Handle inline ScalaJS preview blocks
  let hasScalaJSPreview = false
  const scalaJSBlocks: Array<{ code: string; template?: string }> = []

  visit(node, 'code', (codeNode: CodeNodeElement) => {
    const meta = resolveCodeMeta(codeNode)
    let code = codeNode.value

    // Check for ScalaJS preview
    if (codeNode.lang === 'scala' && meta.preview) {
      hasScalaJSPreview = true
      scalaJSBlocks.push({
        code: code || '',
        template: meta.template as string | undefined
      })
      return // Skip normal processing for preview blocks
    }

    // Normal file processing
    if (meta.file) {
      const filePath = join(file.cwd, meta.file)
      if (existsSync(filePath)) {
        code = readFileSync(filePath, 'utf8')
        meta.name ||= basename(filePath)
      }
    }

    files[`/${meta.name}`] = {
      code: code || '',
      hidden: meta.hidden,
      active: meta.active,
      lang: meta.lang || '',
    }
  })

  // If we have ScalaJS preview blocks, compile them
  if (hasScalaJSPreview) {
    const compiler = getScalaJSCompiler()
    
    for (let i = 0; i < scalaJSBlocks.length; i++) {
      const block = scalaJSBlocks[i]
      try {
        const compiledJS = await compiler.compile(block.code, {
          template: block.template ? undefined : undefined, // Use default template
        })

        // Add the source and compiled files
        files[`/App${i > 0 ? i + 1 : ''}.scala`] = {
          code: block.code,
          hidden: false,
          active: true,
          lang: 'scala'
        }

        files['/index.js'] = {
          code: compiledJS,
          hidden: true,
          active: false,
          lang: 'javascript'
        }

        // Add default styles if not present
        if (!files['/styles.css'] && !files['/index.css']) {
          files['/styles.css'] = {
            code: `html, body {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
}

#root {
  padding: 2rem;
}`,
            hidden: false,
            active: false,
            lang: 'css'
          }
        }
      } catch (error) {
        console.error('Failed to compile ScalaJS preview:', error)
        // Add error message as comment
        files['/error.js'] = {
          code: `// Compilation failed: ${error}`,
          hidden: false,
          active: true,
          lang: 'javascript'
        }
      }
    }
  }

  await appendProp(node, 'files', files)
}

const appendProp = async (
  node: JsxNodeElement,
  propName: string,
  propValue: unknown
): Promise<void> => {
  const valueToEstree = await import('estree-util-value-to-estree').then(
    (module) => module.valueToEstree
  )

  node.attributes.push({
    type: 'mdxJsxAttribute',
    name: propName,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: JSON.stringify(propValue),
      data: {
        estree: {
          type: 'Program',
          body: [
            {
              type: 'ExpressionStatement',
              expression: valueToEstree(propValue),
            },
          ],
          sourceType: 'module',
        },
      },
    },
  })
}

export const remarkPlaygroundEnhanced = () => {
  return async (tree: Node, file: VFile) => {
    const visit = await import('unist-util-visit').then((module) => module.visit)
    const promises: Array<() => Promise<void>> = []
    
    visit(tree, 'mdxJsxFlowElement', (node: Node) => {
      const playgroundNode = node as PlaygroundNode
      if (playgroundNode.name === 'Playground') {
        promises.push(async () => transformCode(playgroundNode, file))
      }
    })

    await Promise.all(promises.map((p) => p()))
  }
}
