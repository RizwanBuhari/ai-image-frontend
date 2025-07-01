import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/generate-image`, { prompt });
      const newImage = {
        prompt: prompt,
        data: `data:image/png;base64,${response.data.image}`,
        timestamp: new Date().toISOString()
      };
      setImages([newImage, ...images]);
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Free AI Image Generator</h1>
        <p>No login required - Generate as many images as you want!</p>
        
        <div className="input-section">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={3}
          />
          <button 
            onClick={generateImage} 
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="gallery">
          {images.map((img, index) => (
            <div key={index} className="image-card">
              <img src={img.data} alt={img.prompt} />
              <p>{img.prompt}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;