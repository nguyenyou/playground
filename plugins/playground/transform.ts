import type { Node } from 'unist'
import { basename, dirname, join } from 'path'
import { existsSync, readFileSync, promises as fsPromises } from 'fs'
import { createHash } from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'

export interface JsxNodeElement extends Node {
  name: string
  attributes: Array<{ name: string; type: string; value: unknown }>
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
    value: unknown
  }>
}

const execFileAsync = promisify(execFile)

const DEFAULT_PREVIEW_PRESET = new Set(['sjs', 'sjs-tailwind', 'sjs-daisyui'])
const DEFAULT_LANG_EXT: Record<string, string> = {
  javascript: 'js',
  js: 'js',
  typescript: 'ts',
  ts: 'ts',
  scala: 'scala',
  css: 'css',
  html: 'html',
}

const scalaPreviewBuildCache = new Map<string, Promise<FilesObject>>()

export const resolveCodeMeta = (codeNode: CodeNodeElement): CodeNodeMeta => {
  const tokens = [codeNode.lang, ...(codeNode.meta ? codeNode.meta.split(' ') : [])].filter((value) => value?.length)

  const meta = tokens.reduce<CodeNodeMeta>((acc, expression, index) => {
    if (!expression) {
      return acc
    }

    if (index === 0 && expression === codeNode.lang) {
      acc.lang = codeNode.lang || ''
      return acc
    }

    const [key, rawValue] = expression.split('=')

    if (!rawValue && isFilename(key)) {
      acc.name = key
      return acc
    }

    const value = normalizeMetaValue(rawValue)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[key] = value
    return acc
  }, {} as CodeNodeMeta)

  meta.lang ||= codeNode.lang
  return meta
}

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
  const visit = await import('unist-util-visit').then((module) => module.visit)
  const preset = getPlaygroundAttribute(node, 'preset') ?? 'vanilla'

  let hasActiveFile = false
  let previewCount = 0
  const fileCounters: Record<string, number> = {}
  const processing: Array<Promise<void>> = []

  visit(node, 'code', (codeNode: CodeNodeElement) => {
    processing.push(
      (async () => {
        const meta = resolveCodeMeta(codeNode)
        const lang = meta.lang || ''
        const metaHidden = toBoolean(meta.hidden)
        let code = codeNode.value || ''

        const isScalaPreview = Boolean(meta.preview) && lang === 'scala' && DEFAULT_PREVIEW_PRESET.has(preset)

        if (meta.file) {
          const filePath = join(file.cwd, meta.file)
          if (existsSync(filePath)) {
            code = readFileSync(filePath, 'utf8')
            meta.name ||= basename(filePath)
          }
        }

        if (isScalaPreview) {
          previewCount += 1
          const snippetName = meta.name || generatePreviewFileName(previewCount)
          const active = resolveActiveFlag(meta.active, hasActiveFile)
          files[`/${snippetName}`] = {
            code,
            hidden: metaHidden ?? false,
            active,
            lang,
          }
          if (active) {
            hasActiveFile = true
          }

          try {
            const previewFiles = await buildScalaPreviewFiles({
              code,
              cwd: file.cwd,
            })

            for (const [key, value] of Object.entries(previewFiles)) {
              if (key === '/index.js' && files[key]) {
                continue
              }
              files[key] = value
              if (value.active) {
                hasActiveFile = true
              }
            }
          } catch (error) {
            const errorMessage = formatScalaPreviewError(error)
            const errorFileName = `/preview-error-${previewCount}.txt`
            const errorActive = !hasActiveFile
            files[errorFileName] = {
              code: errorMessage,
              hidden: false,
              active: errorActive,
              lang: 'text',
            }
            if (errorActive) {
              hasActiveFile = true
            }
          }
          return
        }

        const fileName = meta.name || generateDefaultFileName(lang, fileCounters)
        const active = resolveActiveFlag(meta.active, hasActiveFile)

        files[`/${fileName}`] = {
          code: code || '',
          hidden: metaHidden ?? false,
          active,
          lang,
        }

        if (active) {
          hasActiveFile = true
        }
      })()
    )
  })

  await Promise.all(processing)
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

const normalizeMetaValue = (value?: string): unknown => {
  if (value === undefined) {
    return true
  }
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return value
}

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    if (value === 'true') {
      return true
    }
    if (value === 'false') {
      return false
    }
  }
  return undefined
}

const resolveActiveFlag = (value: unknown, hasActive: boolean): boolean => {
  const boolValue = toBoolean(value)
  if (typeof boolValue === 'boolean') {
    return boolValue
  }
  return !hasActive
}

const generateDefaultFileName = (lang: string, counters: Record<string, number>): string => {
  const extension = DEFAULT_LANG_EXT[lang] || (lang || 'txt')
  counters[extension] = (counters[extension] ?? 0) + 1
  const index = counters[extension]
  if (index === 1) {
    return `file.${extension}`
  }
  return `file${index}.${extension}`
}

const generatePreviewFileName = (index: number): string => {
  if (index === 1) {
    return 'Preview.scala'
  }
  return `Preview${index}.scala`
}

const getPlaygroundAttribute = (node: PlaygroundNode, attributeName: string): string | undefined => {
  const attribute = node.attributes.find((attr) => attr.name === attributeName)
  if (!attribute) {
    return undefined
  }

  const value = attribute.value
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'value' in value && typeof value.value === 'string') {
    return value.value
  }

  return undefined
}

interface ScalaPreviewOptions {
  code: string
  cwd: string
}

const buildScalaPreviewFiles = async ({ code, cwd }: ScalaPreviewOptions): Promise<FilesObject> => {
  const normalizedCode = code.replace(/^\s*\n/, '').trimEnd()
  if (!normalizedCode) {
    throw new Error('Scala preview block is empty.')
  }

  const hash = createHash('sha256').update(normalizedCode).digest('hex')
  if (!scalaPreviewBuildCache.has(hash)) {
    scalaPreviewBuildCache.set(hash, buildScalaPreviewInternal({ code: normalizedCode, cwd, hash }))
  }

  return scalaPreviewBuildCache.get(hash) as Promise<FilesObject>
}

interface ScalaPreviewBuildInternalOptions extends ScalaPreviewOptions {
  hash: string
}

const buildScalaPreviewInternal = async ({ code, cwd, hash }: ScalaPreviewBuildInternalOptions): Promise<FilesObject> => {
  await ensureGeneratedRoot(cwd)

  const moduleName = `preview_${hash.slice(0, 12)}`
  const moduleDir = join(cwd, 'demos', 'generated', moduleName)
  const packageMillPath = join(moduleDir, 'package.mill')
  const sourceDir = join(moduleDir, 'src', 'generated', moduleName)
  const appPath = join(sourceDir, 'App.scala')
  const indexPath = join(sourceDir, 'index.scala')
  const jsOutputDir = join(cwd, 'out', 'demos', 'generated', moduleName, 'fastLinkJS.dest')
  const jsOutputPath = join(jsOutputDir, 'main.js')

  await writeFileIfChanged(packageMillPath, createPackageMillContent(moduleName))
  await writeFileIfChanged(appPath, createAppSource(moduleName, code))
  await writeFileIfChanged(indexPath, createIndexSource(moduleName))

  if (!existsSync(jsOutputPath)) {
    await runMill(cwd, ['-i', `demos.generated.${moduleName}.fastLinkJS`])
  }

  const jsCode = await fsPromises.readFile(jsOutputPath, 'utf8')

  const appSource = await fsPromises.readFile(appPath, 'utf8')
  const indexSource = await fsPromises.readFile(indexPath, 'utf8')

  const files: FilesObject = {
    [`/${moduleName}/App.scala`]: {
      code: appSource,
      hidden: true,
      active: false,
      lang: 'scala',
    },
    [`/${moduleName}/index.scala`]: {
      code: indexSource,
      hidden: true,
      active: false,
      lang: 'scala',
    },
  }

  if (!files['/index.js']) {
    files['/index.js'] = {
      code: jsCode,
      hidden: true,
      active: false,
      lang: 'javascript',
    }
  }

  return files
}

const writeFileIfChanged = async (filePath: string, contents: string): Promise<void> => {
  await fsPromises.mkdir(dirname(filePath), { recursive: true })
  if (existsSync(filePath)) {
    const current = await fsPromises.readFile(filePath, 'utf8')
    if (current === contents) {
      return
    }
  }
  await fsPromises.writeFile(filePath, contents, 'utf8')
}

const createPackageMillContent = (moduleName: string): string => {
  return [
    `package build.demos.generated.${moduleName}`,
    '',
    'object `package` extends build.WebModule',
    '',
  ].join('\n')
}

const indentSnippet = (snippet: string, indent = '    '): string => {
  return snippet
    .split('\n')
    .map((line) => (line.length ? `${indent}${line}` : indent.trimEnd()))
    .join('\n')
}

const createAppSource = (moduleName: string, snippet: string): string => {
  const indentedSnippet = indentSnippet(snippet)
  return `package demos.generated.${moduleName}\n\nimport com.raquo.laminar.api.L.*\nimport org.scalajs.dom\n\nobject App:\n  def apply() =\n${indentedSnippet}\n`
}

const createIndexSource = (moduleName: string): string => {
  return `package demos.generated.${moduleName}\n\nimport org.scalajs.dom\nimport com.raquo.laminar.api.L.*\n\n@main def main(): Unit =\n  val container = dom.document.querySelector("#root")\n  if container == null then\n    throw new RuntimeException("Root element '#root' not found")\n  render(container, App())\n`
}

const runMill = async (cwd: string, args: string[]): Promise<void> => {
  const executable = process.env.MILL_CMD || './mill'
  try {
    await execFileAsync(executable, args, {
      cwd,
      maxBuffer: 1024 * 1024 * 20,
      env: {
        ...process.env,
      },
    })
  } catch (error) {
    const err = error as { stderr?: string | Buffer; stdout?: string | Buffer; message: string }
    const stderr = err.stderr ? err.stderr.toString() : ''
    const stdout = err.stdout ? err.stdout.toString() : ''
    throw new Error(`Mill build failed: ${err.message}\n${stderr}${stdout}`)
  }
}

const formatScalaPreviewError = (error: unknown): string => {
  if (error instanceof Error) {
    return `Scala preview failed:\n${error.message}`
  }
  return `Scala preview failed.`
}

const ensureGeneratedRoot = async (cwd: string): Promise<void> => {
  const generatedRoot = join(cwd, 'demos', 'generated')
  const generatedRootPackage = join(generatedRoot, 'package.mill')

  if (existsSync(generatedRootPackage)) {
    return
  }

  await fsPromises.mkdir(generatedRoot, { recursive: true })
  await fsPromises.writeFile(generatedRootPackage, createGeneratedRootPackageMillContent(), 'utf8')
}

const createGeneratedRootPackageMillContent = (): string => {
  return [
    'package build.demos.generated',
    '',
    'object `package` extends mill.Module',
    '',
  ].join('\n')
}
