'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { generateCaption } from '@/services/openai';
import Image from 'next/image';
import Timer from './Timer';

const CaptionInput: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [suggestedCaption, setSuggestedCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate caption using OpenAI API
  const generateSuggestedCaption = async () => {
    setIsGenerating(true);
    updateState({ isGeneratingCaption: true });
    
    try {
      // Get client personality based on client type
      let clientName = state.clientName || '';
      let clientPersonality = state.clientPersonality || '';
      
      // Fallback to default values if not available in state
      if (!clientName || !clientPersonality) {
        if (state.clientType === 'Fashion') {
          clientName = 'LoveSummer';
          clientPersonality = 'Appreciative';
        } else if (state.clientType === 'F&B') {
          clientName = 'GoodFood';
          clientPersonality = 'Outspoken';
        } else if (state.clientType === 'Barbershop') {
          clientName = 'Gentleman Palace';
          clientPersonality = 'Technical';
        }
      }
      
      // Call OpenAI API to generate caption
      const caption = await generateCaption({
        headline: state.headline,
        usp: state.usp,
        cta: state.cta,
        clientType: state.clientType,
        clientName,
        clientPersonality
      });
      
      setSuggestedCaption(caption);
    } catch (error) {
      console.error('Error generating caption:', error);
      
      // Fallback to a basic caption if API call fails
      const clientTypeEmojis: Record<string, string[]> = {
        'Fashion': ['👗', '✨', '💃'],
        'F&B': ['🍜', '🔥', '😋'],
        'Barbershop': ['💈', '✂️', '👔']
      };
      
      const emojis = clientTypeEmojis[state.clientType] || ['🎯', '🚀', '💯'];
      
      let caption = '';
      
      if (state.clientType === 'Fashion') {
        caption = `${emojis[0]} Elevate your style with our ${state.headline}! ${emojis[1]}\n\n${state.usp} Don't miss out on looking and feeling your best. ${state.cta} ${emojis[2]}`;
      } else if (state.clientType === 'F&B') {
        caption = `${emojis[0]} Introducing: ${state.headline} that will blow your taste buds away! ${emojis[1]}\n\n${state.usp} Ready for a flavor explosion? ${state.cta} ${emojis[2]}`;
      } else {
        caption = `${emojis[0]} ${state.headline} - for those who appreciate precision and style. ${emojis[1]}\n\n${state.usp} Looking sharp has never been easier. ${state.cta} ${emojis[2]}`;
      }
      
      setSuggestedCaption(caption);
      alert('There was an error generating the caption. A fallback caption has been created instead.');
    } finally {
      setIsGenerating(false);
      updateState({ isGeneratingCaption: false });
    }
  };

  useEffect(() => {
    // Auto-generate caption suggestion when component mounts
    generateSuggestedCaption();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseSuggestion = () => {
    setCaption(suggestedCaption);
  };

  const handleCreateMockup = () => {
    if (!caption.trim()) {
      setError('Silakan masukkan caption sebelum melanjutkan');
      return;
    }
    
    updateState({
      captionText: caption,
      currentStep: 6
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 p-4">
      
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-16">
        <h1 className="text-4xl font-extrabold text-black tracking-tight mb-2">Tulis Caption Anda</h1>
        <p className="text-gray-700 mb-6">
          Buat caption yang menarik untuk postingan Instagram Anda
        </p>
        
        {state.generatedImage && (
          <div className="mb-6 bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Pratinjau Gambar yang Dihasilkan:</p>
            <div className="w-full aspect-square bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
              {state.generatedImage ? (
                <Image 
                  src={state.generatedImage} 
                  alt="Generated campaign image" 
                  className="w-full h-full object-contain"
                  width={1024}
                  height={1024}
                  onError={(e) => {
                    console.error('Error loading image in CaptionInput');
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              ) : (
                <span className="text-gray-400">Image Preview</span>
              )}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="caption" className="block text-sm font-semibold text-gray-800 mb-1">
            Caption Instagram
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setError('');
            }}
            rows={6}
            className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition`}
            placeholder="Tulis caption Anda di sini..."
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        {suggestedCaption && (
          <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-black tracking-tight">Caption yang Disarankan AI</h3>
              <button
                onClick={handleUseSuggestion}
                className="text-sm bg-black hover:bg-yellow-500 text-white hover:text-black px-3 py-1 rounded-lg transition duration-300"
              >
                Gunakan Ini
              </button>
            </div>
            <p className="text-gray-700 text-sm">{suggestedCaption}</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="mb-6 p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-700">Menghasilkan saran caption...</p>
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={generateSuggestedCaption}
            disabled={isGenerating}
            className="flex-1 bg-gray-200 hover:bg-yellow-500 text-gray-800 hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menghasilkan...
              </>
            ) : (
              'Hasilkan Ulang Saran'
            )}
          </button>
          
          <button
            onClick={handleCreateMockup}
            className="flex-1 bg-black hover:bg-yellow-500 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Buat Mockup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptionInput;
