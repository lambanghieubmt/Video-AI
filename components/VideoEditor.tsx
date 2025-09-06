import React, { useReducer, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { VideoToolbox } from './VideoToolbox';
import { VideoPreview } from './VideoPreview';
import { Timeline } from './Timeline';
import { VideoPropertiesPanel } from './VideoPropertiesPanel';
import type { Slide, VideoAction } from '../types';

interface VideoState {
  slides: Slide[];
}

const initialVideoState: VideoState = {
  slides: [
    {
      id: uuidv4(),
      duration: 5,
      backgroundColor: '#0d47a1',
      backgroundImage: null,
      text: {
        content: 'Tạo video ngắn của bạn với AI',
        fontSize: 72,
        color: '#ffffff',
        fontWeight: 'bold',
        y: 50,
      },
    },
  ],
};

const videoReducer = (state: VideoState, action: VideoAction): VideoState => {
  switch (action.type) {
    case 'SET_SLIDES':
      return { ...state, slides: action.payload };
    case 'ADD_SLIDE': {
        const newSlide: Slide = {
            id: uuidv4(),
            duration: 4,
            backgroundColor: '#000000',
            backgroundImage: null,
            text: {
                content: 'Văn bản mới',
                fontSize: 60,
                color: '#ffffff',
                fontWeight: 'normal',
                y: 50,
            },
            ...action.payload,
        };
        return { ...state, slides: [...state.slides, newSlide] };
    }
    case 'UPDATE_SLIDE':
      return {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };
    case 'DELETE_SLIDE': {
      const newSlides = state.slides.filter((s) => s.id !== action.payload);
      if (newSlides.length === 0) {
        return {
          slides: [{
            id: uuidv4(),
            duration: 4,
            backgroundColor: '#000000',
            backgroundImage: null,
            text: { content: 'Văn bản mới', fontSize: 60, color: '#ffffff', fontWeight: 'normal', y: 50 },
          }]
        };
      }
      return { ...state, slides: newSlides };
    }
    default:
      return state;
  }
};

export const VideoEditor: React.FC = () => {
  const [state, dispatch] = useReducer(videoReducer, initialVideoState);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(state.slides[0]?.id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('AI đang làm việc...');

  const selectedSlide = state.slides.find((s) => s.id === selectedSlideId) || null;

  const handleSelectSlide = (id: string) => {
    setSelectedSlideId(id);
  };
  
  const handleAddSlide = () => {
      const newSlideId = uuidv4();
      dispatch({ type: 'ADD_SLIDE', payload: {id: newSlideId} as any });
      setSelectedSlideId(newSlideId);
  };

  useEffect(() => {
      if (!state.slides.find(s => s.id === selectedSlideId)) {
          setSelectedSlideId(state.slides[0]?.id || null);
      }
  }, [state.slides, selectedSlideId]);

  const videoDimensions = { width: 405, height: 720 }; // 9:16 aspect ratio

  return (
    <>
      <div className="flex h-full font-sans text-gray-800 bg-gray-100">
        <VideoToolbox
            dispatch={dispatch}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-200 overflow-auto">
            <VideoPreview slide={selectedSlide} dimensions={videoDimensions} />
            <Timeline
                slides={state.slides}
                selectedSlideId={selectedSlideId}
                onSelectSlide={handleSelectSlide}
                onAddSlide={handleAddSlide}
            />
        </main>
        <VideoPropertiesPanel
            selectedSlide={selectedSlide}
            dispatch={dispatch}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
        />
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">{loadingMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};
