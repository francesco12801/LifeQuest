import React, { useState } from 'react';
import { Activity, Moon, Droplet } from "lucide-react";

function VitaVerseApp() {
  // Health data state
  const [healthData, setHealthData] = useState({
    weight: 70,
    sleepHours: 7,
    energyLevel: 8,
    exercise: 30,
    waterIntake: 2000
  });
  
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // Function to connect MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Set address and connection state
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        
        // Add listener for disconnect or account change
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            // User disconnected wallet
            setWalletConnected(false);
            setWalletAddress('');
          } else {
            // User changed account
            setWalletAddress(accounts[0]);
          }
        });
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      alert("MetaMask not detected! Please install the MetaMask extension to continue.");
    }
  };

  // Badges state
  const [badges] = useState([
    { id: 1, name: "Early Bird", achieved: true, icon: Moon },
    { id: 2, name: "Workout Warrior", achieved: false, icon: Activity },
    { id: 3, name: "Hydration Hero", achieved: true, icon: Droplet }
  ]);

  // Chart data
  const chartData = [
    { day: 'Mon', weight: 70, sleep: 7 },
    { day: 'Tue', weight: 69.8, sleep: 7.5 },
    { day: 'Wed', weight: 69.5, sleep: 8 },
    { day: 'Thu', weight: 69.3, sleep: 6.5 },
    { day: 'Fri', weight: 69.1, sleep: 7 },
  ];

  const handleInputChange = (field, value) => {
    setHealthData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 w-full">
      <div className="w-full px-6 py-6">
        {/* Header with wallet connect */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="bg-indigo-500 rounded-full p-3 mr-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12L9 16L19 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-indigo-600">VitaVerse</h1>
          </div>
          
          <button 
            onClick={connectWallet}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M22 10H2" />
              <path d="M7 15h0" />
            </svg>
            <span className="font-medium">Connect Wallet</span>
          </button>
        </div>
        
        {/* App description */}
        <p className="text-center text-gray-600 mb-6">Your personal NFT for wellness</p>
        
        {/* Level badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span className="font-medium">Level 1</span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          {/* Daily metrics card */}
          <div className="bg-white rounded-xl shadow-sm p-6 w-full">
            <div className="flex items-center mb-4 text-indigo-700">
              <Activity size={20} className="mr-2" />
              <h2 className="text-xl font-semibold">Daily Metrics</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={healthData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sleep hours</label>
                <div className="relative">
                  <input
                    type="number"
                    value={healthData.sleepHours}
                    onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                    className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Energy level (1-10)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={healthData.energyLevel}
                    onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                    className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="ml-2 text-indigo-700 font-medium">{healthData.energyLevel}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise (minutes)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={healthData.exercise}
                    onChange={(e) => handleInputChange('exercise', e.target.value)}
                    className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Water (ml)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={healthData.waterIntake}
                    onChange={(e) => handleInputChange('waterIntake', e.target.value)}
                    className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart card */}
          <div className="bg-white rounded-xl shadow-sm p-6 w-full">
            <div className="flex items-center mb-4 text-indigo-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <h2 className="text-xl font-semibold">Weekly Trends</h2>
            </div>
            
            <div className="h-64 w-full">
              {/* Chart placeholder - In a real application, this would be the recharts component */}
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* X and Y axes */}
                <line x1="40" y1="10" x2="40" y2="180" stroke="#d1d5db" strokeWidth="1" />
                <line x1="40" y1="180" x2="390" y2="180" stroke="#d1d5db" strokeWidth="1" />
                
                {/* X axis labels */}
                <text x="70" y="195" textAnchor="middle" fontSize="12" fill="#6b7280">Mon</text>
                <text x="140" y="195" textAnchor="middle" fontSize="12" fill="#6b7280">Tue</text>
                <text x="210" y="195" textAnchor="middle" fontSize="12" fill="#6b7280">Wed</text>
                <text x="280" y="195" textAnchor="middle" fontSize="12" fill="#6b7280">Thu</text>
                <text x="350" y="195" textAnchor="middle" fontSize="12" fill="#6b7280">Fri</text>
                
                {/* Y axis labels */}
                <text x="30" y="20" textAnchor="end" fontSize="12" fill="#6b7280">80</text>
                <text x="30" y="60" textAnchor="end" fontSize="12" fill="#6b7280">60</text>
                <text x="30" y="100" textAnchor="end" fontSize="12" fill="#6b7280">40</text>
                <text x="30" y="140" textAnchor="end" fontSize="12" fill="#6b7280">20</text>
                <text x="30" y="180" textAnchor="end" fontSize="12" fill="#6b7280">0</text>
                
                {/* Grid lines */}
                <line x1="40" y1="20" x2="390" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="60" x2="390" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="100" x2="390" y2="100" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="140" x2="390" y2="140" stroke="#f3f4f6" strokeWidth="1" />
                
                {/* Blue line for weight */}
                <polyline 
                  points="70,30 140,31 210,32 280,33 350,34" 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="2" 
                />
                
                {/* Green line for sleep */}
                <polyline 
                  points="70,152 140,145 210,138 280,152 350,152" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                />
                
                {/* Data points - blue */}
                <circle cx="70" cy="30" r="4" fill="#4f46e5" />
                <circle cx="140" cy="31" r="4" fill="#4f46e5" />
                <circle cx="210" cy="32" r="4" fill="#4f46e5" />
                <circle cx="280" cy="33" r="4" fill="#4f46e5" />
                <circle cx="350" cy="34" r="4" fill="#4f46e5" />
                
                {/* Data points - green */}
                <circle cx="70" cy="152" r="4" fill="#10b981" />
                <circle cx="140" cy="145" r="4" fill="#10b981" />
                <circle cx="210" cy="138" r="4" fill="#10b981" />
                <circle cx="280" cy="152" r="4" fill="#10b981" />
                <circle cx="350" cy="152" r="4" fill="#10b981" />
                
                {/* Legend */}
                <circle cx="70" cy="195" r="4" fill="#4f46e5" />
                <text x="80" y="198" fontSize="10" fill="#4f46e5">Weight (kg)</text>
                <circle cx="150" cy="195" r="4" fill="#10b981" />
                <text x="160" y="198" fontSize="10" fill="#10b981">Sleep hours</text>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Badges section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 w-full">
          <div className="flex items-center mb-6 text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <h2 className="text-xl font-semibold">Your Badges</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {badges.map(badge => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-6 rounded-xl text-center ${
                    badge.achieved ? 'bg-indigo-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-center mb-4">
                    <div className={`rounded-full p-3 ${
                      badge.achieved ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon size={24} />
                    </div>
                  </div>
                  <p className={`font-medium ${
                    badge.achieved ? 'text-indigo-700' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      badge.achieved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {badge.achieved ? 'Completed' : 'In progress'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitaVerseApp;