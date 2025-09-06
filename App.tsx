import React, { useReducer, useState, useRef, useCallback } from 'react';
import { Toolbox } from './components/Toolbox';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import type { DesignState, Element, Action } from './types';
import { generateLayoutFromPrompt } from './services/geminiService';
import { VideoEditor } from './components/VideoEditor';

const initialDesignState: DesignState = {
  canvas: {
    width: 1200,
    height: 630,
    backgroundColor: '#ffffff',
  },
  elements: [
    {
      id: 'title-1',
      type: 'text',
      x: 50,
      y: 50,
      width: 400,
      height: 80,
      rotation: 0,
      content: 'Tiêu đề chính',
      fontSize: 64,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'left',
    },
     {
      id: 'image-1',
      type: 'image',
      x: 650,
      y: 50,
      width: 500,
      height: 500,
      rotation: 0,
      src: 'https://picsum.photos/500/500',
    },
  ],
};

const designReducer = (state: DesignState, action: Action): DesignState => {
  switch (action.type) {
    case 'SET_DESIGN':
      return action.payload;
    case 'ADD_ELEMENT':
      return { ...state, elements: [...state.elements, action.payload] };
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id ? ({ ...el, ...action.payload.updates } as Element) : el
        ),
      };
    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
      };
    case 'UPDATE_CANVAS':
      return {
        ...state,
        canvas: { ...state.canvas, ...action.payload },
      };
    default:
      return state;
  }
};

type AppMode = 'banner' | 'video';

const BannerEditor: React.FC = () => {
  const [state, dispatch] = useReducer(designReducer, initialDesignState);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = state.elements.find((el) => el.id === selectedElementId) || null;

  const handleGenerateLayout = useCallback(async (prompt: string) => {
    setIsLoading(true);
    try {
      const newDesign = await generateLayoutFromPrompt(prompt, state.canvas.width, state.canvas.height);
      if (newDesign) {
        dispatch({ type: 'SET_DESIGN', payload: newDesign });
        setSelectedElementId(null);
      }
    } catch (error) {
      console.error('Failed to generate layout:', error);
      alert('Đã xảy ra lỗi khi tạo bố cục. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [state.canvas.width, state.canvas.height]);

  const addElement = (element: Element) => {
    dispatch({ type: 'ADD_ELEMENT', payload: element });
    setSelectedElementId(element.id);
  };
  
  const handleExport = () => {
    if (canvasRef.current && (window as any).html2canvas) {
        setSelectedElementId(null); 
        setTimeout(() => {
            (window as any).html2canvas(canvasRef.current, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
            }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = 'thiet-ke-banner.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }, 100);
    }
  };

  return (
    <>
      <div className="flex h-full font-sans text-gray-800">
        <Toolbox addElement={addElement} onGenerateLayout={handleGenerateLayout} onExport={handleExport} isLoading={isLoading}/>
        <main className="flex-1 flex items-center justify-center p-8 bg-gray-200 overflow-auto">
          <Canvas
            state={state}
            dispatch={dispatch}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            canvasRef={canvasRef}
          />
        </main>
        <PropertiesPanel
          selectedElement={selectedElement}
          canvasProps={state.canvas}
          dispatch={dispatch}
          setSelectedElementId={setSelectedElementId}
        />
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">AI đang sáng tạo... Vui lòng chờ!</p>
          </div>
        </div>
      )}
    </>
  );
}


export default function App() {
  const [mode, setMode] = useState<AppMode>('banner');

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md z-10">
        <nav className="container mx-auto px-4">
          <div className="flex items-center space-x-2">
            <NavButton title="Thiết kế Banner" isActive={mode === 'banner'} onClick={() => setMode('banner')} />
            <NavButton title="Tạo Video (Shorts, Reels)" isActive={mode === 'video'} onClick={() => setMode('video')} />
          </div>
        </nav>
      </header>
      <div className="flex-1 overflow-hidden">
        {mode === 'banner' && <BannerEditor />}
        {mode === 'video' && <VideoEditor />}
      </div>
    </div>
  );
}

const NavButton: React.FC<{title: string, isActive: boolean, onClick: () => void}> = ({ title, isActive, onClick }) => (
    <button onClick={onClick} className={`py-3 px-4 text-sm font-medium border-b-4 transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
        {title}
    </button>
);