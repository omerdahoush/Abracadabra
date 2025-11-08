
import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-3 mt-4">
    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-purple-300">AI is working its magic...</p>
  </div>
);
