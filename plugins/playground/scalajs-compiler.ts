import { createHash } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

export interface ScalaJSCompilerOptions {
  cacheDir?: string
  millPath?: string
  template?: 'laminar' | 'dom' | 'custom'
  customTemplate?: ScalaJSTemplate
}

export interface ScalaJSTemplate {
  imports: string[]
  wrapper?: {
    before: string
    after: string
  }
  dependencies?: string[]
  mainClass?: string
}

const DEFAULT_TEMPLATES: Record<string, ScalaJSTemplate> = {
  laminar: {
    imports: [
      'import org.scalajs.dom',
      'import com.raquo.laminar.api.L.*',
    ],
    wrapper: {
      before: '@main def app = {\n  val container = dom.document.querySelector("#root")\n  render(container, ',
      after: ')\n}',
    },
    dependencies: [
      'org.scala-js::scalajs-dom::2.8.0',
      'com.raquo::laminar::17.2.1',
    ],
  },
  dom: {
    imports: [
      'import org.scalajs.dom',
      'import org.scalajs.dom.document',
    ],
    wrapper: {
      before: '@main def app = {\n  val container = document.querySelector("#root")\n  container.innerHTML = ',
      after: '',
    },
    dependencies: [
      'org.scala-js::scalajs-dom::2.8.0',
    ],
  },
}

export class ScalaJSCompiler {
  private cacheDir: string
  private millPath: string
  private template: ScalaJSTemplate

  constructor(options: ScalaJSCompilerOptions = {}) {
    this.cacheDir = options.cacheDir || join(process.cwd(), '.scalajs-cache')
    this.millPath = options.millPath || 'mill'
    
    if (options.customTemplate) {
      this.template = options.customTemplate
    } else {
      this.template = DEFAULT_TEMPLATES[options.template || 'laminar']
    }

    // Ensure cache directory exists
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true })
    }
  }

  /**
   * Compile ScalaJS code and return the path to the compiled JS file
   */
  async compile(code: string, options: { 
    id?: string, 
    forceRecompile?: boolean,
    template?: ScalaJSTemplate 
  } = {}): Promise<string> {
    const template = options.template || this.template
    const codeHash = this.getCodeHash(code, template)
    const projectDir = join(this.cacheDir, codeHash)
    const jsOutputPath = join(projectDir, 'out', 'app', 'fullLinkJS.dest', 'main.js')

    // Check cache
    if (!options.forceRecompile && existsSync(jsOutputPath)) {
      return readFileSync(jsOutputPath, 'utf8')
    }

    // Create project structure
    this.createProjectStructure(projectDir, code, template)

    // Compile with Mill
    try {
      execSync(`${this.millPath} app.fullLinkJS`, {
        cwd: projectDir,
        stdio: 'pipe',
        env: { ...process.env, MILL_VERSION: '1.0.6' }
      })
    } catch (error) {
      throw new Error(`ScalaJS compilation failed: ${error}`)
    }

    if (!existsSync(jsOutputPath)) {
      throw new Error('Compiled JS file not found after successful compilation')
    }

    return readFileSync(jsOutputPath, 'utf8')
  }

  private getCodeHash(code: string, template: ScalaJSTemplate): string {
    const content = JSON.stringify({ code, template })
    return createHash('md5').update(content).digest('hex').substring(0, 8)
  }

  private createProjectStructure(projectDir: string, code: string, template: ScalaJSTemplate): void {
    // Create directories
    const srcDir = join(projectDir, 'app', 'src')
    mkdirSync(srcDir, { recursive: true })

    // Generate full Scala source
    let fullCode = ''
    
    // Add package declaration
    fullCode += 'package app\n\n'

    // Add imports
    if (template.imports) {
      fullCode += template.imports.join('\n') + '\n\n'
    }

    // Add the code with wrapper if needed
    if (template.wrapper) {
      fullCode += template.wrapper.before + code + template.wrapper.after
    } else {
      fullCode += code
    }

    // Write source file
    writeFileSync(join(srcDir, 'App.scala'), fullCode)

    // Create build.mill
    const buildMill = this.generateBuildMill(template)
    writeFileSync(join(projectDir, 'build.mill'), buildMill)
  }

  private generateBuildMill(template: ScalaJSTemplate): string {
    const deps = template.dependencies || []
    const depsString = deps.map(dep => {
      const [org, name, version] = dep.split('::')
      return `    mvn"${org}::${name}::${version}"`
    }).join(',\n')

    return `
//| mill-version: 1.0.6
import mill._, scalalib._, scalajslib._, scalajslib.api._

object app extends ScalaJSModule {
  def scalaVersion = "3.7.1"
  def scalaJSVersion = "1.19.0"
  
  def moduleKind = ModuleKind.ESModule
  def moduleSplitStyle = ModuleSplitStyle.FewestModules
  
  def mvnDeps = Seq(
${depsString}
  )
  
  def jsEnvConfig = Task {
    JsEnvConfig.JsDom()
  }
}
`.trim()
  }

  /**
   * Clean up old cache entries
   */
  cleanCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    // Implementation for cleaning old cache entries
    // This could be called periodically
  }
}
