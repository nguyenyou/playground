import { createHash } from 'crypto'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { ScalaPreviewBlock, GeneratedModule } from './types'
import { applyTemplate } from './templates'

/**
 * Generate a hash from source code
 */
export const generateHash = (code: string): string => {
  return createHash('sha256').update(code).digest('hex').substring(0, 12)
}

/**
 * Generate Mill package file content
 */
const generateMillPackage = (hash: string): string => {
  return `package build.demos.autogen.h${hash}

object \`package\` extends build.WebModule
`
}

/**
 * Generate all files for a ScalaJS module
 */
export const generateModule = (
  block: ScalaPreviewBlock,
  workspaceRoot: string
): GeneratedModule => {
  const { hash, wrappedCode } = block
  
  // Paths
  const moduleName = `h${hash}`
  const modulePath = join(workspaceRoot, 'demos', 'autogen', moduleName)
  const srcPath = join(modulePath, 'src')
  const millPath = join(modulePath, 'package.mill')
  const scalaPath = join(srcPath, 'Main.scala')
  const outputPath = join(workspaceRoot, 'out', 'demos', 'autogen', moduleName, 'fullLinkJS.dest', 'main.js')
  
  // Create directories
  if (!existsSync(srcPath)) {
    mkdirSync(srcPath, { recursive: true })
  }
  
  // Write Mill package file
  writeFileSync(millPath, generateMillPackage(hash))
  
  // Write Scala source file
  writeFileSync(scalaPath, wrappedCode)
  
  return {
    hash,
    packageName: `demos.autogen.${moduleName}`,
    sourcePath: scalaPath,
    millPath,
    outputPath,
  }
}

/**
 * Process a code block into a ScalaPreviewBlock
 */
export const processCodeBlock = (
  code: string,
  meta?: {
    template?: 'basic' | 'component' | 'custom'
    imports?: string
    deps?: string
    'show-imports'?: boolean
  }
): ScalaPreviewBlock => {
  const hash = generateHash(code)
  const template = meta?.template || 'basic'
  
  // Parse custom imports
  const customImports = meta?.imports
    ? meta.imports.split(',').map(i => i.trim())
    : undefined
  
  // Parse custom dependencies
  const customDeps = meta?.deps
    ? meta.deps.split(',').map(d => d.trim())
    : undefined
  
  // Apply template
  const wrappedCode = applyTemplate(code, hash, template, customImports)
  
  return {
    hash,
    sourceCode: code,
    wrappedCode,
    template,
    customImports,
    customDeps,
    showImports: meta?.['show-imports'],
  }
}

/**
 * Generate Mill path for a module
 */
export const getMillModulePath = (hash: string): string => {
  return `demos.autogen.h${hash}`
}

/**
 * Get the compiled output path for a module
 */
export const getCompiledOutputPath = (hash: string, workspaceRoot: string): string => {
  return join(workspaceRoot, 'out', 'demos', 'autogen', `h${hash}`, 'fullLinkJS.dest', 'main.js')
}

/**
 * Get the relative path from workspace root for use in MDX
 */
export const getRelativeOutputPath = (hash: string): string => {
  return `out/demos/autogen/h${hash}/fullLinkJS.dest/main.js`
}

/**
 * Get the relative source path for use in MDX
 */
export const getRelativeSourcePath = (hash: string): string => {
  return `demos/autogen/h${hash}/src/Main.scala`
}

