/**
 * ScalaJS code templates for different use cases
 */

export interface ScalaTemplate {
  name: string
  wrapper: (code: string) => string
  description: string
}

export const SCALA_TEMPLATES: Record<string, ScalaTemplate> = {
  /**
   * Default template: wraps code in a main function that renders to #root
   * Assumes code returns a Laminar element
   */
  default: {
    name: 'default',
    description: 'Default Laminar template - renders to #root',
    wrapper: (code: string) => `package demos.inline

import org.scalajs.dom
import com.raquo.laminar.api.L.*

@main def main = {
  val container = dom.document.querySelector("#root")
  render(container, ${code})
}`,
  },

  /**
   * Expression template: treats code as a direct expression
   * Useful for simple element creation like div("hello world")
   */
  expression: {
    name: 'expression',
    description: 'Expression template - code is treated as an expression',
    wrapper: (code: string) => `package demos.inline

import org.scalajs.dom
import com.raquo.laminar.api.L.*

@main def main = {
  val container = dom.document.querySelector("#root")
  val element = ${code}
  render(container, element)
}`,
  },

  /**
   * Standalone template: code is a complete program
   * Useful when user provides full code including @main
   */
  standalone: {
    name: 'standalone',
    description: 'Standalone template - code is complete (includes @main if needed)',
    wrapper: (code: string) => {
      // If code already has @main, just wrap in package
      if (code.includes('@main')) {
        return `package demos.inline

${code}`
      }
      // Otherwise wrap in main function
      return `package demos.inline

import org.scalajs.dom
import com.raquo.laminar.api.L.*

@main def main = {
  ${code}
}`
    },
  },

  /**
   * Component template: wraps code as a component class
   */
  component: {
    name: 'component',
    description: 'Component template - wraps code as a Laminar component',
    wrapper: (code: string) => `package demos.inline

import org.scalajs.dom
import com.raquo.laminar.api.L.*

case class App() {
  def apply() = ${code}
}

@main def main = {
  val container = dom.document.querySelector("#root")
  render(container, App()())
}`,
  },
}

/**
 * Detect which template to use based on code structure
 */
export function detectTemplate(code: string): string {
  const trimmed = code.trim()

  // If code already has @main, use standalone
  if (trimmed.includes('@main')) {
    return 'standalone'
  }

  // If code looks like a complete function/class definition
  if (trimmed.includes('def ') || trimmed.includes('class ') || trimmed.includes('object ')) {
    return 'standalone'
  }

  // If code is a simple expression (no semicolons, single line or simple)
  if (!trimmed.includes(';') && !trimmed.includes('@main')) {
    return 'expression'
  }

  // Default to component template for complex code
  return 'default'
}

/**
 * Wrap code using the specified template
 */
export function wrapCode(code: string, template?: string): string {
  const templateName = template || detectTemplate(code)
  const selectedTemplate = SCALA_TEMPLATES[templateName] || SCALA_TEMPLATES.default
  return selectedTemplate.wrapper(code)
}

