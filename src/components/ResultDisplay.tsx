import React from 'react';

interface ResultDisplayProps {
  originalImage: File | null;
  enhancedImage: string | null;
}

const ImageCard: React.FC<{ src: string; title: string; isPlaceholder?: boolean }> = ({ src, title, isPlaceholder }) => (
  <div className="flex-1 flex flex-col items-center">
    <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
    <div className="w-full aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-600">
      {isPlaceholder ? (
        <span className="text-gray-500">Your image will appear here</span>
      ) : (
        <img src={src} alt={title} className="w-full h-full object-contain" />
      )}
    </div>
  </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, enhancedImage }) => {
  const originalImageUrl = originalImage ? URL.createObjectURL(originalImage) : null;

  if (!originalImageUrl && !enhancedImage) {
      return (
          <div className="h-full flex items-center justify-center bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 p-8">
              <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">Your enhanced image will appear here</p>
                  <p className="text-sm">Upload an image and click "Enhance" to see the magic.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-6">
      {originalImageUrl && (
          <ImageCard src={originalImageUrl} title="Original" />
      )}
      <ImageCard 
        src={enhancedImage || ''} 
        title="Enhanced" 
        isPlaceholder={!enhancedImage} 
      />
    </div>
  );
};