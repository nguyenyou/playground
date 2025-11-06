import { ScalaTemplateType } from './types'

export interface TemplateContext {
  hash: string
  userCode: string
  customImports?: string[]
}

/**
 * Basic template with direct rendering
 */
export const basicTemplate = (ctx: TemplateContext): string => {
  const customImportsStr = ctx.customImports?.join('\n') || ''
  
  return `package demos.autogen.h${ctx.hash}

import org.scalajs.dom
import com.raquo.laminar.api.L.*
${customImportsStr ? customImportsStr + '\n' : ''}
@main def app = {
  val container = dom.document.querySelector("#root")
  render(container, {
    ${ctx.userCode.split('\n').join('\n    ')}
  })
}
`
}

/**
 * Component template that wraps user code in an object
 */
export const componentTemplate = (ctx: TemplateContext): string => {
  const customImportsStr = ctx.customImports?.join('\n') || ''
  
  return `package demos.autogen.h${ctx.hash}

import org.scalajs.dom
import com.raquo.laminar.api.L.*
${customImportsStr ? customImportsStr + '\n' : ''}
object AppComponent {
  def apply() = {
    ${ctx.userCode.split('\n').join('\n    ')}
  }
}

@main def app = {
  val container = dom.document.querySelector("#root")
  render(container, AppComponent())
}
`
}

/**
 * Custom template - user provides everything except package and main
 */
export const customTemplate = (ctx: TemplateContext): string => {
  return `package demos.autogen.h${ctx.hash}

${ctx.userCode}
`
}

/**
 * Get template function by type
 */
export const getTemplate = (type: ScalaTemplateType): ((ctx: TemplateContext) => string) => {
  switch (type) {
    case 'basic':
      return basicTemplate
    case 'component':
      return componentTemplate
    case 'custom':
      return customTemplate
    default:
      return basicTemplate
  }
}

/**
 * Apply template to user code
 */
export const applyTemplate = (
  userCode: string,
  hash: string,
  templateType: ScalaTemplateType = 'basic',
  customImports?: string[]
): string => {
  const template = getTemplate(templateType)
  return template({ hash, userCode, customImports })
}

