import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateSlidesFromPrompt } from '../services/geminiService';
// import { generateVideo } from '../services/videoGenerator';
import type { VideoAction, Slide } from '../types';
import { AIIcon, ExportIcon } from './icons';

interface VideoToolboxProps {
  dispatch: React.Dispatch<VideoAction>;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const VideoToolbox: React.FC<VideoToolboxProps> = ({ dispatch, setIsLoading, setLoadingMessage }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerateScript = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setLoadingMessage('AI đang viết kịch bản...');
    try {
      const slideData = await generateSlidesFromPrompt(prompt);
      const newSlides: Slide[] = slideData.map(data => ({ ...data, id: uuidv4() }));
      if (newSlides.length > 0) {
        dispatch({ type: 'SET_SLIDES', payload: newSlides });
      }
    } catch (error) {
      console.error('Failed to generate script:', error);
      alert('Đã xảy ra lỗi khi tạo kịch bản. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportVideo = async () => {
      alert("Chức năng xuất video đang được phát triển!");
      // This functionality would require access to the slides from the main state
      // and is better initiated from the VideoEditor component.
  }

  return (
    <aside className="w-80 bg-white p-4 border-r border-gray-200 shadow-lg flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tạo Video</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tạo kịch bản với AI</label>
          <textarea
            className="w-full p-2 border rounded-md text-sm"
            rows={4}
            placeholder="Mô tả ý tưởng video của bạn..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleGenerateScript} className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center justify-center space-x-2">
            <AIIcon />
            <span>Tạo Script</span>
          </button>
        </div>
      </div>

      <div className="mt-auto">
         <button onClick={handleExportVideo} className="w-full flex items-center space-x-3 p-3 rounded-md text-left text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <ExportIcon />
            <span>Xuất file MP4</span>
         </button>
      </div>
    </aside>
  );
};
