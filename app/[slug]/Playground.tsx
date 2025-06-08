import { FileExplorer } from './FileExplorer';
import PlaygroundClient from './PlaygroundClient';
import { getContentBuilder, parsePlaygroundFiles, PlaygroundFramework } from './playground-utils';

type Props = {
  framework?: PlaygroundFramework;
  files: string;
}

export const Playground = async (props: Props) => {
  const { framework = 'vanilla', files: filesJson } = props;
  const files = parsePlaygroundFiles(filesJson)
  const contentBuilder = getContentBuilder(framework)
  const srcDoc = await contentBuilder.build(files)

  return (
    <div>
      <PlaygroundClient srcDoc={srcDoc} />
      <FileExplorer files={files} />
    </div>
  )
}
