import type { Node } from 'unist'
import { basename, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { compileScalaJS } from './scala-compiler';

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
  /**
   * First attribute is treated as `lang` by visitor
   */
  const joinedMeta = codeNode.lang + ' ' + (codeNode.meta || '');
  const meta: CodeNodeMeta = joinedMeta
    .split(' ')
    .filter((meta) => meta.length)
    .reduce<CodeNodeMeta>((meta, expression) => {
      const [key, value] = expression.split('=');

      // Check for preview keyword
      if (key === 'preview') {
        meta.preview = true;
        return meta;
      }

      // Check for template specification
      if (key === 'template') {
        meta.template = value;
        return meta;
      }

      // TODO improve filename checking
      if (!value && isFilename(key)) {
        meta.name = key;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        meta[key] = value || true;
      }
      return meta;
    }, {} as CodeNodeMeta);

  // Check if lang is scala and meta contains preview (also check if lang is "scala preview" or similar)
  if (codeNode.lang === 'scala' && (meta.preview || joinedMeta.includes('preview'))) {
    meta.preview = true;
  }

  return meta;
};

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
export const transformCode = async (node: PlaygroundNode, file: VFile): Promise<void> => {
  const files: FilesObject = {}

  const visit = await import('unist-util-visit').then((module) => module.visit);

  let previewIndex = 0;
  const codeNodes: Array<{ node: CodeNodeElement; meta: CodeNodeMeta }> = [];

  // First pass: collect all code nodes
  visit(node, 'code', (codeNode: CodeNodeElement) => {
    const meta = resolveCodeMeta(codeNode);
    codeNodes.push({ node: codeNode, meta });
  });

  // Process each code node
  for (const { node: codeNode, meta } of codeNodes) {
    let code = codeNode.value;

    // Handle file references
    if (meta.file) {
      const filePath = join(file.cwd, meta.file);
      if (existsSync(filePath)) {
        code = readFileSync(filePath, 'utf8');
        meta.name ||= basename(filePath);
      }
    }

    // Handle scala preview blocks
    if (meta.preview && codeNode.lang === 'scala' && code) {
      try {
        // Compile ScalaJS code
        const result = await compileScalaJS(code, {
          cwd: file.cwd,
          position: previewIndex++,
          template: meta.template,
          config: {
            cache: true,
          },
        });

        // Add compiled JS to files
        files['/index.js'] = {
          code: result.compiledJsCode,
          hidden: meta.hidden || false,
          active: meta.active !== false,
          lang: 'javascript',
        };

        // Optionally add Scala source for display
        if (!meta.hidden) {
          const scalaFileName = meta.name || 'App.scala';
          files[`/${scalaFileName}`] = {
            code: code,
            hidden: false,
            active: true,
            lang: 'scala',
          };
        }
      } catch (error) {
        // On compilation error, still add the Scala code but mark it
        console.error(`ScalaJS compilation error:`, error);
        const scalaFileName = meta.name || 'App.scala';
        files[`/${scalaFileName}`] = {
          code: code,
          hidden: false,
          active: true,
          lang: 'scala',
        };
        // Add error message as comment in JS
        files['/index.js'] = {
          code: `// Compilation error: ${error instanceof Error ? error.message : String(error)}`,
          hidden: false,
          active: false,
          lang: 'javascript',
        };
      }
    } else {
      // Regular file handling
      const index = codeNodes.findIndex(item => item.node === codeNode);
      const fileName = meta.name || `file-${index}`;
      files[`/${fileName}`] = {
        code: code || '',
        hidden: meta.hidden || false,
        active: meta.active !== false,
        lang: meta.lang || codeNode.lang || '',
      }
    }
  }

  await appendProp(node, 'files', files)
}

const appendProp = async (node: JsxNodeElement, propName: string, propValue: unknown): Promise<void> => {
  const valueToEstree = await import('estree-util-value-to-estree').then((module) => module.valueToEstree);

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
  });
};

export const remarkPlayground = () => {
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
