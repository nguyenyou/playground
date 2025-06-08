import { UnifiedPlayground } from './UnifiedPlayground';
import { PlaygroundFramework } from './playground-utils';

type Props = {
  framework?: PlaygroundFramework;
  files: string;
}

export const Playground = (props: Props) => {
  const { framework = 'vanilla' } = props;
  
  return (
    <UnifiedPlayground 
      {...props}
      framework={framework}
    />
  )
}
