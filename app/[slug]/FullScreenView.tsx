'use client'
import { Fullscreen, Maximize } from 'lucide-react'
import PreviewContainer from './PreviewContainer'
import { useState } from 'react'

type Props = {
  previewIframeRef: React.RefObject<HTMLIFrameElement | null>
  previewIframe: React.ReactNode
}
export default function FullScreenView({ previewIframeRef, previewIframe }: Props) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <>
      <button
        title="Full Screen"
        aria-label="Full Screen"
        onClick={handleFullScreen}
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        <Maximize className="size-4 transition-transform" />
      </button>
      {isFullScreen ? (
        <div className="fixed inset-0 z-50 bg-white">
          <PreviewContainer previewIframeRef={previewIframeRef} previewIframe={previewIframe} />
        </div>
      ) : null}
    </>
  )
}
