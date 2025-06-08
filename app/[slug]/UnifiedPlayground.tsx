import * as React from 'react'
import { FileExplorer } from './FileExplorer'
import PreviewContainer from './PreviewContainer'
import { Maximize2 } from 'lucide-react'
import { PlaygroundFramework, getContentBuilder, parsePlaygroundFiles } from './playground-utils'

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
      <FileExplorer files={files} />
      <div className="border-x border-gray-200 p-1 flex items-center justify-end">
        <button className="p-1 rounded cursor-pointer hover:bg-gray-100 active:bg-gray-200">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
      <PreviewContainer>
        <iframe
          srcDoc={srcDoc}
          className="w-full h-full border border-gray-200 rounded-md"
          sandbox="allow-scripts allow-modals"
          title="Playground"
        />
      </PreviewContainer>
    </div>
  )
}
