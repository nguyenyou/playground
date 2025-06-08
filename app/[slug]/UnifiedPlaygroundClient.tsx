'use client'
import * as React from 'react'
import PreviewContainer from "./PreviewContainer";

type Props = {
  srcDoc: string
}

export default function UnifiedPlaygroundClient({ srcDoc}: Props) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const previewIframe = (
    <iframe
      srcDoc={srcDoc}
      className="w-full h-full border border-gray-200 rounded-md"
      sandbox="allow-scripts allow-modals"
      title="Playground"
      ref={iframeRef}
    />
  );

  return (
    <>
      <PreviewContainer
        fullscreen
        previewIframe={previewIframe}
        previewIframeRef={iframeRef}
      />
    </>
  )
}