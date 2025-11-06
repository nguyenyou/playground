#!/usr/bin/env node

/**
 * Test script to generate a sample ScalaJS preview module
 */

import { processCodeBlock, generateModule } from '../plugins/playground/scala-preview/codegen'
import { join } from 'path'

const WORKSPACE_ROOT = join(__dirname, '..')

// Test code - simple counter
const testCode = `val countVar = Var(0)

div(
  display.flex,
  alignItems.center,
  justifyContent.center,
  gap := "10px",
  button(
    "-",
    onClick --> Observer { _ =>
      countVar.update(_ - 1)
    }
  ),
  span(
    text <-- countVar.signal.map(_.toString)
  ),
  button(
    "+",
    onClick --> Observer { _ =>
      countVar.update(_ + 1)
    }
  )
)`

async function main() {
  console.log('🧪 Testing ScalaJS Preview System...\n')

  // Process the code block
  console.log('1️⃣ Processing code block...')
  const block = processCodeBlock(testCode)
  console.log(`   ✅ Generated hash: ${block.hash}`)
  console.log(`   ✅ Template: ${block.template}`)

  // Generate module
  console.log('\n2️⃣ Generating Mill module...')
  const module = generateModule(block, WORKSPACE_ROOT)
  console.log(`   ✅ Package: ${module.packageName}`)
  console.log(`   ✅ Source: ${module.sourcePath}`)
  console.log(`   ✅ Mill: ${module.millPath}`)

  console.log('\n3️⃣ Generated Scala code:')
  console.log('─'.repeat(60))
  console.log(block.wrappedCode)
  console.log('─'.repeat(60))

  console.log('\n✅ Module generated successfully!')
  console.log(`\nNext steps:`)
  console.log(`  1. Run: bun run compile-scala`)
  console.log(`  2. Check: ${module.outputPath}`)
}

main().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})

