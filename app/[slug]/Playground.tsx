import { FileExplorer } from './FileExplorer'
import PreviewContainer from './PreviewContainer'
import { ReactPlayground } from './ReactPlayground'
import { TailwindPlayground } from './TailwindPlayground'
import { Maximize2 } from 'lucide-react'

function buildIframeContent(files: Record<string, { code: string }>) {
  const html = files['/index.html']?.code || "<div id='root'></div>"
  const css = files['/index.css']?.code || files['/styles.css']?.code || ''
  const js = files['/index.js']?.code || ''

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
          }
        </style>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script type="module">${js}</script>
      </body>
    </html>
  `
}
type Props = {
  framework: 'react' | 'tailwind'
  files: string
}
export const Playground = (props: Props) => {
  const { framework, files: filesJson } = props

  if (framework === 'react') {
    return <ReactPlayground {...props} />
  }

  if (framework === 'tailwind') {
    return <TailwindPlayground {...props} />
  }

  const files = typeof filesJson === 'string' ? JSON.parse(filesJson) : filesJson

  const srcDoc = buildIframeContent(files)

  return (
    <div>
      <FileExplorer files={files} />
      <div className="border-x border-gray-200 p-1 flex items-center justify-end">
        <button className="p-1 rounded cursor-pointer hover:bg-gray-100 active:bg-gray-200">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
      <PreviewContainer>
        <iframe
          srcDoc={srcDoc}
          className="w-full h-full border border-gray-200"
          sandbox="allow-scripts allow-modals"
          title="Playground"
        />
      </PreviewContainer>
    </div>
  )
}
