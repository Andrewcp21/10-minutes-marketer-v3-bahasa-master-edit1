'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { generateImage } from '@/services/openai';
import Timer from './Timer';
import Image from 'next/image';

const CampaignForm: React.FC = () => {
  const { state, updateState } = useAppContext();
  const [formData, setFormData] = useState({
    headline: '',
    usp: '',
    cta: '',
    visualDescription: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.headline.trim()) {
      newErrors.headline = 'Headline is required';
    }
    
    if (!formData.usp.trim()) {
      newErrors.usp = 'USP is required';
    }
    
    if (!formData.cta.trim()) {
      newErrors.cta = 'CTA is required';
    }
    
    if (!formData.visualDescription.trim()) {
      newErrors.visualDescription = 'Visual description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePoster = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Build image prompt based on form data specifically for gpt-image-1 model
    let clientSpecificDetails = '';
    
    if (state.clientType === 'Fashion') {
      clientSpecificDetails = 'Include stylish clothing, modern fashion elements, and an elegant aesthetic. The image should convey sophistication and trendy appeal.';
    } else if (state.clientType === 'F&B') {
      clientSpecificDetails = 'Include appetizing food imagery, vibrant colors, and mouth-watering presentation. The image should make viewers hungry and excited about the food.';
    } else if (state.clientType === 'Barbershop') {
      clientSpecificDetails = 'Include clean, precise grooming imagery, modern barbershop elements, and a professional aesthetic. The image should convey precision and style.';
    }
    
    const imagePrompt = `Create a professional Instagram-style poster for a ${state.clientType} brand with the following details:

Headline: "${formData.headline}"
Unique Selling Proposition: "${formData.usp}"
Call to Action: "${formData.cta}"
Visual Style: ${formData.visualDescription}

${clientSpecificDetails}

IMPORTANT SPECIFICATIONS:
- The image should be in square format with dimensions 1024x1024 pixels
- Ensure all text and visual elements have sufficient padding from the edges (at least 100 pixels)
- Make sure no important elements are cut off or too close to the borders

The image should be vibrant, visually striking, and suitable for social media marketing. The composition should be clean with balanced elements and professional typography. Create a realistic, high-quality image that would look authentic on Instagram.`;
    
    // Update global state with form data and set loading state
    updateState({
      headline: formData.headline,
      usp: formData.usp,
      cta: formData.cta,
      visualDescription: formData.visualDescription,
      imagePrompt: imagePrompt,
      isGeneratingImage: true
    });
    
    try {
      console.log('Starting image generation with prompt:', imagePrompt);
      
      // Call OpenAI API to generate image with client type
      const imageUrl = await generateImage(imagePrompt, state.clientType);
      
      console.log('Image generation successful, URL:', imageUrl);
      
      // Check if the returned URL is a placeholder (indicating an error)
      if (imageUrl.includes('/placeholder-image.jpg')) {
        throw new Error('Received placeholder image from generation service');
      }
      
      // Log the image URL for debugging
      console.log('Using image URL:', imageUrl);
      
      // Show the image preview instead of immediately proceeding to next step
      setImagePreview(imageUrl);
      setShowPreview(true);
      updateState({
        generatedImage: imageUrl,
        isGeneratingImage: false
      });
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Get client-specific placeholder based on client type
      let placeholderUrl = '/placeholder-image.jpg';
      
      if (state.clientType === 'Fashion') {
        placeholderUrl = '/placeholders/fashion.jpg';
      } else if (state.clientType === 'F&B') {
        placeholderUrl = '/placeholders/food.jpg';
      } else if (state.clientType === 'Barbershop') {
        placeholderUrl = '/placeholders/barbershop.jpg';
      }
      
      setImagePreview(placeholderUrl);
      setShowPreview(true);
      updateState({
        generatedImage: placeholderUrl,
        isGeneratingImage: false
      });
      
      // Use a more subtle notification instead of an alert
      console.warn('Using placeholder image due to generation error');
    }
  };

  // Function to proceed to caption screen
  const handleProceedToCaptionScreen = () => {
    updateState({
      currentStep: 5
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 p-4">
      
      {showPreview ? (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-16">
          <h1 className="text-4xl font-extrabold text-black tracking-tight mb-6">Review Gambar yang Dihasilkan</h1>
          
          <div className="mb-6 bg-gray-100 p-4 rounded-lg">
            <div className="w-full aspect-square relative rounded-md overflow-hidden">
              {imagePreview && (
                <Image 
                  src={imagePreview}
                  alt="Generated poster image"
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={() => {
                    console.error('Error loading image from URL:', imagePreview);
                    // If image fails to load, use a placeholder image without showing an alert
                    console.warn('Using placeholder image due to loading error');
                    
                    // Always use the main placeholder image to avoid missing file errors
                    setImagePreview('/placeholder-image.jpg');
                  }}
                />
              )}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 bg-gray-200 hover:bg-yellow-500 text-gray-800 hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Kembali ke Formulir
            </button>
            
            <button
              onClick={handleProceedToCaptionScreen}
              className="flex-1 bg-black hover:bg-yellow-500 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Lanjutkan ke Caption
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-16">
          <h1 className="text-4xl font-extrabold text-black tracking-tight mb-2">Campaign Brief</h1>
          <p className="text-gray-700 mb-2">
            Isi detail untuk kampanye {state.clientType} {state.clientName}
          </p>
          
          {/* Client Brief Section */}
          <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-black italic mb-6 text-gray-700">
            <h3 className="font-extrabold text-black tracking-tight mb-1 not-italic">Brief Klien:</h3>
            {state.clientName === 'LoveSummer' && (
              <p>&quot;Hai! Saya menjalankan brand fashion lokal untuk wanita yang suka merasa stylish dan empowered. Bisakah Anda membuat postingan yang mempromosikan koleksi musim panas baru kami? Kami ingin terkesan elegan, menyenangkan, dan modern.&quot;</p>
            )}
            {state.clientName === 'GoodFood' && (
              <p>&quot;Yo! Saya meluncurkan ramen pedas baru dan saya ingin viral. Buat sesuatu yang berani dan menggugah selera. Jangan ragu - captionnya harus keren. Ini untuk para pecinta rasa.&quot;</p>
            )}
            {state.clientName === 'Gentleman Palace' && (
              <p>&quot;Halo. Saya memiliki barbershop minimalis yang fokus pada presisi dan grooming yang bersih. Saya membutuhkan postingan media sosial untuk promo &quot;Fresh Fade Friday&quot; kami. Buatlah menarik, jelas, dan profesional.&quot;</p>
            )}
            {!['LoveSummer', 'GoodFood', 'Gentleman Palace'].includes(state.clientName) && (
              <p>&quot;Saya membutuhkan postingan media sosial yang menarik untuk bisnis {state.clientType} saya. Mohon buat sesuatu yang sesuai dengan identitas brand kami dan beresonansi dengan target audiens kami.&quot;</p>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="headline" className="block text-sm font-semibold text-gray-800 mb-1">
                Headline
              </label>
              <input
                type="text"
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.headline ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition`}
                placeholder="Masukkan judul yang menarik"
              />
              {errors.headline && <p className="mt-1 text-sm text-red-600">Judul diperlukan</p>}
            </div>
            
            <div>
              <label htmlFor="usp" className="block text-sm font-semibold text-gray-800 mb-1">
                Unique Selling Proposition (USP)
              </label>
              <input
                type="text"
                id="usp"
                name="usp"
                value={formData.usp}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.usp ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition`}
                placeholder="Apa yang membuat produk/layanan ini istimewa?"
              />
              {errors.usp && <p className="mt-1 text-sm text-red-600">USP diperlukan</p>}
            </div>
            
            <div>
              <label htmlFor="cta" className="block text-sm font-semibold text-gray-800 mb-1">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                id="cta"
                name="cta"
                value={formData.cta}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.cta ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition`}
                placeholder="Apa yang harus dilakukan customer selanjutnya?"
              />
              {errors.cta && <p className="mt-1 text-sm text-red-600">CTA diperlukan</p>}
            </div>
            
            <div>
              <label htmlFor="visualDescription" className="block text-sm font-semibold text-gray-800 mb-1">
                Deskripsi Visual
              </label>
              <textarea
                id="visualDescription"
                name="visualDescription"
                value={formData.visualDescription}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border ${errors.visualDescription ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition`}
                placeholder="Jelaskan gaya visual, warna, suasana, dan elemen yang Anda inginkan dalam poster"
              />
              {errors.visualDescription && <p className="mt-1 text-sm text-red-600">Deskripsi visual diperlukan</p>}
            </div>
            
            <button
              onClick={handleGeneratePoster}
              disabled={state.isGeneratingImage}
              className="w-full bg-black hover:bg-yellow-500 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {state.isGeneratingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tim Desain sedang bekerja...
                </>
              ) : (
                'Kirim Brief ke tim Desain'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignForm;
