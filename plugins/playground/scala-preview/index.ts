import type { Node } from 'unist'
import type { Code } from 'mdast'
import { ScalaPreviewBlock, ScalaPreviewMeta } from './types'
import { processCodeBlock, generateModule, getRelativeOutputPath, getRelativeSourcePath } from './codegen'
import { join } from 'path'

interface VFile {
  history: string[]
  cwd: string
  data?: {
    scalaPreviewBlocks?: ScalaPreviewBlock[]
  }
}

/**
 * Parse meta string into structured metadata
 */
const parseMeta = (meta: string | null | undefined): ScalaPreviewMeta => {
  if (!meta) return {}

  const result: ScalaPreviewMeta = {}
  const parts = meta.split(/\s+/)

  for (const part of parts) {
    if (part === 'preview') {
      continue
    }
    
    if (part === 'show-imports') {
      result['show-imports'] = true
      continue
    }

    const [key, value] = part.split('=')
    if (key && value) {
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '')
      
      if (key === 'template') {
        result.template = cleanValue as 'basic' | 'component' | 'custom'
      } else if (key === 'imports') {
        result.imports = cleanValue
      } else if (key === 'deps') {
        result.deps = cleanValue
      }
    }
  }

  return result
}

/**
 * Check if a code node is a Scala preview block
 */
const isScalaPreview = (node: Code): boolean => {
  return node.lang === 'scala' && node.meta?.includes('preview') || false
}

/**
 * Transform a Scala preview code block into a Playground component
 */
const transformToPlayground = async (node: any, block: ScalaPreviewBlock, file: VFile): Promise<void> => {
  const { hash, sourceCode, showImports } = block
  
  // Get paths
  const jsPath = getRelativeOutputPath(hash)
  const scalaPath = getRelativeSourcePath(hash)
  
  // Create JSX element for Playground
  const valueToEstree = await import('estree-util-value-to-estree').then(m => m.valueToEstree)
  
  // Build files object
  const files: Record<string, any> = {
    '/index.js': {
      code: '',
      hidden: true,
      active: false,
      lang: 'js',
    },
    '/Main.scala': {
      code: sourceCode,
      hidden: false,
      active: true,
      lang: 'scala',
    },
  }
  
  // Replace the code node with a Playground JSX element
  node.type = 'mdxJsxFlowElement'
  node.name = 'Playground'
  node.attributes = [
    {
      type: 'mdxJsxAttribute',
      name: 'preset',
      value: 'sjs',
    },
    {
      type: 'mdxJsxAttribute',
      name: 'files',
      value: {
        type: 'mdxJsxAttributeValueExpression',
        value: JSON.stringify(files),
        data: {
          estree: {
            type: 'Program',
            body: [
              {
                type: 'ExpressionStatement',
                expression: valueToEstree(files),
              },
            ],
            sourceType: 'module',
          },
        },
      },
    },
    {
      type: 'mdxJsxAttribute',
      name: 'head',
      value: {
        type: 'mdxJsxAttributeValueExpression',
        value: JSON.stringify([`<script type="module" src="/${jsPath}"></script>`]),
        data: {
          estree: {
            type: 'Program',
            body: [
              {
                type: 'ExpressionStatement',
                expression: valueToEstree([`<script type="module" src="/${jsPath}"></script>`]),
              },
            ],
            sourceType: 'module',
          },
        },
      },
    },
  ]
  node.children = []
  
  // Store metadata
  delete node.lang
  delete node.meta
  delete node.value
}

/**
 * Remark plugin to process Scala preview blocks
 */
export const remarkScalaPreview = () => {
  return async (tree: Node, file: VFile) => {
    const visit = await import('unist-util-visit').then(m => m.visit)
    const blocks: Array<{ node: any; block: ScalaPreviewBlock }> = []

    // First pass: collect all Scala preview blocks
    visit(tree, 'code', (node: any) => {
      if (isScalaPreview(node)) {
        const meta = parseMeta(node.meta)
        const block = processCodeBlock(node.value, meta)
        
        // Generate module files
        try {
          generateModule(block, file.cwd)
          blocks.push({ node, block })
        } catch (error) {
          console.error(`Failed to generate module for Scala preview:`, error)
        }
      }
    })

    // Store blocks in file data for use by compilation script
    if (!file.data) {
      file.data = {}
    }
    file.data.scalaPreviewBlocks = blocks.map(b => b.block)

    // Second pass: transform nodes to Playground components
    for (const { node, block } of blocks) {
      await transformToPlayground(node, block, file)
    }
  }
}

export * from './types'
export * from './codegen'
export * from './templates'
export * from './cache'

