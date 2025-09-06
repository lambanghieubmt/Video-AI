import React from 'react';
import type { Slide } from '../types';

interface TimelineProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ slides, selectedSlideId, onSelectSlide, onAddSlide }) => {
  return (
    <div className="w-full max-w-4xl mt-4 bg-white p-3 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3 overflow-x-auto">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => onSelectSlide(slide.id)}
            className={`cursor-pointer border-2 rounded-md p-1 ${selectedSlideId === slide.id ? 'border-blue-500' : 'border-transparent'}`}
          >
            <div className="flex-shrink-0 w-28 h-48 bg-gray-200 rounded-md relative overflow-hidden text-white flex flex-col justify-center items-center">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundColor: slide.backgroundColor,
                  backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <div className="relative z-10 text-center p-1">
                 <span className="text-xs font-bold leading-tight" style={{textShadow: '1px 1px 2px #000'}}>{slide.text.content}</span>
              </div>
               <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={onAddSlide}
          className="flex-shrink-0 w-28 h-48 bg-gray-100 hover:bg-gray-200 rounded-md flex flex-col items-center justify-center text-gray-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span className="text-sm mt-1">Thêm Slide</span>
        </button>
      </div>
    </div>
  );
};