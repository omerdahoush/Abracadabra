import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { MagicWandIcon, DownloadIcon, UndoIcon, RedoIcon } from './components/icons';
import { enhanceProductImage } from './services/geminiService';
import { fileToGenerativePart } from './utils/imageUtils';

interface CreativeSettings {
  productText: string;
  fontStyle: string;
  fontSize: string;
  fontColor: string;
  backgroundStyle: string;
  colorPalette: string;
  specialEffect: string;
}

const initialSettings: CreativeSettings = {
  productText: '',
  fontStyle: 'Inter (Sans-serif)',
  fontSize: 'Medium',
  fontColor: '#FFFFFF',
  backgroundStyle: 'Light Gradient',
  colorPalette: 'Default',
  specialEffect: 'None',
};

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [history, setHistory] = useState<CreativeSettings[]>([initialSettings]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentSettings = history[historyIndex];

  const handleSettingChange = <K extends keyof CreativeSettings>(
    field: K,
    value: CreativeSettings[K]
  ) => {
    const newSettings = { ...currentSettings, [field]: value };
    const newHistory = history.slice(0, historyIndex + 1);
    
    setHistory([...newHistory, newSettings]);
    setHistoryIndex(newHistory.length);
  };
  
  const handleUndo = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
      }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
      }
  };

  const handleImageChange = (file: File | null) => {
    setOriginalImage(file);
    setEnhancedImage(null);
    setError(null);
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setEnhancedImage(null);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(originalImage);
      const settings = history[historyIndex];
      const resultBase64 = await enhanceProductImage(
        imagePart, 
        settings.productText, 
        settings.fontStyle, 
        settings.fontColor, 
        settings.backgroundStyle, 
        settings.fontSize, 
        settings.colorPalette, 
        settings.specialEffect
      );
      setEnhancedImage(`data:${imagePart.inlineData.mimeType};base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      setError('Failed to enhance image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, history, historyIndex]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Abra<span className="text-purple-400">ca</span>dabra
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Transform your product photos into magic with AI.
          </p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-900/10 p-6 sm:p-8 border border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ImageUploader onImageChange={handleImageChange} />
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="backgroundStyle" className="block text-sm font-medium text-gray-300 mb-2">
                        Background Style
                    </label>
                    <select
                        id="backgroundStyle"
                        value={currentSettings.backgroundStyle}
                        onChange={(e) => handleSettingChange('backgroundStyle', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                    >
                        <option>Light Gradient</option>
                        <option>Solid White</option>
                        <option>Solid Black</option>
                        <option>Transparent</option>
                        <option>Wood Grain</option>
                        <option>Marble</option>
                    </select>
                  </div>

                   <div>
                    <label htmlFor="colorPalette" className="block text-sm font-medium text-gray-300 mb-2">
                        Color Palette
                    </label>
                    <select
                        id="colorPalette"
                        value={currentSettings.colorPalette}
                        onChange={(e) => handleSettingChange('colorPalette', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                    >
                        <option>Default</option>
                        <option>Vibrant & Bold</option>
                        <option>Pastel & Soft</option>
                        <option>Monochromatic Blues</option>
                        <option>Earthy Tones</option>
                        <option>Cool & Professional</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="specialEffect" className="block text-sm font-medium text-gray-300 mb-2">
                        Special Effect (Optional)
                    </label>
                    <select
                        id="specialEffect"
                        value={currentSettings.specialEffect}
                        onChange={(e) => handleSettingChange('specialEffect', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                    >
                        <option>None</option>
                        <option>Water Splash</option>
                        <option>Smoke</option>
                        <option>Glitter</option>
                        <option>Bokeh</option>
                        <option>Neon Glow</option>
                        <option>Vintage Film</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="productText" className="block text-sm font-medium text-gray-300 mb-2">
                      Text to Add (Optional)
                    </label>
                    <input
                      type="text"
                      id="productText"
                      value={currentSettings.productText}
                      onChange={(e) => handleSettingChange('productText', e.target.value)}
                      placeholder="e.g., 'New Arrival', 'Eco-Friendly'"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                  </div>
                  {currentSettings.productText && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div>
                        <label htmlFor="fontStyle" className="block text-sm font-medium text-gray-300 mb-2">
                          Font Style
                        </label>
                        <select
                          id="fontStyle"
                          value={currentSettings.fontStyle}
                          onChange={(e) => handleSettingChange('fontStyle', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                        >
                          <option>Inter (Sans-serif)</option>
                          <option>Poppins (Bold)</option>
                          <option>Poppins (Regular)</option>
                          <option>Playfair Display (Serif)</option>
                          <option>Montserrat (Bold)</option>
                          <option>Roboto (Medium)</option>
                          <option>Lato (Bold)</option>
                          <option>Open Sans (Regular)</option>
                          <option>Oswald (Condensed)</option>
                          <option>Merriweather (Serif)</option>
                          <option>Noto Sans (Clean)</option>
                          <option>Source Code Pro (Monospace)</option>
                        </select>
                      </div>
                       <div>
                        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-300 mb-2">
                          Font Size
                        </label>
                        <select
                          id="fontSize"
                          value={currentSettings.fontSize}
                          onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                        >
                          <option>Small</option>
                          <option>Medium</option>
                          <option>Large</option>
                          <option>Extra Large</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="fontColor" className="block text-sm font-medium text-gray-300 mb-2">
                          Font Color
                        </label>
                        <input
                          type="color"
                          id="fontColor"
                          value={currentSettings.fontColor}
                          onChange={(e) => handleSettingChange('fontColor', e.target.value)}
                          className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col">
                <ResultDisplay originalImage={originalImage} enhancedImage={enhancedImage} />
                {isLoading && <Loader />}
                {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-center items-center gap-4">
               <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    className="p-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                    aria-label="Undo"
                  >
                      <UndoIcon className="w-5 h-5" />
                  </button>
                   <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                    aria-label="Redo"
                  >
                      <RedoIcon className="w-5 h-5" />
                  </button>
               </div>

               <button
                type="submit"
                disabled={!originalImage || isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                <MagicWandIcon className="w-5 h-5" />
                {isLoading ? 'Enhancing...' : 'Enhance Image'}
              </button>
              {enhancedImage && !isLoading && (
                  <a
                    href={enhancedImage}
                    download="enhanced-product.png"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    Download
                  </a>
              )}
            </div>
          </form>
        </div>
      </main>
      <footer className="w-full max-w-6xl mx-auto text-center py-6 mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;