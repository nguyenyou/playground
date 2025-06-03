"use client";
import * as React from "react";

const MIN_WIDTH = 200;
export default function PreviewContainer({ children }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef(null);
  const [initialWidth, setInitialWidth] = React.useState(0);
  const [startWidth, setStartWidth] = React.useState(0);
  const [startX, setStartX] = React.useState(0);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {children}
      <div
        className="absolute top-0 right-0 w-1 h-full bg-gray-300 cursor-col-resize hover:bg-gray-400"
      />
    </div>
  );
}
