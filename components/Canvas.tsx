
import React from 'react';
import DraggableResizable from './DraggableResizable';
import type { DesignState, Action } from '../types';

interface CanvasProps {
  state: DesignState;
  dispatch: React.Dispatch<Action>;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const Canvas: React.FC<CanvasProps> = ({ state, dispatch, selectedElementId, setSelectedElementId, canvasRef }) => {
  const { canvas, elements } = state;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
    }
  };

  const renderElement = (el: any) => {
    switch (el.type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: `${el.fontSize}px`,
              fontFamily: el.fontFamily,
              color: el.color,
              fontWeight: el.fontWeight,
              textAlign: el.textAlign,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {el.content}
          </div>
        );
      case 'image':
        return <img src={el.src} alt="element" className="w-full h-full object-cover" />;
      case 'shape':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: el.backgroundColor,
              borderRadius: el.shapeType === 'ellipse' ? '50%' : '0',
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={canvasRef}
      className="shadow-lg"
      style={{
        width: `${canvas.width}px`,
        height: `${canvas.height}px`,
        backgroundColor: canvas.backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={handleCanvasClick}
    >
      {elements.map((el) => (
        <DraggableResizable
          key={el.id}
          element={el}
          isSelected={el.id === selectedElementId}
          onSelect={() => setSelectedElementId(el.id)}
          onUpdate={(updates) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id: el.id, updates } })}
        >
          {renderElement(el)}
        </DraggableResizable>
      ))}
    </div>
  );
};
