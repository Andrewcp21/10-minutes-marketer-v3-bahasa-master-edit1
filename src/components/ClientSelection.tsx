'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';

interface ClientOption {
  name: string;
  type: string;
  personality: string;
  image: string;
  description: string;
}

const ClientSelection: React.FC = () => {
  const { updateState } = useAppContext();

  // Use a fixed version string instead of timestamp for cache busting
  const version = 'v1';
  
  const clients: ClientOption[] = [
    {
      name: 'LoveSummer',
      type: 'Fashion',
      personality: 'Appreciative',
      image: `/clients/lovesummer.png?v=${version}`,
      description: 'Brand fashion untuk wanita yang suka merasa stylish dan empowered'
    },
    {
      name: 'GoodFood',
      type: 'F&B',
      personality: 'Outspoken',
      image: `/clients/goodfood.png?v=${version}`,
      description: 'Bisnis makanan & minuman yang berani dan inovatif dengan fokus pada cita rasa'
    },
    {
      name: 'Gentleman Palace',
      type: 'Barbershop',
      personality: 'Technical',
      image: `/clients/gentlemanpalace.png?v=${version}`,
      description: 'Barbershop minimalis yang fokus pada presisi dan grooming yang bersih'
    }
  ];

  const handleSelectClient = (client: ClientOption) => {
    updateState({
      clientName: client.name,
      clientType: client.type,
      clientPersonality: client.personality,
      currentStep: 3
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-black tracking-tight text-center mb-6">Pilih Klien Anda</h1>
        <p className="text-gray-700 text-center mb-8">
          Pilih klien untuk bekerja sama dalam kampanye media sosial mereka
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div 
              key={client.name}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectClient(client)}
            >
              <div className="w-full h-48 relative mb-4 rounded-md overflow-hidden bg-gray-100">
                <Image 
                  src={client.image}
                  alt={`${client.name} logo`}
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    console.error(`Error loading image: ${client.image}`);
                    // Fallback to first letter if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'absolute inset-0 flex items-center justify-center text-gray-400';
                      fallback.innerHTML = `<span class="text-6xl">${client.name[0]}</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <h3 className="text-xl font-extrabold text-black tracking-tight">{client.name}</h3>
              <p className="text-sm font-semibold text-gray-800 mb-2">{client.type} • {client.personality}</p>
              <p className="text-gray-700">{client.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSelection;
