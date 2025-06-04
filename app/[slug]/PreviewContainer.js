"use client";
import * as React from "react";

const resetCursor = () => {
  document.body.style.removeProperty("cursor");
  document.body.style.removeProperty("user-select");
};

const updateCursor = () => {
  document.body.style.cursor = "ew-resize";
  document.body.style.userSelect = "none";
};

export default function PreviewContainer({ children }) {
  const containerRef = React.useRef(null);

  const handleMouseDown = (e) => {
    const ele = containerRef.current;
    if (!ele) {
      return;
    }
    ele.style.userSelect = "none";
    ele.style.pointerEvents = "none";
    console.log("handle mouse down");

    const startX = e.clientX;
    const rect = ele.getBoundingClientRect();
    const startWidth = rect.width;

    updateCursor();

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      ele.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      ele.style.removeProperty("user-select");
      ele.style.removeProperty("pointer-events");
      resetCursor();
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };


  return (
    <div ref={containerRef} className="relative w-full">
      {children}
      <div
        className="absolute top-0 right-0 w-1 h-full bg-gray-300 cursor-col-resize hover:bg-gray-400"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
