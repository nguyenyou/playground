import * as React from 'react'

type Props = {
  srcDoc: string,
  ref: React.RefObject<HTMLIFrameElement>
}
export default function PreviewIframe({ srcDoc, ref }: Props) {
  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full h-full border border-gray-200 rounded-md"
      sandbox="allow-scripts allow-modals"
      title="Playground"
      ref={ref}
    />
  )
}
