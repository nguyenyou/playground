import { FileExplorer } from './FileExplorer'
import { PlaygroundFramework, getContentBuilder, parsePlaygroundFiles } from './playground-utils'
import UnifiedPlaygroundClient from './UnifiedPlaygroundClient'

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
      <UnifiedPlaygroundClient srcDoc={srcDoc} />
      <FileExplorer files={files} />
    </div>
  )
}
