'use client'
import * as React from 'react'

const resetCursor = () => {
  document.body.style.removeProperty('cursor')
  document.body.style.removeProperty('user-select')
}

const updateCursor = () => {
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

export default function PreviewContainer({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    const ele = containerRef.current
    if (!ele) {
      return
    }
    ele.style.userSelect = 'none'
    ele.style.pointerEvents = 'none'
    console.log('handle mouse down')

    const startX = e.clientX
    const rect = ele.getBoundingClientRect()
    const startWidth = rect.width

    updateCursor()

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newWidth = startWidth + deltaX
      ele.style.width = `${newWidth}px`
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
    <div className='flex flex-col gap-1  bg-gray-950/5 p-1 inset-ring inset-ring-gray-950/5'>
      <div ref={containerRef} className="relative w-full bg-white h-full">
        {children}
        <div
          className="pointer-events-auto absolute top-1/2 right-2 z-50 -mt-6 h-12 w-1.5 cursor-ew-resize rounded-full bg-slate-950/20 hover:bg-slate-950/40"
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}
