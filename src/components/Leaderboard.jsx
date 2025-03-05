import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./style/Leaderboard.css";

// Importa l'ABI e l'indirizzo del contratto (sostituisci con i valori reali)
import VitaVerseNFTABI from "./constants/abi/vitaVerseABI.json";
import { CONTRACT_ADDRESS } from "./constants/constants.js";

const Leaderboard = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'exercise', 'streak', 'badges'
  const [timeframe, setTimeframe] = useState("weekly"); // 'weekly', 'monthly', 'allTime'
  const [userRank, setUserRank] = useState(null);

  // Inizializza il contratto e carica i dati
  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        // In Leaderboard.jsx, nella funzione initialize
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            setAccount(accounts[0]);

            // Usa un approccio più sicuro per accedere all'ABI
            const abiToUse = VitaVerseNFTABI.abi
              ? VitaVerseNFTABI.abi
              : VitaVerseNFTABI;

            // Inizializza il contratto solo se l'ABI è valido
            if (Array.isArray(abiToUse)) {
              const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abiToUse,
                provider.getSigner()
              );
              setContract(contract);

              // Carica i dati della leaderboard
              await loadLeaderboardData(
                contract,
                accounts[0],
                filter,
                timeframe
              );
            } else {
              console.error("ABI non valido:", abiToUse);
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

  // Carica i dati della leaderboard quando cambia il filtro o il timeframe
  useEffect(() => {
    if (contract && account) {
      loadLeaderboardData(contract, account, filter, timeframe);
    }
  }, [filter, timeframe, contract, account]);

  // Funzione per caricare i dati della leaderboard
  const loadLeaderboardData = async (
    contract,
    userAccount,
    filterType,
    timeRange
  ) => {
    setLoading(true);
    try {
      // Ottieni i dati dal contratto usando la funzione getTopHealthUsers
      const limit = 20; // Richiedi fino a 20 utenti
      const result = await contract.getTopHealthUsers(limit);

      // Estrai utenti e punteggi dai risultati
      const users = result[0];
      const healthScores = result[1];

      // Creiamo un array di oggetti per ogni utente
      const usersData = [];
      for (let i = 0; i < users.length; i++) {
        const userAddress = users[i];

        // Per ogni utente, ottieni le statistiche
        const userStats = await contract.getUserStats(userAddress);

        // Crea oggetto con tutti i dati dell'utente
        const userData = {
          address: userAddress,
          healthScore: parseInt(healthScores[i]),
          streakDays: parseInt(userStats.streakDays),
          exerciseMinutes: parseInt(userStats.totalExercise),
          waterIntake: parseInt(userStats.waterIntake),
          badgeCount: parseInt(userStats.badgeCount),
          avatar: generateAvatar(userAddress),
        };

        usersData.push(userData);
      }

      // Filtra e ordina i dati in base al filtro selezionato
      let filteredData = [...usersData];

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
        default: // 'all' o qualsiasi altro valore
          filteredData.sort((a, b) => b.healthScore - a.healthScore);
      }

      // Applica timeframe limitando i risultati
      // Nota: in un'implementazione reale, dovresti filtrare i dati in base al timestamp
      if (timeRange === "weekly") {
        filteredData = filteredData.slice(0, Math.min(10, filteredData.length));
      } else if (timeRange === "monthly") {
        filteredData = filteredData.slice(0, Math.min(15, filteredData.length));
      }

      // Assegna posizioni di classifica
      filteredData = filteredData.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

      // Trova il rank dell'utente corrente
      const userRanking = filteredData.find(
        (user) => user.address === userAccount
      );
      if (userRanking) {
        setUserRank(userRanking.rank);
      } else {
        setUserRank(null);
      }

      setLeaderboardData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
      setLoading(false);

      // In caso di errore, mostra una tabella vuota
      setLeaderboardData([]);
    }
  };

  // Funzione per abbreviare gli indirizzi
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Genera un avatar semplice basato sull'indirizzo
  function generateAvatar(address) {
    // Usa l'indirizzo come seed per generare un colore
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

  // Funzione per ottenere un colore di contrasto
  function getContrastColor(hexColor) {
    // Converte il colore esadecimale in RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);

    // Calcola la luminosità
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Restituisce bianco o nero in base alla luminosità
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  // Funzione per gestire il cambio di filtro
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Funzione per gestire il cambio di timeframe
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
                      <span className="score-value">{user.healthScore}</span>
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
