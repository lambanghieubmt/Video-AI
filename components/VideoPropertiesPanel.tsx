import React, { useState } from 'react';
import type { Slide } from '../types';
import { Property, Input, Select } from './PropertiesPanel';
import { generateImageFromPrompt } from '../services/geminiService';
import { ImageIcon } from './icons';

interface VideoPropertiesPanelProps {
  selectedSlide: Slide | null;
  dispatch: React.Dispatch<any>;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const VideoPropertiesPanel: React.FC<VideoPropertiesPanelProps> = ({ selectedSlide, dispatch, setIsLoading, setLoadingMessage }) => {
  const [imagePrompt, setImagePrompt] = useState('');

  if (!selectedSlide) {
    return (
      <aside className="w-80 bg-white p-4 border-l border-gray-200 shadow-lg flex items-center justify-center">
        <p className="text-gray-500">Chọn một slide để chỉnh sửa</p>
      </aside>
    );
  }

  const updateSlide = (updates: Partial<Slide>) => {
    dispatch({ type: 'UPDATE_SLIDE', payload: { id: selectedSlide.id, updates } });
  };
  
  const updateText = (updates: Partial<Slide['text']>) => {
      updateSlide({ text: { ...selectedSlide.text, ...updates } });
  }

  const deleteSlide = () => {
      dispatch({ type: 'DELETE_SLIDE', payload: selectedSlide.id });
      // Note: Selecting the next/previous slide should be handled in the main component
  }

  const handleGenerateBgImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsLoading(true);
    setLoadingMessage('AI đang vẽ ảnh nền...');
    try {
        const imageUrl = await generateImageFromPrompt(imagePrompt);
        updateSlide({ backgroundImage: imageUrl });
        setImagePrompt('');
    } catch (error) {
        alert('Không thể tạo ảnh. Vui lòng thử lại.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <aside className="w-80 bg-white p-4 border-l border-gray-200 shadow-lg overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Thuộc tính Slide</h3>
        
        <Property label="Thời lượng (giây)">
            <Input type="number" value={selectedSlide.duration} onChange={(val) => updateSlide({ duration: Number(val) })} />
        </Property>
        
        <hr/>
        <h4 className="font-semibold">Nền</h4>
        <Property label="Màu nền">
            <Input type="color" value={selectedSlide.backgroundColor} onChange={(val) => updateSlide({ backgroundColor: val })} isColor />
        </Property>
        <div className="p-3 bg-gray-50 rounded-md space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tạo ảnh nền bằng AI</label>
            <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="Mô tả ảnh nền..." rows={2} className="w-full p-2 border rounded-md text-sm" />
            <button onClick={handleGenerateBgImage} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center justify-center space-x-2">
                <ImageIcon />
                <span>Tạo ảnh</span>
            </button>
        </div>


        <hr/>
        <h4 className="font-semibold">Văn bản</h4>
        <Property label="Nội dung">
            <textarea value={selectedSlide.text.content} onChange={e => updateText({ content: e.target.value })} className="w-full p-2 border rounded-md" rows={3} />
        </Property>
        <div className="grid grid-cols-2 gap-4">
            <Property label="Cỡ chữ">
                <Input type="number" value={selectedSlide.text.fontSize} onChange={(val) => updateText({ fontSize: Number(val) })} />
            </Property>
            <Property label="Màu chữ">
                <Input type="color" value={selectedSlide.text.color} onChange={(val) => updateText({ color: val })} isColor />
            </Property>
        </div>
         <Property label="Độ đậm">
             <Select value={selectedSlide.text.fontWeight} onChange={(val) => updateText({ fontWeight: val as 'normal' | 'bold' })}>
                <option value="normal">Thường</option>
                <option value="bold">Đậm</option>
            </Select>
        </Property>
        <Property label="Vị trí dọc (%)">
            <input type="range" min="0" max="100" value={selectedSlide.text.y} onChange={(e) => updateText({ y: Number(e.target.value) })} className="w-full" />
        </Property>


        <button onClick={deleteSlide} className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Xóa Slide</button>
      </div>
    </aside>
  );
};