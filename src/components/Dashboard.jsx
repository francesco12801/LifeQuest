import React from "react";
import { Activity, Award } from "lucide-react";

const Dashboard = ({ 
  healthData, 
  handleInputChange, 
  saveHealthData, 
  isLoading,
  ownedBadges 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Daily metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6 w-full">
        <div className="flex items-center mb-4 text-indigo-700">
          <Activity size={20} className="mr-2" />
          <h2 className="text-xl font-semibold">Daily Metrics</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={(healthData.weight / 10).toFixed(1)}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sleep Hours
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={(healthData.sleepHours / 10).toFixed(1)}
                onChange={(e) =>
                  handleInputChange("sleepHours", e.target.value)
                }
                className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Energy Level (1-10)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={healthData.energyLevel}
                onChange={(e) =>
                  handleInputChange("energyLevel", e.target.value)
                }
                className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="ml-2 text-indigo-700 font-medium">
                {healthData.energyLevel}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercise (minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                value={healthData.exercise}
                onChange={(e) => handleInputChange("exercise", e.target.value)}
                className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water (ml)
            </label>
            <div className="relative">
              <input
                type="number"
                value={healthData.waterIntake}
                onChange={(e) =>
                  handleInputChange("waterIntake", e.target.value)
                }
                className="w-full rounded-md border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition"
              />
            </div>
          </div>

          <button
            onClick={saveHealthData}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isLoading ? "Saving..." : "Save Data"}
          </button>

          {healthData.lastUpdated > 0 && (
            <p className="text-sm text-gray-500 text-center">
              Last updated:{" "}
              {new Date(healthData.lastUpdated * 1000).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Owned badges */}
      <div className="bg-white rounded-xl shadow-sm p-6 w-full">
        <div className="flex items-center mb-4 text-indigo-700">
          <Award size={20} className="mr-2" />
          <h2 className="text-xl font-semibold">
            Your Badges ({ownedBadges.length})
          </h2>
        </div>

        {ownedBadges.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">
              You don't own any badges yet. Earn them by tracking your wellness!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ownedBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={badge.id} className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                      <BadgeIcon size={18} />
                    </div>
                    <h3 className="font-medium text-indigo-800">
                      {badge.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {badge.description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Earned
                    </span>
                    <span className="text-gray-500">Badge #{badge.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">Weekly Progress</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Exercise minutes</span>
                <span className="font-medium text-indigo-700">
                  {healthData.exercise}/150
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (healthData.exercise / 150) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Water intake</span>
                <span className="font-medium text-indigo-700">
                  {healthData.waterIntake}/2500 ml
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
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
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Sleep quality</span>
                <span className="font-medium text-indigo-700">
                  {(healthData.sleepHours / 10).toFixed(1)}/8 hours
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (healthData.sleepHours / 10 / 8) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;