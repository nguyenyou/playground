import { Lang } from './types'
import { highlighter } from './highlighter'

type Props = {
  code: string
  lang: Lang
}


export const Code = ({ code, lang }: Props) => {
  const normalizedCode = (code || '').trim()
  const html = highlighter.codeToHtml(normalizedCode, {
    lang,
    theme: 'github-light-default',
  })
  return (
    <div
      className="h-full overflow-auto p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    >
    </div>
  )
}
