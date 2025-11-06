#!/usr/bin/env node

/**
 * Compile ScalaJS preview modules
 * 
 * This script:
 * 1. Scans all auto-generated modules
 * 2. Checks cache to see what needs recompilation
 * 3. Batch compiles all modules that need compilation
 * 4. Updates cache
 */

import { readdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { ScalaPreviewCache } from '../plugins/playground/scala-preview/cache'
import { getCompiledOutputPath, getMillModulePath } from '../plugins/playground/scala-preview/codegen'

const WORKSPACE_ROOT = join(__dirname, '..')
const AUTOGEN_DIR = join(WORKSPACE_ROOT, 'demos', 'autogen')

interface ModuleInfo {
  hash: string
  modulePath: string
  sourcePath: string
  outputPath: string
  needsCompilation: boolean
}

/**
 * Discover all auto-generated modules
 */
function discoverModules(): ModuleInfo[] {
  if (!existsSync(AUTOGEN_DIR)) {
    console.log('No auto-generated modules found')
    return []
  }

  const modules: ModuleInfo[] = []
  const dirs = readdirSync(AUTOGEN_DIR, { withFileTypes: true })

  for (const dir of dirs) {
    if (dir.isDirectory() && dir.name.startsWith('h')) {
      const hash = dir.name.substring(1) // Remove 'h' prefix
      const modulePath = getMillModulePath(hash)
      const sourcePath = join(AUTOGEN_DIR, dir.name, 'src', 'Main.scala')
      const outputPath = getCompiledOutputPath(hash, WORKSPACE_ROOT)

      if (existsSync(sourcePath)) {
        modules.push({
          hash,
          modulePath,
          sourcePath,
          outputPath,
          needsCompilation: false, // Will be determined by cache
        })
      }
    }
  }

  return modules
}

/**
 * Check which modules need compilation using cache
 */
function checkCompilationNeeded(modules: ModuleInfo[], cache: ScalaPreviewCache): ModuleInfo[] {
  for (const module of modules) {
    try {
      const sourceCode = readFileSync(module.sourcePath, 'utf-8')
      module.needsCompilation = cache.shouldCompile(module.hash, sourceCode, module.outputPath)
    } catch (error) {
      console.warn(`Failed to read source for ${module.hash}:`, error)
      module.needsCompilation = true
    }
  }

  return modules.filter(m => m.needsCompilation)
}

/**
 * Compile modules using Mill
 */
function compileModules(modules: ModuleInfo[]): boolean {
  if (modules.length === 0) {
    console.log('✅ All modules are up to date (cache hit)')
    return true
  }

  console.log(`📦 Compiling ${modules.length} ScalaJS module(s)...`)
  
  // Build Mill command for all modules
  const targets = modules.map(m => `${m.modulePath}.fullLinkJS`).join(' ')
  const command = `./mill ${targets}`

  console.log(`Running: ${command}`)

  try {
    const output = execSync(command, {
      cwd: WORKSPACE_ROOT,
      stdio: 'inherit',
      encoding: 'utf-8',
    })

    console.log('✅ Compilation successful')
    return true
  } catch (error) {
    console.error('❌ Compilation failed:', error)
    return false
  }
}

/**
 * Update cache for compiled modules
 */
function updateCache(modules: ModuleInfo[], cache: ScalaPreviewCache): void {
  for (const module of modules) {
    try {
      const sourceCode = readFileSync(module.sourcePath, 'utf-8')
      cache.updateCache(module.hash, sourceCode, module.outputPath)
    } catch (error) {
      console.warn(`Failed to update cache for ${module.hash}:`, error)
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Discovering ScalaJS preview modules...')

  const cache = new ScalaPreviewCache(WORKSPACE_ROOT)
  const allModules = discoverModules()

  if (allModules.length === 0) {
    console.log('No modules to compile')
    return
  }

  console.log(`Found ${allModules.length} module(s)`)

  // Check cache
  const modulesToCompile = checkCompilationNeeded(allModules, cache)

  if (modulesToCompile.length === 0) {
    console.log('✅ All modules are cached and up to date')
    return
  }

  console.log(`Need to compile ${modulesToCompile.length} module(s):`)
  for (const module of modulesToCompile) {
    console.log(`  - ${module.modulePath}`)
  }

  // Compile
  const success = compileModules(modulesToCompile)

  if (success) {
    // Update cache
    updateCache(modulesToCompile, cache)
    console.log('✅ Cache updated')
    
    // Print stats
    const stats = cache.getStats()
    console.log(`📊 Cache stats: ${stats.totalEntries} entries`)
  } else {
    console.error('❌ Compilation failed, cache not updated')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main }

