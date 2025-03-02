import React, { useState, useEffect } from "react";
import { Award, Users, Activity, Droplet, Moon } from "lucide-react";

const Leaderboard = ({ vitaVerseNFT, account }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!vitaVerseNFT) return;
  
      try {
        setIsLoading(true);
  
        // Chiamata al contratto per ottenere utenti e punteggi
        const [users, scores] = await vitaVerseNFT.getTopHealthUsers(10);
  
        // Filtra gli utenti con indirizzi non validi (0x0000...)
        const filteredUsers = users
          .map((user, index) => ({
            address: user,
            score: scores[index] || 0, // Nessun bisogno di .toNumber()
            streak: 0, // Placeholder
            exercise: 0, // Placeholder
            water: 0, // Placeholder
            sleep: 0, // Placeholder
            name: `User ${index + 1}`, // Nome segnaposto
          }))
          .filter(user => user.address !== "0x0000000000000000000000000000000000000000"); // Rimuove indirizzi vuoti
  
        // Evidenzia l'utente attuale, se presente
        const leaderboardWithCurrentUser = filteredUsers.map(user => ({
          ...user,
          isCurrentUser: user.address.toLowerCase() === account.toLowerCase(),
        }));
  
        setLeaderboardData(leaderboardWithCurrentUser);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard data");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchLeaderboard();
  }, [vitaVerseNFT, account]);
  

  // Funzione per determinare la classe del rank
  const getRankClass = (index) => {
    switch(index) {
      case 0: return "bg-yellow-100 text-yellow-800"; // Gold
      case 1: return "bg-gray-100 text-gray-800"; // Silver
      case 2: return "bg-amber-100 text-amber-800"; // Bronze
      default: return "bg-blue-50 text-blue-800"; // Others
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <div className="flex items-center mb-6 text-indigo-700">
        <Users size={20} className="mr-2" />
        <h2 className="text-xl font-semibold">Healthy Users Leaderboard</h2>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading leaderboard data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <p className="mt-2 text-gray-600">Try again later</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Health Score</th>
                  <th className="px-6 py-3">Streak</th>
                  <th className="px-6 py-3">Exercise</th>
                  <th className="px-6 py-3">Hydration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboardData.map((user, index) => (
                  <tr key={index} className={user.isCurrentUser ? "bg-indigo-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankClass(index)}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                          {user.isCurrentUser && <span className="ml-2 text-xs text-indigo-600">(You)</span>}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[100px]">
                          {user.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-bold">{user.score}</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${user.score}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Moon size={14} className="text-indigo-500 mr-1" />
                        <span className="text-sm text-gray-900">{user.streak} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity size={14} className="text-indigo-500 mr-1" />
                        <span className="text-sm text-gray-900">{user.exercise} min</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Droplet size={14} className="text-indigo-500 mr-1" />
                        <span className="text-sm text-gray-900">{user.water} ml</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 bg-indigo-50 rounded-lg p-4">
            <h3 className="text-md font-medium text-indigo-700 mb-2">How Health Score is Calculated</h3>
            <p className="text-sm text-gray-600">
              The health score considers multiple factors including sleep quality, hydration level, exercise minutes, and streak days. 
              Continue tracking your wellness metrics daily to improve your rank!
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;