import React from 'react';
import type { Slide } from '../types';

interface VideoPreviewProps {
  slide: Slide | null;
  dimensions: { width: number, height: number };
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ slide, dimensions }) => {
  if (!slide) {
    return (
      <div
        className="shadow-lg bg-gray-300 flex items-center justify-center text-gray-500"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <span>Chọn một slide để chỉnh sửa</span>
      </div>
    );
  }

  const backgroundStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: slide.backgroundColor,
    backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const textStyle: React.CSSProperties = {
    color: slide.text.color,
    fontSize: `${slide.text.fontSize}px`,
    fontWeight: slide.text.fontWeight,
    position: 'absolute',
    top: `${slide.text.y}%`,
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    width: '90%',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  };

  return (
    <div
      className="shadow-lg relative overflow-hidden"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <div style={backgroundStyle} />
      <div style={textStyle}>
        {slide.text.content}
      </div>
    </div>
  );
};