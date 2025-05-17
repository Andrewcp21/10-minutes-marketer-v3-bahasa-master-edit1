'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { generateFeedback } from '@/services/openai';
import Timer from './Timer';
import Image from 'next/image';

const InstagramMockup: React.FC = () => {
  const { state, updateState } = useAppContext();

  const handleSubmitToClient = async () => {
    // Set loading state
    updateState({ isGeneratingFeedback: true });
    
    try {
      console.log('Submitting to client and generating feedback...');
      
      // Call OpenAI API to generate feedback
      const { feedbackMessage, score } = await generateFeedback({
        clientName: state.clientName,
        clientPersonality: state.clientPersonality,
        clientType: state.clientType,
        headline: state.headline,
        usp: state.usp,
        cta: state.cta,
        captionText: state.captionText,
        elapsedTime: state.elapsedTime
      });
      
      console.log('Feedback generated successfully:', feedbackMessage.substring(0, 50) + '...');
      
      // Apply bonuses to the score
      const timeBonus = state.elapsedTime < 600 ? 10 : 0;
      const completenessBonus = state.headline && state.usp && state.cta && state.captionText ? 10 : 0;
      
      // Calculate final score with bonuses
      const totalScore = Math.min(score + timeBonus + completenessBonus, 100);
      
      // Update state and move to next step
      updateState({
        feedbackMessage: feedbackMessage,
        score: totalScore,
        isGeneratingFeedback: false,
        currentStep: 7
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      
      // The OpenAI service now handles errors and provides fallback feedback,
      // so we'll just call it again with a flag indicating we're in error recovery mode
      try {
        const { feedbackMessage, score } = await generateFeedback({
          clientName: state.clientName,
          clientPersonality: state.clientPersonality,
          clientType: state.clientType,
          headline: state.headline,
          usp: state.usp,
          cta: state.cta,
          captionText: state.captionText,
          elapsedTime: state.elapsedTime
        });
        
        // Apply bonuses to the score
        const timeBonus = state.elapsedTime < 600 ? 10 : 0;
        const completenessBonus = state.headline && state.usp && state.cta && state.captionText ? 10 : 0;
        
        // Calculate final score with bonuses
        const totalScore = Math.min(score + timeBonus + completenessBonus, 100);
        
        updateState({
          feedbackMessage: feedbackMessage,
          score: totalScore,
          isGeneratingFeedback: false,
          currentStep: 7
        });
      } catch (secondError) {
        console.error('Error in fallback feedback generation:', secondError);
        
        // If even the fallback mechanism fails, use hardcoded client-specific feedback in Bahasa Indonesia
        const clientFeedback: Record<string, string> = {
          'LoveSummer': "Hai! Rina dari LoveSummer di sini. Saya sangat terkesan dengan pekerjaan Anda! Strategi pemasaran secara keseluruhan sangat sesuai dengan identitas brand fashion kami - elegan, memberdayakan, dan modern. Copywriting Anda memiliki nada yang hangat dan canggih yang disukai audiens kami, dan headline-nya mudah diingat dan berdampak. Elemen visual dengan indah melengkapi warna dan estetika brand kami, menciptakan postingan yang layak untuk Instagram dan akan menonjol di feed. Call-to-action-nya jelas dan menarik, mendorong keterlibatan langsung. Caption Anda mencapai keseimbangan sempurna antara informatif dan percakapan, dengan jumlah emoji yang tepat untuk meningkatkan keterlibatan tanpa terlihat tidak profesional. Jika saya bisa menyarankan satu perbaikan, mungkin menambahkan referensi musiman yang halus akan membuatnya lebih tepat waktu dan relevan. Secara keseluruhan, ini adalah pekerjaan yang sangat baik yang menangkap esensi LoveSummer!",
          'GoodFood': "Yo! Budi dari GoodFood di sini. Kampanye ini benar-benar KEREN! Dari sudut pandang pemasaran, Anda benar-benar menangkap identitas brand kami yang berani dan langsung. Copywriting memiliki nuansa kasual dan energik yang berbicara langsung kepada audiens kami yang tergila-gila dengan makanan. Headline Anda kuat dan mudah diingat - persis yang kami butuhkan untuk menonjol di media sosial. Deskripsi visual yang Anda buat menggugah selera dan menarik perhatian - warna dan detail penyajian makanan pasti akan membuat orang menginginkan ramen pedas kami! CTA-nya langsung dan menciptakan urgensi, yang persis yang kami inginkan. Caption Anda memiliki sikap dan bahasa gaul yang tepat yang beresonansi dengan demografis kami yang lebih muda. Permainan emoji juga tepat! Satu hal kecil yang perlu dipertimbangkan: mungkin tambahkan sesuatu tentang tingkat kepedasan unik untuk benar-benar menyoroti apa yang membuat ramen kami berbeda. Tapi jujur, ini persis jenis konten yang akan membuat produk kami viral. Respect besar karena memahami vibe GoodFood dengan sempurna!",
          'Gentleman Palace': "Halo. Brian dari Gentleman Palace di sini. Saya telah menganalisis kampanye pemasaran Anda dengan presisi, dan saya senang melaporkan bahwa itu memenuhi standar kualitas kami. Dari perspektif strategis, Anda telah berhasil menyelaraskan dengan identitas brand barbershop minimalis kami melalui elemen desain yang bersih dan presentasi profesional. Copywriting menunjukkan keahlian teknis dan pesan terstruktur yang diharapkan klien kami. Headline Anda ringkas dan informatif, dengan jelas mengkomunikasikan promosi Fresh Fade Friday kami tanpa hiasan yang tidak perlu. Elemen visual yang Anda pilih mempertahankan palet monokromatik kami dan menampilkan presisi layanan grooming kami. Call-to-action tepat sasaran dan memberikan langkah selanjutnya yang jelas untuk pemesanan. Caption Anda mempertahankan keseimbangan profesionalisme yang tepat sambil tetap menarik. Saya sangat menghargai tidak adanya emoji berlebihan, karena ini sesuai dengan pedoman brand kami. Satu rekomendasi adalah menyertakan terminologi teknis yang lebih spesifik terkait dengan potongan rambut unggulan kami untuk lebih memperkuat keahlian. Secara keseluruhan, kampanye ini menunjukkan perhatian terhadap detail dan kualitas profesional yang mewakili Gentleman Palace."
        };
        
        // Calculate fallback score
        const timeBonus = state.elapsedTime < 600 ? 10 : 0;
        const completenessBonus = state.headline && state.usp && state.cta && state.captionText ? 10 : 0;
        // Use a fixed base score instead of random to avoid hydration errors
        const baseScore = 85; // Fixed middle-range score
        const totalScore = Math.min(baseScore + timeBonus + completenessBonus, 100);
        
        // Create a comprehensive default feedback in Bahasa Indonesia if client-specific feedback isn't available
        const defaultFeedback = `Sebagai klien Anda, saya terkesan dengan kampanye ${state.clientType} Anda! 

Strategi pemasaran Anda secara efektif menargetkan audiens kami dengan pesan yang menarik. Copywriting-nya menarik dan selaras dengan suara brand kami. Headline Anda "${state.headline}" menarik perhatian dan mudah diingat. 

Elemen visual yang Anda pilih melengkapi identitas brand kami dan akan menonjol di media sosial. Call-to-action "${state.cta}" jelas dan mendorong keterlibatan. Caption Anda dibuat dengan baik dengan nada dan kepribadian yang tepat untuk audiens kami.

Secara keseluruhan, ini adalah pekerjaan yang sangat baik yang akan membantu kami mencapai tujuan pemasaran. Elemen kampanye bekerja sama secara kohesif untuk menciptakan kehadiran media sosial yang kuat.`;
        
        updateState({
          feedbackMessage: clientFeedback[state.clientName] || defaultFeedback,
          score: totalScore,
          isGeneratingFeedback: false,
          currentStep: 7
        });
        
        // No alert - silently use the fallback feedback
        console.log('Using hardcoded fallback feedback');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 p-4">
      
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 mt-16">
        <h1 className="text-4xl font-extrabold text-black tracking-tight mb-4 text-center">Instagram Preview</h1>
        
        {/* Instagram post mockup */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div className="flex items-center p-3 border-b border-gray-200">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {state.clientName ? (
                <Image 
                  src={`/clients/${state.clientName.toLowerCase()}.png`} 
                  alt={`${state.clientName} logo`}
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                  onError={(e: any) => {
                    console.error(`Error loading client logo: ${state.clientName}`); 
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.className = "w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs";
                      parent.innerHTML = state.clientName ? state.clientName.charAt(0) : "10M";
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                  10M
                </div>
              )}
            </div>
            <div className="ml-2">
              <p className="text-sm font-semibold">{state.clientName || "10min.marketer"}</p>
              <p className="text-xs text-gray-500">Sponsored</p>
            </div>
            <div className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
          </div>
          
          {/* Image */}
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative">
            {state.generatedImage ? (
              <div className="w-full h-full">
                <Image
                  src={state.generatedImage}
                  alt="Generated campaign image"
                  className="w-full h-full object-contain"
                  width={1024}
                  height={1024}
                  onError={(e: any) => {
                    console.error('Error loading image in Instagram mockup');
                    // Use client-specific fallback images from Unsplash
                    let fallbackUrl = '/placeholder-image.jpg';
                    if (state.clientType === 'Fashion') {
                      fallbackUrl = 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop';
                    } else if (state.clientType === 'F&B') {
                      fallbackUrl = 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000&auto=format&fit=crop';
                    } else if (state.clientType === 'Barbershop') {
                      fallbackUrl = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop';
                    }
                    e.currentTarget.src = fallbackUrl;
                  }}
                />
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Tidak ada gambar tersedia</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="p-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-auto text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          
          {/* Caption */}
          <div className="p-3 pt-0">
            <p className="text-sm">
              <span className="font-semibold">{state.clientName || "10min.marketer"}</span>{' '}
              {state.captionText || "No caption provided"}
            </p>
            <p className="text-xs text-gray-500 mt-1">View all 42 comments</p>
            <p className="text-xs text-gray-400 mt-1">2 HOURS AGO</p>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleSubmitToClient}
            disabled={state.isGeneratingFeedback}
            className="w-full bg-black hover:bg-yellow-500 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {state.isGeneratingFeedback ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menunggu Feedback...
              </>
            ) : (
              'Kirim ke Klien'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramMockup;
