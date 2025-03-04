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
            <h3 className="text-indigo-800 font-medium">Current Streak</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {streakDays} {streakDays === 1 ? "day" : "days"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {daysSinceLastUpdate === 0
              ? "Updated today"
              : `Last update: ${daysSinceLastUpdate} ${
                  daysSinceLastUpdate === 1 ? "day" : "days"
                } ago`}
          </p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award className="text-indigo-600 mr-2" size={20} />
            <h3 className="text-indigo-800 font-medium">Badges Earned</h3>
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
            <h3 className="text-indigo-800 font-medium">Hydration Level</h3>
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
            <h3 className="text-indigo-800 font-medium">Sleep Quality</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {Math.min(100, (healthData.sleepHours / 10 / 8) * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {(healthData.sleepHours / 10).toFixed(1)}/8 hours recommended
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
        {/* Wellness Consistency Score */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="text-indigo-600 mr-2" size={20} />
            <h3 className="text-indigo-800 font-medium">
              Wellness Consistency Score
            </h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {(() => {
              // Punteggio base dalla streak
              let base = Math.min(100, streakDays * 10);

              // Bonus per valori salutari
              if (healthData.waterIntake >= 2000) base += 5;
              if (healthData.sleepHours / 10 >= 7) base += 5;
              if (healthData.exercise >= 30) base += 5;

              // Cap al 100%
              return Math.min(100, base);
            })()}
            %
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Based on update frequency and data quality
          </p>
        </div>

        {/* Energy Level */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="text-indigo-600 mr-2" size={20} />
            <h3 className="text-indigo-800 font-medium">Energy Level</h3>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mr-3">
              <div
                className="bg-indigo-600 h-4 rounded-full flex items-center justify-center text-xs text-white font-bold"
                style={{ width: `${(healthData.energyLevel / 10) * 100}%` }}
              >
                {healthData.energyLevel}/10
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {healthData.energyLevel >= 8
              ? "Excellent energy!"
              : healthData.energyLevel >= 6
              ? "Good energy level"
              : healthData.energyLevel >= 4
              ? "Moderate energy"
              : "Low energy - get some rest"}
          </p>
        </div>
      </div>
      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-indigo-800 mb-4">
          Personalized Wellness Tips
        </h3>

        <div className="space-y-4">
          {healthData.waterIntake < 2000 && (
            <div className="flex bg-white p-3 rounded-lg shadow-sm">
              <Droplet className="text-blue-500 mr-3 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-medium text-gray-800">
                  Increase Your Hydration
                </h4>
                <p className="text-gray-600 text-sm">
                  Try to drink at least 2000ml of water daily. Set reminders
                  throughout the day.
                </p>
              </div>
            </div>
          )}

          {healthData.sleepHours / 10 < 7 && (
            <div className="flex bg-white p-3 rounded-lg shadow-sm">
              <Moon className="text-indigo-500 mr-3 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-medium text-gray-800">
                  Improve Sleep Quality
                </h4>
                <p className="text-gray-600 text-sm">
                  Aim for 7-8 hours of sleep each night for optimal health
                  benefits.
                </p>
              </div>
            </div>
          )}

          {healthData.exercise < 30 && (
            <div className="flex bg-white p-3 rounded-lg shadow-sm">
              <Activity
                className="text-green-500 mr-3 flex-shrink-0"
                size={24}
              />
              <div>
                <h4 className="font-medium text-gray-800">
                  Increase Activity Level
                </h4>
                <p className="text-gray-600 text-sm">
                  Try to get at least 30 minutes of exercise daily for better
                  health.
                </p>
              </div>
            </div>
          )}

          {streakDays < 3 && (
            <div className="flex bg-white p-3 rounded-lg shadow-sm">
              <Award className="text-yellow-500 mr-3 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-medium text-gray-800">Build Your Streak</h4>
                <p className="text-gray-600 text-sm">
                  Update your data daily to build your streak and earn more
                  badges!
                </p>
              </div>
            </div>
          )}

          {/* Se tutti i parametri sono buoni, mostra un messaggio di congratulazioni */}
          {healthData.waterIntake >= 2000 &&
            healthData.sleepHours / 10 >= 7 &&
            healthData.exercise >= 30 &&
            streakDays >= 3 && (
              <div className="flex bg-white p-3 rounded-lg shadow-sm">
                <Award
                  className="text-green-500 mr-3 flex-shrink-0"
                  size={24}
                />
                <div>
                  <h4 className="font-medium text-gray-800">Excellent Work!</h4>
                  <p className="text-gray-600 text-sm">
                    You're doing great in all wellness categories. Keep it up!
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-indigo-800 mb-4">
          Today vs Average
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Water Intake</span>
              <div>
                <span className="text-sm font-medium text-indigo-700">
                  {healthData.waterIntake} ml
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs avg {userStats.averageWaterIntake} ml
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${
                  healthData.waterIntake >= userStats.averageWaterIntake
                    ? "bg-green-500"
                    : "bg-indigo-600"
                } h-2 rounded-full`}
                style={{
                  width: `${Math.min(
                    100,
                    (healthData.waterIntake / 2500) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Sleep Hours</span>
              <div>
                <span className="text-sm font-medium text-indigo-700">
                  {(healthData.sleepHours / 10).toFixed(1)} hrs
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs avg {userStats.averageSleepHours.toFixed(1)} hrs
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${
                  healthData.sleepHours / 10 >= userStats.averageSleepHours
                    ? "bg-green-500"
                    : "bg-indigo-600"
                } h-2 rounded-full`}
                style={{
                  width: `${Math.min(
                    100,
                    (healthData.sleepHours / 10 / 8) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Exercise Minutes</span>
              <div>
                <span className="text-sm font-medium text-indigo-700">
                  {healthData.exercise} min
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs avg {userStats.averageExerciseMinutes} min
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${
                  healthData.exercise >= userStats.averageExerciseMinutes
                    ? "bg-green-500"
                    : "bg-indigo-600"
                } h-2 rounded-full`}
                style={{
                  width: `${Math.min(100, (healthData.exercise / 60) * 100)}%`,
                }}
              ></div>
            </div>
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
          As a participant in the StarPeace P2P Marketplace, the following
          metrics will be evaluated:
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
