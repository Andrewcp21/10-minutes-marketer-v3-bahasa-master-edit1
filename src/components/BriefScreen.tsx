'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';

const BriefScreen: React.FC = () => {
  const { state, updateState } = useAppContext();

  const clientBriefs: Record<string, string> = {
    'LoveSummer': "Hai! Saya menjalankan brand fashion lokal untuk wanita yang suka merasa stylish dan empowered. Bisakah Anda membuat postingan yang mempromosikan koleksi musim panas baru kami? Kami ingin terkesan elegan, menyenangkan, dan modern.",
    'GoodFood': "Yo! Saya meluncurkan ramen pedas baru dan saya ingin viral. Buat sesuatu yang berani dan menggugah selera. Jangan ragu - captionnya harus keren. Ini untuk para pecinta rasa.",
    'Gentleman Palace': "Halo. Saya memiliki barbershop minimalis yang fokus pada presisi dan grooming yang bersih. Saya membutuhkan postingan media sosial untuk promo &quot;Fresh Fade Friday&quot; kami. Buatlah menarik, jelas, dan profesional."
  };

  const handleStartCampaign = () => {
    // Start the timer
    updateState({
      timerStart: Date.now(),
      currentStep: 4
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-black tracking-tight mb-6">Brief Anda</h1>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
              {state.clientName[0]}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-black tracking-tight">{state.clientName}</h2>
              <p className="text-sm font-semibold text-gray-800">{state.clientType} • {state.clientPersonality}</p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg border-l-4 border-black italic text-gray-700">
            {clientBriefs[state.clientName] || 
              `Saya membutuhkan postingan media sosial yang menarik untuk bisnis ${state.clientType} saya. Mohon buat sesuatu yang sesuai dengan identitas brand kami dan beresonansi dengan target audiens kami.`
            }
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg mb-8 border border-yellow-200">
          <h3 className="font-extrabold text-black tracking-tight mb-2">Tugas Anda</h3>
          <p className="text-gray-700">
            Anda memiliki 10 menit untuk membuat postingan Instagram untuk {state.clientName}. 
            Anda perlu mengisi formulir kampanye, menghasilkan gambar poster, menulis caption, 
            dan mengirimkan pekerjaan Anda untuk mendapatkan umpan balik.
          </p>
        </div>
        
        <button
          onClick={handleStartCampaign}
          className="w-full bg-black hover:bg-yellow-500 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Mulai Membuat Campaign (Timer 10:00)
        </button>
      </div>
    </div>
  );
};

export default BriefScreen;
