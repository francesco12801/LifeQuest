import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./style/Leaderboard.css";
import VitaVerseNFTABI from "./constants/abi/vitaVerseABI.json";
import { CONTRACT_ADDRESS } from "./constants/constants.jsx";

const Leaderboard = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [timeframe, setTimeframe] = useState("weekly");
  const [userRank, setUserRank] = useState(null);
  const [rawUserData, setRawUserData] = useState(null); 

  // same function of the other pages
  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const abiToUse = VitaVerseNFTABI.abi
              ? VitaVerseNFTABI.abi
              : VitaVerseNFTABI;
            if (Array.isArray(abiToUse)) {
              const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abiToUse,
                provider.getSigner()
              );
              setContract(contract);

              // data loading in my leaderboard
              await loadLeaderboardData(contract, accounts[0]);
            } else {
              console.error("ABI not valid:", abiToUse);
              setLoading(false);
            }
          } else {
            setLoading(false);
            alert("Please connect to MetaMask first!");
          }
        } catch (error) {
          console.error("Initialization error:", error);
          setLoading(false);
        }
      } else {
        alert("MetaMask is not installed!");
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Apply filtering without re-fetching data from blockchain
  useEffect(() => {
    if (rawUserData) {
      const filteredData = applyFilters(rawUserData, filter, timeframe, account);
      setLeaderboardData(filteredData);
      const userRanking = filteredData.find(
        (user) => user.address === account
      );
      if (userRanking) {
        setUserRank(userRanking.rank);
      } else {
        setUserRank(null);
      }
    }
  }, [filter, timeframe, rawUserData, account]);

  const loadLeaderboardData = async (contract, userAccount) => {
    setLoading(true);
    try {
      // Get all active users and their health data
      const result = await contract.getAllActiveUsers();
      const users = result[0];
      const healthData = result[1];
      
      // Get badge counts in a single call
      const badgeCounts = await contract.getUserBadgeCounts(users);

      const usersData = [];
      for (let i = 0; i < users.length; i++) {
        const userAddress = users[i];
        
        // Extract health data from the array
        const sleepHours = parseInt(healthData[i * 4]);
        const waterIntake = parseInt(healthData[i * 4 + 1]);
        const exerciseMinutes = parseInt(healthData[i * 4 + 2]);
        const streakDays = parseInt(healthData[i * 4 + 3]);
        const badgeCount = parseInt(badgeCounts[i]);
        
        // Calculate health score using the same formula as the original contract
        const healthScore = 
          (sleepHours / 10) * 20 + 
          waterIntake / 100 + 
          exerciseMinutes / 10 + 
          streakDays * 5;

        const userData = {
          address: userAddress,
          healthScore: healthScore,
          streakDays: streakDays,
          exerciseMinutes: exerciseMinutes,
          waterIntake: waterIntake,
          badgeCount: badgeCount,
          avatar: generateAvatar(userAddress),
        };

        usersData.push(userData);
      }

      // Store raw data
      setRawUserData(usersData);
      
      // Apply initial filtering
      const filteredData = applyFilters(usersData, filter, timeframe, userAccount);
      setLeaderboardData(filteredData);
      
      // Find user rank
      const userRanking = filteredData.find(
        (user) => user.address === userAccount
      );
      if (userRanking) {
        setUserRank(userRanking.rank);
      } else {
        setUserRank(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
      setLoading(false);
      setLeaderboardData([]);
    }
  };

  // Function to apply filters to raw data
  function applyFilters(data, filterType, timeRange, userAccount) {
    // Make a copy to avoid modifying the original data
    let filteredData = [...data];

    // Apply sorting based on filter type
    switch (filterType) {
      case "exercise":
        filteredData.sort((a, b) => b.exerciseMinutes - a.exerciseMinutes);
        break;
      case "streak":
        filteredData.sort((a, b) => b.streakDays - a.streakDays);
        break;
      case "badges":
        filteredData.sort((a, b) => b.badgeCount - a.badgeCount);
        break;
      default: // "all" - sort by overall health score
        filteredData.sort((a, b) => b.healthScore - a.healthScore);
    }

    // Apply time range filtering
    // This is a simplified version since we don't have actual timestamp data
    // In a real implementation, you would filter based on actual dates
    if (timeRange === "weekly") {
      filteredData = filteredData.slice(0, Math.min(10, filteredData.length));
    } else if (timeRange === "monthly") {
      filteredData = filteredData.slice(0, Math.min(15, filteredData.length));
    }
    
    // Add rank numbers
    filteredData = filteredData.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return filteredData;
  }

  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  function generateAvatar(address) {
    // cool function found on github, i use the address to generate a color
    // and i use the first two characters of the address to generate a letter
    // that will be the avatar
    const hash = address.toLowerCase().replace("0x", "");
    const color = `#${hash.substring(0, 6)}`;
    const backgroundColor = `#${hash.substring(6, 12)}`;
    return (
      <div
        className="avatar"
        style={{
          backgroundColor,
          color: getContrastColor(backgroundColor),
        }}
      >
        {address.substring(2, 4).toUpperCase()}
      </div>
    );
  }

  function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  // filtering change 
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading leaderboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>Community Leaderboard</h1>
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label htmlFor="filter">Rank by:</label>
            <select id="filter" value={filter} onChange={handleFilterChange}>
              <option value="all">Overall Score</option>
              <option value="exercise">Exercise Minutes</option>
              <option value="streak">Longest Streak</option>
              <option value="badges">Badge Count</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="timeframe">Time Period:</label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={handleTimeframeChange}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="allTime">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {userRank && (
        <div className="user-rank-card">
          <div className="user-rank-info">
            <span className="user-rank-label">Your Current Rank:</span>
            <span className="user-rank-value">{userRank}</span>
          </div>
          <p className="user-rank-message">
            {userRank === 1
              ? "Congratulations! You're leading the pack! 🏆"
              : userRank <= 3
              ? "Amazing work! You're in the top 3! 🥇🥈🥉"
              : userRank <= 10
              ? "Great job! You're in the top 10!"
              : "Keep going! Every healthy habit moves you up the leaderboard!"}
          </p>
        </div>
      )}

      <div className="leaderboard-table-container">
        {leaderboardData.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-column">Rank</th>
                <th className="user-column">User</th>
                <th className={filter === "all" ? "highlight-column" : ""}>
                  Health Score
                </th>
                <th className={filter === "streak" ? "highlight-column" : ""}>
                  Streak Days
                </th>
                <th className={filter === "exercise" ? "highlight-column" : ""}>
                  Exercise Min
                </th>
                <th className={filter === "badges" ? "highlight-column" : ""}>
                  Badges
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user) => (
                <tr
                  key={user.address}
                  className={user.address === account ? "current-user-row" : ""}
                >
                  <td className="rank-column">
                    {user.rank <= 3 ? (
                      <div className={`top-rank rank-${user.rank}`}>
                        {user.rank === 1 && "🥇"}
                        {user.rank === 2 && "🥈"}
                        {user.rank === 3 && "🥉"}
                        {user.rank}
                      </div>
                    ) : (
                      user.rank
                    )}
                  </td>
                  <td className="user-column">
                    <div className="user-info">
                      {user.avatar}
                      <div className="user-details">
                        <span className="user-name">
                          {user.address === account
                            ? "You"
                            : `User ${shortenAddress(user.address)}`}
                        </span>
                        <span className="user-address">
                          {shortenAddress(user.address)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={filter === "all" ? "highlight-column" : ""}>
                    <div className="score-bar-container">
                      <div
                        className="score-bar"
                        style={{ width: `${Math.min(user.healthScore, 100)}%` }}
                      ></div>
                      <span className="score-value">{Math.round(user.healthScore)}</span>
                    </div>
                  </td>
                  <td className={filter === "streak" ? "highlight-column" : ""}>
                    {user.streakDays} days
                  </td>
                  <td
                    className={filter === "exercise" ? "highlight-column" : ""}
                  >
                    {user.exerciseMinutes} min
                  </td>
                  <td className={filter === "badges" ? "highlight-column" : ""}>
                    <div className="badge-count">
                      <span className="badge-icon">🏅</span>
                      <span>{user.badgeCount}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data-message">
            <p>
              No leaderboard data available at this time. Start logging your
              health data to appear on the leaderboard!
            </p>
          </div>
        )}
      </div>

      <div className="leaderboard-info">
        <h2>How Rankings Work</h2>
        <p>
          The VitaVerse leaderboard ranks users based on their health metrics
          and achievements. Your score is calculated from a combination of your
          consistent activity streaks, exercise minutes, water intake, and
          overall health data consistency.
        </p>
        <p>
          Earn badges by completing health challenges to boost your ranking and
          showcase your commitment to wellness!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;