import type { Node } from 'unist'
import { basename, join } from 'path';
import { existsSync, readFileSync } from 'fs';

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
  return joinedMeta
    .split(' ')
    .filter((meta) => meta.length)
    .reduce<CodeNodeMeta>((meta, expression) => {
      const [key, value] = expression.split('=');

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
};

export interface CodeNodeMeta extends Omit<FileData, 'code'> {
  name?: string
  file?: string
  dir?: string
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

  visit(node, 'code', (codeNode: CodeNodeElement) => {
    const meta = resolveCodeMeta(codeNode);
    let code = codeNode.value;

    if (meta.dir) {
      console.log(meta.dir, 'dir')
    } else if (meta.file) {
      console.log(meta.file, 'file')
      const filePath = join(file.cwd, meta.file);
      if (existsSync(filePath)) {
        code = readFileSync(filePath, 'utf8');

        meta.name ||= basename(filePath);
      }
    }

    files[`/${meta.name}`] = {
      code: code || '',
      hidden: meta.hidden,
      active: meta.active,
      lang: meta.lang || '',
    }
  })

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
