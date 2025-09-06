import React from 'react';
import type { Element, CanvasProps, Action } from '../types';

interface PropertiesPanelProps {
  selectedElement: Element | null;
  canvasProps: CanvasProps;
  dispatch: React.Dispatch<Action>;
  setSelectedElementId: (id: string | null) => void;
}

// --- Reusable Property Components ---

interface PropertyProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const Property: React.FC<PropertyProps> = ({ label, children, className }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-xs font-medium text-gray-500">{label}</label>
    <div>{children}</div>
  </div>
);

interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  isColor?: boolean;
}

export const Input: React.FC<InputProps> = ({ value, onChange, type = 'text', isColor = false }) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 border rounded-md text-sm ${isColor ? 'h-10 p-1' : ''}`}
    />
  </div>
);

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, children }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md text-sm bg-white"
    >
        {children}
    </select>
);


// --- Main Panel ---
export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  canvasProps,
  dispatch,
  setSelectedElementId,
}) => {
  const updateElement = (updates: Partial<Element>) => {
    if (selectedElement) {
      dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, updates } });
    }
  };

  const updateCanvas = (updates: Partial<CanvasProps>) => {
    dispatch({ type: 'UPDATE_CANVAS', payload: updates });
  };
  
  const deleteElement = () => {
    if (selectedElement) {
        dispatch({ type: 'DELETE_ELEMENT', payload: selectedElement.id });
        setSelectedElementId(null);
    }
  }

  const renderElementProperties = () => {
    if (!selectedElement) return null;
    
    const commonProps = (
      <>
        <div className="grid grid-cols-2 gap-4">
            <Property label="X">
                <Input type="number" value={selectedElement.x} onChange={(val) => updateElement({ x: Number(val) })} />
            </Property>
            <Property label="Y">
                <Input type="number" value={selectedElement.y} onChange={(val) => updateElement({ y: Number(val) })} />
            </Property>
        </div>
         <div className="grid grid-cols-2 gap-4">
            <Property label="Width">
                <Input type="number" value={selectedElement.width} onChange={(val) => updateElement({ width: Number(val) })} />
            </Property>
            <Property label="Height">
                <Input type="number" value={selectedElement.height} onChange={(val) => updateElement({ height: Number(val) })} />
            </Property>
        </div>
        <Property label="Rotation">
            <Input type="number" value={selectedElement.rotation} onChange={(val) => updateElement({ rotation: Number(val) })} />
        </Property>
      </>
    );

    switch (selectedElement.type) {
      case 'text':
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Text Properties</h3>
            <Property label="Content">
                <textarea value={selectedElement.content} onChange={e => updateElement({ content: e.target.value })} className="w-full p-2 border rounded-md" rows={3}/>
            </Property>
            <div className="grid grid-cols-2 gap-4">
                <Property label="Font Size">
                    <Input type="number" value={selectedElement.fontSize} onChange={(val) => updateElement({ fontSize: Number(val) })} />
                </Property>
                <Property label="Color">
                    <Input type="color" value={selectedElement.color} onChange={(val) => updateElement({ color: val })} isColor/>
                </Property>
            </div>
            <Property label="Font Family">
                <Input value={selectedElement.fontFamily} onChange={(val) => updateElement({ fontFamily: val })} />
            </Property>
             <Property label="Font Weight">
                <Select value={selectedElement.fontWeight} onChange={(val) => updateElement({ fontWeight: val as 'normal' | 'bold' })}>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                </Select>
            </Property>
            <Property label="Text Align">
                <Select value={selectedElement.textAlign} onChange={(val) => updateElement({ textAlign: val as 'left' | 'center' | 'right' })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </Select>
            </Property>
            <hr/>
            {commonProps}
          </>
        );
      case 'image':
        return (
            <>
                <h3 className="text-lg font-semibold mb-2">Image Properties</h3>
                {commonProps}
            </>
        );
      case 'shape':
        return (
             <>
                <h3 className="text-lg font-semibold mb-2">Shape Properties</h3>
                <Property label="Shape Type">
                    <Select value={selectedElement.shapeType} onChange={(val) => updateElement({ shapeType: val as 'rect' | 'ellipse' })}>
                        <option value="rect">Rectangle</option>
                        <option value="ellipse">Ellipse</option>
                    </Select>
                </Property>
                <Property label="Background Color">
                    <Input type="color" value={selectedElement.backgroundColor} onChange={(val) => updateElement({ backgroundColor: val })} isColor/>
                </Property>
                <hr/>
                {commonProps}
            </>
        )
      default:
        return null;
    }
  };

  return (
    <aside className="w-80 bg-white p-4 border-l border-gray-200 shadow-lg overflow-y-auto">
      <div className="space-y-4">
        {selectedElement ? (
            <>
                {renderElementProperties()}
                <button onClick={deleteElement} className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Delete Element</button>
            </>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">Canvas Properties</h3>
            <Property label="Background Color">
              <Input
                type="color"
                value={canvasProps.backgroundColor}
                onChange={(val) => updateCanvas({ backgroundColor: val })}
                isColor
              />
            </Property>
            <div className="grid grid-cols-2 gap-4">
                <Property label="Width">
                    <Input type="number" value={canvasProps.width} onChange={(val) => updateCanvas({ width: Number(val) })} />
                </Property>
                <Property label="Height">
                    <Input type="number" value={canvasProps.height} onChange={(val) => updateCanvas({ height: Number(val) })} />
                </Property>
            </div>
             <p className="text-sm text-gray-500 mt-4">Select an element to see its properties.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
