'use client'
import * as React from 'react'
import Toolbar from './Toolbar'

const resetCursor = () => {
  document.body.style.removeProperty('cursor')
  document.body.style.removeProperty('user-select')
}

const updateCursor = () => {
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

type Props = {
  minWidth?: number
  previewIframeRef: React.RefObject<HTMLIFrameElement | null>
  previewIframe: React.ReactNode
  fullscreen?: boolean
}
export default function PreviewContainer({ previewIframeRef, previewIframe, minWidth = 200, fullscreen = false }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const initialWidth = React.useRef<number | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    const ele = containerRef.current
    if (!ele) {
      return
    }
    if (initialWidth.current === null) {
      initialWidth.current = ele.getBoundingClientRect().width
    }

    ele.style.userSelect = 'none'
    ele.style.pointerEvents = 'none'

    const startX = e.clientX
    const rect = ele.getBoundingClientRect()
    const startWidth = rect.width

    updateCursor()

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newWidth = startWidth + deltaX
      // if newWidth is less than minWidth, set it to minWidth
      // if newWidth is greater than initialWidth, set it to initialWidth
      if (initialWidth.current) {
        const w = Math.min(Math.max(newWidth, minWidth), initialWidth.current)
        ele.style.width = `${w}px`
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      ele.style.removeProperty('user-select')
      ele.style.removeProperty('pointer-events')
      resetCursor()
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="w-full h-full pb-2 pt-2 pl-2 pr-3.5 flex relative flex-col gap-2 bg-slate-50/50 [background-image:radial-gradient(#dfdfdf_1px,transparent_1px)] [background-size:20px_20px] border border-gray-200">
      <div className="w-full flex items-center justify-center">
        <Toolbar previewIframeRef={previewIframeRef} previewIframe={previewIframe} fullscreen={fullscreen} />
      </div>
      <div ref={containerRef} className="relative w-full bg-white h-full overflow-visible rounded-md">
        {previewIframe}
        <div
          className="pointer-events-auto absolute top-1/2 -right-2.5 -mt-6 h-12 w-1.5 cursor-ew-resize rounded-full bg-slate-950/20 hover:bg-slate-950/40"
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}
