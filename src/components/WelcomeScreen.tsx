'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';

const WelcomeScreen: React.FC = () => {
  const { updateState } = useAppContext();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!name.trim()) {
      setError('Silakan masukkan nama Anda untuk melanjutkan');
      return;
    }

    updateState({
      userName: name,
      currentStep: 2,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 p-4 animate-fadeIn">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* LOGO */}
        <div className="flex justify-center mb-2">
          <Image
            src="/Revou-alasan.original.png"
            alt="RevoU Logo"
            width={72}
            height={72}
            className="rounded-full"
            priority
          />
        </div>

        <h1 className="text-4xl font-extrabold text-black tracking-tight">
          10 Minutes Marketer
        </h1>
        <p className="text-gray-700">
          Rasakan pengalaman sebagai Social Media Marketer! Buat postingan Instagram untuk klien dalam waktu kurang dari 10 menit.
        </p>

        {/* INPUT */}
        <div className="text-left space-y-2">
          <label htmlFor="userName" className="block text-sm font-semibold text-gray-800">
            Siapa nama Anda?
          </label>
          <input
            type="text"
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Masukkan nama Anda"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleStart}
          className="w-full bg-black hover:bg-yellow-500 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Mulai
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
