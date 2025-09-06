
import React, { useState } from 'react';
import type { Element } from '../types';
import { generateImageFromPrompt } from '../services/geminiService';
import { TextIcon, ImageIcon, ShapeIcon, AIIcon, ExportIcon } from './icons';

interface ToolboxProps {
  addElement: (element: Element) => void;
  onGenerateLayout: (prompt: string) => void;
  onExport: () => void;
  isLoading: boolean;
}

export const Toolbox: React.FC<ToolboxProps> = ({ addElement, onGenerateLayout, onExport, isLoading }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');

  const addText = () => {
    const newText: Element = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 300,
      height: 50,
      rotation: 0,
      content: 'Văn bản mới',
      fontSize: 40,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'left',
    };
    addElement(newText);
  };

  const addShape = () => {
    const newShape: Element = {
        id: `shape-${Date.now()}`,
        type: 'shape',
        shapeType: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        rotation: 0,
        backgroundColor: '#3b82f6',
    };
    addElement(newShape);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    try {
        const src = await generateImageFromPrompt(imagePrompt);
        const newImage: Element = {
            id: `image-${Date.now()}`,
            type: 'image',
            x: 150,
            y: 150,
            width: 400,
            height: 300,
            rotation: 0,
            src,
        };
        addElement(newImage);
        setImagePrompt('');
        setActiveTool(null);
    } catch (error) {
        alert('Không thể tạo ảnh. Vui lòng thử lại.');
    }
  };


  return (
    <aside className="w-80 bg-white p-4 border-r border-gray-200 shadow-lg flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thiết kế Banner</h1>
      <div className="flex flex-col space-y-2">
        <ToolButton icon={<AIIcon />} label="Tạo bằng AI" onClick={() => setActiveTool(activeTool === 'ai' ? null : 'ai')} active={activeTool === 'ai'} />
        {activeTool === 'ai' && (
          <div className="p-3 bg-gray-100 rounded-md">
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
              placeholder="Mô tả banner bạn muốn..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button onClick={() => onGenerateLayout(aiPrompt)} disabled={isLoading} className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm disabled:bg-blue-300">
              {isLoading ? 'Đang tạo...' : 'Tạo bố cục'}
            </button>
          </div>
        )}
        <ToolButton icon={<TextIcon />} label="Thêm Văn bản" onClick={addText} />
        <ToolButton icon={<ImageIcon />} label="Thêm Hình ảnh AI" onClick={() => setActiveTool(activeTool === 'image' ? null : 'image')} active={activeTool === 'image'} />
        {activeTool === 'image' && (
          <div className="p-3 bg-gray-100 rounded-md">
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              rows={2}
              placeholder="Mô tả hình ảnh..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
            <button onClick={handleGenerateImage} disabled={isLoading} className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm disabled:bg-green-300">
              {isLoading ? 'Đang tạo...' : 'Tạo ảnh'}
            </button>
          </div>
        )}
         <ToolButton icon={<ShapeIcon />} label="Thêm Hình khối" onClick={addShape} />
      </div>
       <div className="mt-auto">
        <ToolButton icon={<ExportIcon />} label="Xuất file PNG" onClick={onExport} />
      </div>
    </aside>
  );
};

interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, onClick, active = false }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 p-3 rounded-md text-left text-sm font-medium transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
    {icon}
    <span>{label}</span>
  </button>
);
