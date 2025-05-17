'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';

const PasswordProtection: React.FC = () => {
  const { setIsAuthenticated } = useAppContext();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // The correct password - in a real app, this would be stored securely on the server
  // and validated through an API call
  const correctPassword = 'jadidigitalmarketer2025';
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password.trim() === '') {
      setError('Silakan masukkan password');
      return;
    }
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      setError('Password salah. Silakan coba lagi.');
    }
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
          Silakan masukkan password untuk melanjutkan
        </p>

        {/* PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="text-left space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          
          {/* BUTTON */}
          <button 
            type="submit" 
            className="w-full bg-black hover:bg-yellow-500 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;
