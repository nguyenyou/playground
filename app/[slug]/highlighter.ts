import { createHighlighter } from 'shiki'

// `createHighlighter` is async, it initializes the internal and
// loads the themes and languages specified.
export const highlighter = await createHighlighter({
  themes: ['github-light-default'],
  langs: ['javascript', 'html', 'css', 'jsx', 'tsx', 'ts'],
})