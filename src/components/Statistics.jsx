import React, { useEffect, useState } from "react";
import { TrendingUp, Activity, Droplet, Moon, Award } from "lucide-react";

const Statistics = ({ platformStats, userStats, healthData, ownedBadges }) => {
  // Stato locale per tenere traccia delle statistiche caricate
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Aggiorna lo stato quando cambiano le props
  useEffect(() => {
    if (healthData && healthData.lastUpdated > 0) {
      setIsDataLoaded(true);
    }
  }, [healthData, userStats, ownedBadges]);

  // Calcola i giorni dall'ultima volta che hai aggiornato i dati
  const calculateDaysSinceLastUpdate = () => {
    if (!healthData.lastUpdated) return 0;
    
    const lastUpdateDate = new Date(healthData.lastUpdated * 1000);
    const currentDate = new Date();
    
    // Calcola la differenza in giorni
    const diffTime = currentDate - lastUpdateDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  
  
  // Calcola i giorni di streak basati sulle informazioni della blockchain
  const streakDays = userStats?.streakDays || 0;
  
  // Calcola i giorni dall'ultimo aggiornamento
  const daysSinceLastUpdate = calculateDaysSinceLastUpdate();
  
  // Determina la percentuale di obiettivi raggiunti
  const totalGoals = 3; // Early Bird, Workout Warrior, Hydration Hero
  const achievedGoals = ownedBadges.length;
  const goalsPercentage = (achievedGoals / totalGoals) * 100;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <div className="flex items-center mb-6 text-indigo-700">
        <TrendingUp size={20} className="mr-2" />
        <h2 className="text-xl font-semibold">Your Wellness Statistics</h2>
      </div>
      
      {/* Statistiche personali dell'utente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="text-indigo-600 mr-2" size={20} />
            <h3 className="text-indigo-800 font-medium">
              Current Streak
            </h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {streakDays} {streakDays === 1 ? 'day' : 'days'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {daysSinceLastUpdate === 0 
              ? "Updated today" 
              : `Last update: ${daysSinceLastUpdate} ${daysSinceLastUpdate === 1 ? 'day' : 'days'} ago`}
          </p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award className="text-indigo-600 mr-2" size={20} />
            <h3 className="text-indigo-800 font-medium">
              Badges Earned
            </h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {achievedGoals}/{totalGoals}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {goalsPercentage.toFixed(0)}% of goals achieved
          </p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Droplet className="text-indigo-600 mr-2" size={20} />
            <h3 className="text-indigo-800 font-medium">
              Hydration Level
            </h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {Math.min(100, (healthData.waterIntake / 2500) * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {healthData.waterIntake}/2500 ml daily
          </p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Moon className="text-indigo-600 mr-2" size={20} />
            <h3 className="text-indigo-800 font-medium">
              Sleep Quality
            </h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {Math.min(100, ((healthData.sleepHours / 10) / 8) * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {(healthData.sleepHours / 10).toFixed(1)}/8 hours recommended
          </p>
        </div>
      </div>
      
      {/* Progress verso i badge */}
      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-indigo-800 mb-4">
          Progress Towards Badges
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Moon size={18} className="mr-2 text-indigo-600" />
                <span className="font-medium text-gray-800">Early Bird</span>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${ownedBadges.some(b => b.type === 'EarlyBird') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'}`}>
                {ownedBadges.some(b => b.type === 'EarlyBird') ? 'Achieved' : `${streakDays}/7 days`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${ownedBadges.some(b => b.type === 'EarlyBird') ? 'bg-green-500' : 'bg-indigo-600'} h-2 rounded-full`} 
                style={{width: `${ownedBadges.some(b => b.type === 'EarlyBird') ? 100 : Math.min(100, (streakDays / 7) * 100)}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Complete 7 consecutive days of updates</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Activity size={18} className="mr-2 text-indigo-600" />
                <span className="font-medium text-gray-800">Workout Warrior</span>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${ownedBadges.some(b => b.type === 'WorkoutWarrior') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'}`}>
                {ownedBadges.some(b => b.type === 'WorkoutWarrior') ? 'Achieved' : `${healthData.exercise}/1000 min`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${ownedBadges.some(b => b.type === 'WorkoutWarrior') ? 'bg-green-500' : 'bg-indigo-600'} h-2 rounded-full`} 
                style={{width: `${ownedBadges.some(b => b.type === 'WorkoutWarrior') ? 100 : Math.min(100, (healthData.exercise / 1000) * 100)}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Achieve 1000 total minutes of exercise</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Droplet size={18} className="mr-2 text-indigo-600" />
                <span className="font-medium text-gray-800">Hydration Hero</span>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${ownedBadges.some(b => b.type === 'HydrationHero') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'}`}>
                {ownedBadges.some(b => b.type === 'HydrationHero') 
                  ? 'Achieved' 
                  : healthData.waterIntake >= 2500 
                    ? `${streakDays}/14 days` 
                    : 'Need 2500ml+'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${ownedBadges.some(b => b.type === 'HydrationHero') ? 'bg-green-500' : 'bg-indigo-600'} h-2 rounded-full`} 
                style={{
                  width: `${ownedBadges.some(b => b.type === 'HydrationHero') 
                    ? 100 
                    : healthData.waterIntake >= 2500 
                      ? Math.min(100, (streakDays / 14) * 100)
                      : Math.min(100, (healthData.waterIntake / 2500) * 100)
                  }%`
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Maintain 2500ml+ water intake for 14 days</p>
          </div>
        </div>
      </div>
      
      {/* Statistiche della piattaforma */}
      <h3 className="text-lg font-medium text-indigo-800 mb-4">
        Platform Statistics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="text-indigo-800 font-medium mb-2">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold text-indigo-700">
            {platformStats.totalTransactions}
          </p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="text-indigo-800 font-medium mb-2">
            Average Fee (Gwei)
          </h3>
          <p className="text-2xl font-bold text-indigo-700">
            {platformStats.averageFee}
          </p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="text-indigo-800 font-medium mb-2">
            Confirmation Time (sec)
          </h3>
          <p className="text-2xl font-bold text-indigo-700">
            {platformStats.confirmationTime}
          </p>
        </div>
      </div>
      
      <div className="bg-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-indigo-800 mb-4">
          Recent Transactions
        </h3>
        
        <div className="space-y-4">
          {platformStats.recentTransactions.length > 0 ? (
            platformStats.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    Badge: {tx.badgeName}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-mono">{tx.from}</span> →{" "}
                    <span className="font-mono">{tx.to}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-indigo-700">{tx.price} YODA</p>
                  <p className="text-xs text-gray-500">{tx.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recent transactions found.
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-amber-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-amber-700 mb-3">
          Performance Metrics
        </h3>
        <p className="text-gray-700 mb-4">
          As a participant in the StarPeace P2P Marketplace, the following metrics
          will be evaluated:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Badge popularity (number of purchases)</li>
          <li>Code organization and deployment techniques</li>
          <li>Ease and intuitiveness of the user interface</li>
          <li>Number of transactions sent and received</li>
          <li>Average transaction fee</li>
          <li>Transaction rate</li>
        </ul>
      </div>
    </div>
  );
};

export default Statistics;