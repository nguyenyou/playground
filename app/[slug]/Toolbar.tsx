import * as React from 'react'
import { Toggle } from '@base-ui-components/react/toggle'
import { ToggleGroup } from '@base-ui-components/react/toggle-group'
import { Tablet, Smartphone, Laptop, Monitor, Maximize2, RotateCw } from 'lucide-react'
import { Separator } from '@base-ui-components/react/separator'
import DialogExample from './DialogExample'

type Props = {
  previewIframeRef: React.RefObject<HTMLIFrameElement | null>
  previewIframe: React.ReactNode
  fullscreen?: boolean
  setContainerWidth: (width: number) => void
  resetContainerWidth: () => void
}

export default function Toolbar({ previewIframeRef, previewIframe, fullscreen, setContainerWidth, resetContainerWidth }: Props) {
  const handleRefresh = async () => {
    // Instead of trying to access contentWindow.location.reload() which is blocked by cross-origin policy,
    // we force a refresh by temporarily clearing and then restoring the srcDoc
    const iframe = previewIframeRef.current
    if (iframe) {
      const originalSrcDoc = iframe.getAttribute('srcDoc')
      // Clear srcDoc first
      iframe.setAttribute('srcDoc', '')
      // Use a short timeout to ensure the iframe processes the empty content
      setTimeout(() => {
        if (originalSrcDoc) {
          iframe.setAttribute('srcDoc', originalSrcDoc)
        }
      }, 10)
    }
  }

  return (
    <ToggleGroup defaultValue={['desktop']} className="flex gap-px rounded-md border border-gray-200 p-0.5 bg-white">
      <Toggle
        title="Desktop"
        aria-label="Desktop"
        value="desktop"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
        onClick={() => resetContainerWidth()}
      >
        <Monitor className="size-4" />
      </Toggle>
      <Toggle
        title="Tablet (768px)"
        aria-label="Tablet (768px)"
        value="tablet"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
        onClick={() => setContainerWidth(768)}
      >
        <Tablet className="size-4" />
      </Toggle>
      <Toggle
        title="Phone (375px)"
        aria-label="Phone (375px)"
        value="phone"
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
        onClick={() => setContainerWidth(375)}
      >
        <Smartphone className="size-4" />
      </Toggle>
      <Separator orientation="vertical" className="w-px bg-gray-200 mx-0.5" />
      {fullscreen && <DialogExample previewIframe={previewIframe} previewIframeRef={previewIframeRef} />}
      <button
        title="Refresh"
        aria-label="Refresh"
        onClick={handleRefresh}
        className="flex size-6 items-center justify-center rounded-sm text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none  focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        <RotateCw className="size-4 transition-transform" />
      </button>
    </ToggleGroup>
  )
}
