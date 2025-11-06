export interface ScalaPreviewBlock {
  /** Unique hash identifier for this block */
  hash: string
  /** Original source code from markdown */
  sourceCode: string
  /** Wrapped/templated code ready for compilation */
  wrappedCode: string
  /** Template type to use */
  template: ScalaTemplateType
  /** Custom imports to add */
  customImports?: string[]
  /** Custom dependencies */
  customDeps?: string[]
  /** Line number in original file */
  line?: number
  /** Source file path */
  sourceFile?: string
  /** Whether to show imports in the editor */
  showImports?: boolean
}

export type ScalaTemplateType = 'basic' | 'component' | 'custom'

export interface ScalaPreviewMeta {
  template?: ScalaTemplateType
  imports?: string
  deps?: string
  'show-imports'?: boolean
}

export interface GeneratedModule {
  hash: string
  packageName: string
  sourcePath: string
  millPath: string
  outputPath: string
}

export interface CacheEntry {
  hash: string
  sourceCode: string
  compiledPath: string
  timestamp: number
  millVersion?: string
}

export interface CacheManifest {
  version: string
  entries: Record<string, CacheEntry>
}

