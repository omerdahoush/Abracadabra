
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/imageUploader';
import { StyleSelector } from './components/StyleSelector';
import { ResultDisplay } from './components/ResultDisplay';
import { Header } from './components/Header';
import { GenerateButton } from './components/GenerateButton';
import { ART_STYLES, ArtStyle } from './constants';
import { transformImage } from './services/geminiService';
import { fetchAvailableStyles } from './services/styleService';
import { fileToBase64 } from './utils/fileUtils';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [artStyles, setArtStyles] = useState<ArtStyle[]>(ART_STYLES);
  const [isLoadingMoreStyles, setIsLoadingMoreStyles] = useState<boolean>(false);
  const [extraStylesLoaded, setExtraStylesLoaded] = useState<boolean>(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleStyleSelect = useCallback((style: string) => {
    setSelectedStyle(style);
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleLoadMoreStyles = useCallback(async () => {
    setIsLoadingMoreStyles(true);
    try {
      const newStyles = await fetchAvailableStyles();
      setArtStyles(prevStyles => {
        const uniqueNewStyles = newStyles.filter(s => !prevStyles.some(ps => ps.name === s.name));
        return [...prevStyles, ...uniqueNewStyles];
      });
      setExtraStylesLoaded(true);
    } catch (err) {
      console.error("Failed to fetch more styles:", err);
      setError("Could not load more styles. Please try again later.");
    } finally {
      setIsLoadingMoreStyles(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!selectedFile || !selectedStyle) {
      setError('Please select an image and an art style.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const { base64, mimeType } = await fileToBase64(selectedFile);
      const generatedImageData = await transformImage(base64, mimeType, selectedStyle);

      if (generatedImageData) {
        setGeneratedImage(`data:image/jpeg;base64,${generatedImageData}`);
      } else {
        throw new Error('The AI model did not return an image. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const originalFileName = selectedFile?.name.split('.')[0] || 'artistic-creation';

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Header />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Left Column: Controls */}
            <div className="flex flex-col gap-8">
              <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">1. Upload Your Photo</h2>
                <ImageUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />
              </div>

              <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">2. Choose an Art Style</h2>
                <StyleSelector
                  styles={artStyles}
                  selectedStyle={selectedStyle}
                  onStyleSelect={handleStyleSelect}
                  onLoadMore={handleLoadMoreStyles}
                  isLoadingMore={isLoadingMoreStyles}
                  extraStylesLoaded={extraStylesLoaded}
                />
              </div>

              <div className="mt-2">
                <GenerateButton
                  onClick={handleGenerate}
                  disabled={!selectedFile || !selectedStyle || isLoading}
                />
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">3. See the Magic</h2>
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center mb-4">
                  <p className="font-bold">Oops! Something went wrong.</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <ResultDisplay
                isLoading={isLoading}
                generatedImage={generatedImage}
                originalFileName={originalFileName}
                selectedStyle={selectedStyle}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
