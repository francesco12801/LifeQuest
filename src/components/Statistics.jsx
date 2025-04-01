import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./style/Statistics.css";

// Importa l'ABI e l'indirizzo del contratto (sostituisci con i valori reali)
import VitaVerseNFTABI from "./constants/abi/vitaVerseABI.json";
import { CONTRACT_ADDRESS } from "./constants/constants.jsx";

const Statistics = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [healthData, setHealthData] = useState({
    weight: 0,
    sleepHours: 0,
    energyLevel: 0,
    exercise: 0,
    waterIntake: 0,
    lastUpdated: 0,
  });
  const [userStats, setUserStats] = useState({
    streakDays: 0,
    lastUpdateDay: 0,
    totalExercise: 0,
    waterIntake: 0,
    badgeCount: 0,
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    weight: "",
    sleepHours: "",
    energyLevel: "",
    exercise: "",
    waterIntake: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Inizializza il contratto e carica i dati
  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        // In Statistics.jsx, nella funzione initialize
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

              // Carica i dati iniziali
              await loadHealthData(contract, accounts[0]);
              await loadUserStats(contract, accounts[0]);
              await loadHistoricalData(contract, accounts[0]);
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

  // Carica i dati di salute dell'utente
  const loadHealthData = async (contract, account) => {
    try {
      const data = await contract.getHealthData(account);
      setHealthData({
        weight: parseInt(data.weight) / 10, // Converti in formato leggibile
        sleepHours: parseInt(data.sleepHours) / 10, // Converti in formato leggibile
        energyLevel: parseInt(data.energyLevel),
        exercise: parseInt(data.exercise),
        waterIntake: parseInt(data.waterIntake),
        lastUpdated: parseInt(data.lastUpdated) * 1000, // Converti in millisecondi
      });
    } catch (error) {
      console.error("Error loading health data:", error);
    }
  };

  // Carica le statistiche dell'utente
  const loadUserStats = async (contract, account) => {
    try {
      const stats = await contract.getUserStats(account);
      setUserStats({
        streakDays: parseInt(stats.streakDays),
        lastUpdateDay: parseInt(stats.lastUpdateDay),
        totalExercise: parseInt(stats.totalExercise),
        waterIntake: parseInt(stats.waterIntake),
        badgeCount: parseInt(stats.badgeCount),
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  // Carica i dati storici
  const loadHistoricalData = async (contract, account) => {
    try {
      // Ottieni i giorni con dati
      const historyDays = await contract.getUserHistoryDays(account);

      const historicalDataArray = [];

      // Per ogni giorno, ottieni i dati
      for (let i = 0; i < historyDays.length; i++) {
        const day = historyDays[i];
        const dayData = await contract.getDailyHealthData(account, day);

        const date = new Date(parseInt(day) * 86400 * 1000); // Converti day in data

        historicalDataArray.push({
          date: date.toLocaleDateString(),
          weight: parseInt(dayData.weight) / 10,
          sleepHours: parseInt(dayData.sleepHours) / 10,
          energyLevel: parseInt(dayData.energyLevel),
          exercise: parseInt(dayData.exercise),
          waterIntake: parseInt(dayData.waterIntake),
        });
      }

      // Ordina per data
      historicalDataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

      setHistoricalData(historicalDataArray);
      setLoading(false);
    } catch (error) {
      console.error("Error loading historical data:", error);
      setLoading(false);
    }
  };

  // Gestisce il cambio nei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Invia l'aggiornamento dei dati di salute
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError("");

    try {
      // Converti i dati nel formato richiesto dal contratto
      const weight = Math.round(parseFloat(formData.weight) * 10); // Converti in formato contratto
      const sleepHours = Math.round(parseFloat(formData.sleepHours) * 10); // Converti in formato contratto
      const energyLevel = parseInt(formData.energyLevel);
      const exercise = parseInt(formData.exercise);
      const waterIntake = parseInt(formData.waterIntake);

      // Verifica validità dei dati
      if (
        isNaN(weight) ||
        isNaN(sleepHours) ||
        isNaN(energyLevel) ||
        isNaN(exercise) ||
        isNaN(waterIntake)
      ) {
        setUpdateError("Please enter valid numbers for all fields");
        return;
      }

      // Invia la transazione
      const transaction = await contract.updateHealthData(
        weight,
        sleepHours,
        energyLevel,
        exercise,
        waterIntake
      );

      // Attendi che la transazione sia confermata
      await transaction.wait();

      // Aggiorna i dati
      await loadHealthData(contract, account);
      await loadUserStats(contract, account);
      await loadHistoricalData(contract, account);

      setUpdateSuccess(true);

      // Resetta il form
      setFormData({
        weight: "",
        sleepHours: "",
        energyLevel: "",
        exercise: "",
        waterIntake: "",
      });
    } catch (error) {
      console.error("Error updating health data:", error);
      setUpdateError("Transaction failed. Please try again.");
    }
  };

  // Formatta la data
  const formatDate = (timestamp) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="statistics-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>Personal Health Statistics</h1>
      </div>

      <div className="statistics-grid">
        {/* Current Stats Section */}
        <div className="stats-card">
          <h2>Current Health Stats</h2>
          <div className="stats-details">
            <div className="stat-item">
              <div className="stat-icon weight-icon">⚖️</div>
              <div className="stat-info">
                <h3>Weight</h3>
                <p>{healthData.weight} kg</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon sleep-icon">😴</div>
              <div className="stat-info">
                <h3>Sleep</h3>
                <p>{healthData.sleepHours} hours</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon energy-icon">⚡</div>
              <div className="stat-info">
                <h3>Energy</h3>
                <p>Level {healthData.energyLevel}/10</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon exercise-icon">🏃</div>
              <div className="stat-info">
                <h3>Exercise</h3>
                <p>{healthData.exercise} minutes</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon water-icon">💧</div>
              <div className="stat-info">
                <h3>Water</h3>
                <p>{healthData.waterIntake} ml</p>
              </div>
            </div>
          </div>
          <div className="last-updated">
            <p>Last Updated: {formatDate(healthData.lastUpdated)}</p>
          </div>
        </div>

        {/* Achievement Stats Section */}
        <div className="stats-card">
          <h2>Achievement Stats</h2>
          <div className="achievement-stats">
            <div className="achievement-item">
              <div className="achievement-icon">🔥</div>
              <div className="achievement-info">
                <h3>Current Streak</h3>
                <p>{userStats.streakDays} days</p>
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-info">
                <h3>Total Exercise</h3>
                <p>{userStats.totalExercise} minutes</p>
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-icon">🏅</div>
              <div className="achievement-info">
                <h3>Badges Earned</h3>
                <p>{userStats.badgeCount} badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Health Data Form */}
        <div className="stats-card update-form-card">
          <h2>Update Today's Health Data</h2>
          {updateSuccess && (
            <div className="success-message">Data updated successfully!</div>
          )}
          {updateError && <div className="error-message">{updateError}</div>}
          <form onSubmit={handleSubmit} className="health-form">
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 70.5"
                step="0.1"
                min="20"
                max="300"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sleepHours">Sleep Hours</label>
              <input
                type="number"
                id="sleepHours"
                name="sleepHours"
                value={formData.sleepHours}
                onChange={handleChange}
                placeholder="e.g. 7.5"
                step="0.1"
                min="0"
                max="24"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="energyLevel">Energy Level (1-10)</label>
              <input
                type="number"
                id="energyLevel"
                name="energyLevel"
                value={formData.energyLevel}
                onChange={handleChange}
                placeholder="e.g. 8"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="exercise">Exercise (minutes)</label>
              <input
                type="number"
                id="exercise"
                name="exercise"
                value={formData.exercise}
                onChange={handleChange}
                placeholder="e.g. 45"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="waterIntake">Water Intake (ml)</label>
              <input
                type="number"
                id="waterIntake"
                name="waterIntake"
                value={formData.waterIntake}
                onChange={handleChange}
                placeholder="e.g. 2000"
                min="0"
                required
              />
            </div>
            <button type="submit" className="update-button">
              Update Health Data
            </button>
          </form>
        </div>
      </div>

      {/* Historical Data Charts */}
      <div className="charts-section">
        <h2>Health History Analytics</h2>

        <div className="chart-container">
          <h3>Exercise History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="exercise"
                fill="#82ca9d"
                name="Exercise (minutes)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Water Intake History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="waterIntake"
                stroke="#8884d8"
                name="Water Intake (ml)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Sleep History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sleepHours"
                stroke="#ffc658"
                name="Sleep (hours)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
