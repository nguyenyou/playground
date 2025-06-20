import { FilesObject } from '@/plugins/playground/transform'
import { FileExplorer } from './FileExplorer'
import PlaygroundClient from './PlaygroundClient'
import {
  createPlaygroundBuilder,
  parsePlaygroundFiles,
  PlaygroundPresetName,
  PlaygroundConfig,
} from './playground-utils'

type Props = {
  preset?: PlaygroundPresetName
  config?: PlaygroundConfig
  head?: string[]
  htmlAttr?: string
  files: FilesObject
}

export const Playground = async (props: Props) => {
  const { preset = 'vanilla', config, files, head, htmlAttr  } = props

  const builder = config ? createPlaygroundBuilder(config) : createPlaygroundBuilder(preset)

  const srcDoc = await builder.build({ files, head, htmlAttr })

  return (
    <div className='overflow-hidden border border-border'>
      <PlaygroundClient srcDoc={srcDoc} />
      <FileExplorer files={files} />
    </div>
  )
}
