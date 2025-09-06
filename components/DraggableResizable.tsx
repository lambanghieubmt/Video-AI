
import React, { useState, useEffect, useRef } from 'react';
import type { Element } from '../types';

interface DraggableResizableProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Element>) => void;
  children: React.ReactNode;
}

const DraggableResizable: React.FC<DraggableResizableProps> = ({ element, isSelected, onSelect, onUpdate, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent<HTMLDivElement>, position: string) => {
    e.stopPropagation();
    onSelect();
    setIsResizing(position);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && ref.current) {
        onUpdate({ x: element.x + e.movementX, y: element.y + e.movementY });
      }
      if (isResizing && ref.current) {
        let { width, height, x, y } = element;
        if (isResizing.includes('right')) width += e.movementX;
        if (isResizing.includes('left')) { width -= e.movementX; x += e.movementX; }
        if (isResizing.includes('bottom')) height += e.movementY;
        if (isResizing.includes('top')) { height -= e.movementY; y += e.movementY; }
        onUpdate({ width, height, x, y });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, onUpdate, element]);

  const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const handleCursors: { [key: string]: string } = {
    'top-left': 'nwse-resize',
    'top-right': 'nesw-resize',
    'bottom-left': 'nesw-resize',
    'bottom-right': 'nwse-resize',
  };

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px',
      }}
    >
      {children}
      {isSelected && handles.map(pos => (
        <div
          key={pos}
          onMouseDown={(e) => handleResizeHandleMouseDown(e, pos)}
          className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full"
          style={{
            cursor: handleCursors[pos],
            top: pos.includes('top') ? '-6px' : undefined,
            left: pos.includes('left') ? '-6px' : undefined,
            right: pos.includes('right') ? '-6px' : undefined,
            bottom: pos.includes('bottom') ? '-6px' : undefined,
          }}
        />
      ))}
    </div>
  );
};

export default DraggableResizable;
