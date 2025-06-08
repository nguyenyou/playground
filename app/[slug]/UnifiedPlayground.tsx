import * as React from 'react'
import { FileExplorer } from './FileExplorer'
import PreviewContainer from './PreviewContainer'
import { Maximize2 } from 'lucide-react'
import { PlaygroundFramework, getContentBuilder, parsePlaygroundFiles } from './playground-utils'
import DialogExample from './DialogExample'
import Toolbar from './Toolbar'

type Props = {
  framework?: PlaygroundFramework
  files: string
}

export const UnifiedPlayground = async ({ framework = 'vanilla', files: filesJson }: Props) => {
  const files = parsePlaygroundFiles(filesJson)
  const contentBuilder = getContentBuilder(framework)
  const srcDoc = await contentBuilder.build(files)

  return (
    <div>
      <PreviewContainer
        fullscreen
        previewIframe={
          <iframe
            srcDoc={srcDoc}
            className="w-full h-full border border-gray-200 rounded-md"
            sandbox="allow-scripts allow-modals"
            title="Playground"
          />
        }
      ></PreviewContainer>
      <FileExplorer files={files} />
    </div>
  )
}
