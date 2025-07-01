import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Starry background component for a more magical feel
const StarBackground = () => {
  const starsRef = useRef(null);

  useEffect(() => {
    const createStars = () => {
      const container = starsRef.current;
      if (!container) return;
      container.innerHTML = ''; // Clear existing stars
      const numStars = 100; // Number of stars
      for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'absolute bg-white rounded-full opacity-0 animate-twinkle';
        const size = Math.random() * 2 + 0.5; // Star size between 0.5px and 2.5px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`; // Random delay for twinkling
        star.style.animationDuration = `${Math.random() * 3 + 2}s`; // Random duration
        container.appendChild(star);
      }
    };

    createStars();
    // Re-create stars on window resize to ensure they fill the space
    window.addEventListener('resize', createStars);
    return () => window.removeEventListener('resize', createStars);
  }, []);

  return (
    <div ref={starsRef} className="absolute inset-0 overflow-hidden z-0 pointer-events-none"></div>
  );
};


function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(null);
  // New state for the image modal
  const [selectedImage, setSelectedImage] = useState(null); // Stores the image object to display in modal

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    const tempImageId = Date.now();
    setImages([{ id: tempImageId, prompt: prompt, data: null, timestamp: new Date().toISOString(), isLoading: true }, ...images]);

    try {
      // IMPORTANT: Replace 'http://localhost:3001' with your actual backend API URL for deployment.
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/generate-image`, { prompt });

      const newImage = {
        id: tempImageId,
        prompt: prompt,
        data: `data:image/png;base64,${response.data.image}`,
        timestamp: new Date().toISOString(),
        isLoading: false
      };

      setImages(currentImages => currentImages.map(img =>
        img.id === tempImageId ? newImage : img
      ));
      setPrompt('');
    } catch (err) {
      setError('Failed to generate image. Please ensure your backend is running and try again.');
      console.error('Error generating image:', err);
      setImages(currentImages => currentImages.filter(img => img.id !== tempImageId));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedPrompt(text);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      console.log('Please manually copy the prompt:', text);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const clearGallery = () => {
    setImages([]);
    setError(null);
  };

  // Functions to handle modal open/close
  const openImageModal = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset'; // Re-enable scrolling
  };

  // Function to download the image
  const downloadImage = (imageData, promptText) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `ai-image-${promptText.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_') || 'generated'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-gray-900 text-white flex flex-col items-center py-8 px-4 font-inter antialiased relative">
      {/* Starry background */}
      <StarBackground />

      {/* Tailwind CSS CDN for Inter font (ensure this is in your public/index.html or main CSS) */}
      {/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" /> */}

      <header className="w-full max-w-4xl text-center mb-12 relative z-10 overflow-hidden">
        <h1 className="text-6xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-green-500 animate-gradient-pulse drop-shadow-lg">
          Free AI Image Generator
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 relative z-10 font-light italic">
          No login required - Generate as many images as you want!
        </p>
        {/* Subtle background glow/effect */}
        <div className="absolute inset-0 -top-10 -left-10 w-48 h-48 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute inset-0 -bottom-10 -right-10 w-48 h-48 bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </header>

      <div className="input-section w-full max-w-2xl bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-xl p-8 rounded-3xl shadow-3xl border border-gray-700 flex flex-col items-center transform transition-all duration-500 hover:scale-[1.01] relative z-10">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to conjure: a cyberpunk city at sunset, a magical forest with glowing flora, an astronaut petting a space cat..."
          rows={4}
          className="w-full p-4 rounded-xl border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:border-transparent resize-y transition-all duration-300 text-lg shadow-inner"
        />
        <button
          onClick={generateImage}
          disabled={isGenerating}
          className="mt-8 px-10 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-full shadow-lg hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xl tracking-wide flex items-center justify-center"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Masterpiece'
          )}
        </button>
        {error && <p className="text-red-400 mt-6 text-base animate-fade-in">{error}</p>}
      </div>

      {images.length > 0 && (
        <button
          onClick={clearGallery}
          className="mt-8 px-6 py-2 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors duration-200 relative z-10 shadow-md"
        >
          Clear Gallery
        </button>
      )}

      <div className="gallery mt-16 w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-4 relative z-10">
        {images.length === 0 && !isGenerating && (
          <p className="col-span-full text-center text-gray-400 text-xl italic animate-fade-in">
            Your generated masterpieces will appear here. Let your imagination flow!
          </p>
        )}
        {images.map((img) => (
          <div
            key={img.id}
            className="image-card bg-gray-800 bg-opacity-70 rounded-2xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 relative group animate-card-appear cursor-pointer"
            onClick={() => !img.isLoading && openImageModal(img)} // Open modal only if not loading
          >
            {img.isLoading ? (
              <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-700 flex items-center justify-center rounded-t-xl animate-pulse">
                <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <img
                src={img.data}
                alt={img.prompt}
                className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-t-xl transition-opacity duration-500 opacity-0 animate-fade-in-image"
                onLoad={(e) => e.target.classList.remove('opacity-0')}
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/4a4a4a/e0e0e0?text=Image+Error"; }}
              />
            )}
            <div className="p-4">
              <p className="text-gray-300 text-base break-words leading-relaxed mb-2">
                <span className="font-semibold text-cyan-300">Prompt:</span> {img.prompt}
              </p>
              <p className="text-gray-500 text-xs">
                Generated: {new Date(img.timestamp).toLocaleString()}
              </p>
            </div>
            {/* Overlay for hover effect with copy button */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-2">
                {img.prompt}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); handleCopyPrompt(img.prompt); }} // Stop propagation to prevent modal from opening
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 self-start hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {copiedPrompt === img.prompt ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fade-in-modal"
          onClick={closeImageModal} // Close modal when clicking outside the image
        >
          <div
            className="relative bg-gray-900 rounded-lg shadow-2xl p-4 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl font-bold p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200 z-10"
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={selectedImage.data}
              alt={selectedImage.prompt}
              className="max-w-full max-h-[70vh] object-contain rounded-md mb-4 shadow-lg"
            />
            <p className="text-gray-300 text-lg text-center mb-4 px-4 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="font-semibold text-cyan-300">Prompt:</span> {selectedImage.prompt}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleCopyPrompt(selectedImage.prompt)}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-base hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                {copiedPrompt === selectedImage.prompt ? 'Copied!' : 'Copy Prompt'}
              </button>
              <button
                onClick={() => downloadImage(selectedImage.data, selectedImage.prompt)}
                className="bg-green-600 text-white px-5 py-2 rounded-full text-base hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
