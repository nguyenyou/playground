import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { CacheManifest, CacheEntry } from './types'

const CACHE_VERSION = '1.0.0'
const CACHE_DIR = 'node_modules/.cache/scala-previews'
const CACHE_FILE = 'manifest.json'

export class ScalaPreviewCache {
  private manifest: CacheManifest
  private cacheDir: string
  private cacheFile: string
  private workspaceRoot: string

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot
    this.cacheDir = join(workspaceRoot, CACHE_DIR)
    this.cacheFile = join(this.cacheDir, CACHE_FILE)
    this.manifest = this.loadManifest()
  }

  /**
   * Load cache manifest from disk
   */
  private loadManifest(): CacheManifest {
    if (!existsSync(this.cacheFile)) {
      return {
        version: CACHE_VERSION,
        entries: {},
      }
    }

    try {
      const content = readFileSync(this.cacheFile, 'utf-8')
      const manifest = JSON.parse(content) as CacheManifest

      // Check version compatibility
      if (manifest.version !== CACHE_VERSION) {
        console.log('Cache version mismatch, invalidating cache')
        return {
          version: CACHE_VERSION,
          entries: {},
        }
      }

      return manifest
    } catch (error) {
      console.warn('Failed to load cache manifest:', error)
      return {
        version: CACHE_VERSION,
        entries: {},
      }
    }
  }

  /**
   * Save cache manifest to disk
   */
  private saveManifest(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true })
    }

    try {
      writeFileSync(this.cacheFile, JSON.stringify(this.manifest, null, 2))
    } catch (error) {
      console.warn('Failed to save cache manifest:', error)
    }
  }

  /**
   * Get cached entry by hash
   */
  getCached(hash: string): CacheEntry | undefined {
    return this.manifest.entries[hash]
  }

  /**
   * Check if a module needs compilation
   */
  shouldCompile(hash: string, sourceCode: string, compiledPath: string): boolean {
    const cached = this.getCached(hash)

    if (!cached) {
      return true
    }

    // Check if source code changed
    if (cached.sourceCode !== sourceCode) {
      return true
    }

    // Check if compiled output exists
    if (!existsSync(compiledPath)) {
      return true
    }

    return false
  }

  /**
   * Update cache entry
   */
  updateCache(hash: string, sourceCode: string, compiledPath: string): void {
    this.manifest.entries[hash] = {
      hash,
      sourceCode,
      compiledPath,
      timestamp: Date.now(),
    }
    this.saveManifest()
  }

  /**
   * Remove cache entry
   */
  removeCache(hash: string): void {
    delete this.manifest.entries[hash]
    this.saveManifest()
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.manifest.entries = {}
    this.saveManifest()
  }

  /**
   * Get all cached hashes
   */
  getAllHashes(): string[] {
    return Object.keys(this.manifest.entries)
  }

  /**
   * Get statistics about cache
   */
  getStats(): {
    totalEntries: number
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const entries = Object.values(this.manifest.entries)
    const timestamps = entries.map(e => e.timestamp)

    return {
      totalEntries: entries.length,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    }
  }
}

