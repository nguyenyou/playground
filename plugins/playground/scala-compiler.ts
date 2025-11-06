import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'
import { wrapCode } from './scala-template'

/**
 * Configuration for ScalaJS compilation
 */
export interface ScalaCompileConfig {
  /**
   * Base directory for generated demos
   * Default: demos/inline
   */
  baseDir?: string

  /**
   * Mill build file path
   * Default: build.mill
   */
  buildFile?: string

  /**
   * Output directory for compiled JS
   * Default: out/demos/inline/[demoId]/fullLinkJS.dest
   */
  outputDir?: string

  /**
   * Whether to cache compiled output
   */
  cache?: boolean
}

/**
 * Generate a unique demo ID based on content hash
 */
function generateDemoId(code: string, position: number): string {
  // Simple hash function
  const hash = code
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
    .toString(36)
  return `demo-${Math.abs(hash)}-${position}`
}

/**
 * Generate mill package.mill file content
 */
function generatePackageMill(demoId: string): string {
  return `package build.demos.inline.${demoId}

object \`package\` extends build.WebModule`
}

/**
 * Ensure parent package.mill exists for inline demos
 */
function ensureParentPackageMill(cwd: string): void {
  const inlineDir = join(cwd, 'demos', 'inline')
  const parentPackageMill = join(inlineDir, 'package.mill')

  if (!existsSync(parentPackageMill)) {
    mkdirSync(inlineDir, { recursive: true })
    const parentContent = `package build.demos.inline

object \`package\` extends build.WebModule`
    writeFileSync(parentPackageMill, parentContent, 'utf8')
  }
}

/**
 * Generate directory structure for a demo
 */
function createDemoStructure(
  cwd: string,
  demoId: string,
  code: string,
  template?: string
): {
  packagePath: string
  scalaPath: string
  scalaCode: string
} {
  const baseDir = join(cwd, 'demos', 'inline', demoId)
  const srcDir = join(baseDir, 'src', 'demos', 'inline', demoId)
  const packagePath = join(baseDir, 'package.mill')
  const scalaPath = join(srcDir, 'index.scala')

  // Create directories
  mkdirSync(srcDir, { recursive: true })

  // Wrap code in template
  const scalaCode = wrapCode(code, template)

  // Write package.mill
  writeFileSync(packagePath, generatePackageMill(demoId), 'utf8')

  // Write Scala file
  writeFileSync(scalaPath, scalaCode, 'utf8')

  return {
    packagePath,
    scalaPath,
    scalaCode,
  }
}

/**
 * Compile ScalaJS code using mill
 */
export async function compileScalaJS(
  code: string,
  options: {
    cwd: string
    demoId?: string
    position?: number
    template?: string
    config?: ScalaCompileConfig
  }
): Promise<{
  demoId: string
  compiledJsPath: string
  compiledJsCode: string
}> {
  const { cwd, demoId: providedDemoId, position = 0, template, config = {} } = options

  // Generate demo ID
  const demoId = providedDemoId || generateDemoId(code, position)

  // Setup paths
  const baseDir = join(cwd, 'demos', 'inline', demoId)
  const compiledJsPath = join(
    cwd,
    'out',
    'demos',
    'inline',
    demoId,
    'fullLinkJS.dest',
    'main.js'
  )

  // Check cache if enabled
  if (config.cache !== false && existsSync(compiledJsPath)) {
    const cachedCode = readFileSync(compiledJsPath, 'utf8')
    return {
      demoId,
      compiledJsPath,
      compiledJsCode: cachedCode,
    }
  }

  // Ensure parent package.mill exists
  ensureParentPackageMill(cwd)

  // Create demo structure
  createDemoStructure(cwd, demoId, code, template)

  // Compile using mill
  const millTarget = `build.demos.inline.${demoId}.package.fullLinkJS`
  const buildFile = config.buildFile || join(cwd, 'build.mill')

  try {
    // Run mill compilation
    // Try ./mill first, fallback to mill command
    const millCmd = existsSync(join(cwd, 'mill')) ? './mill' : 'mill'
    execSync(`${millCmd} ${millTarget}`, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8',
    })

    // Read compiled JS
    if (!existsSync(compiledJsPath)) {
      throw new Error(`Compilation failed: ${compiledJsPath} not found`)
    }

    const compiledJsCode = readFileSync(compiledJsPath, 'utf8')

    return {
      demoId,
      compiledJsPath,
      compiledJsCode,
    }
  } catch (error) {
    // Clean up on error
    throw new Error(
      `ScalaJS compilation failed for ${demoId}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Get compiled JS path for a demo ID
 */
export function getCompiledJsPath(cwd: string, demoId: string): string {
  return join(cwd, 'out', 'demos', 'inline', demoId, 'fullLinkJS.dest', 'main.js')
}

