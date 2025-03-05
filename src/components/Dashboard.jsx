import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./style/Dashboard.css";

// Importa i componenti per le varie sezioni
import Statistics from "./Statistics.jsx";
import Leaderboard from "./Leaderboard.jsx";
import Badges from "./Badges.jsx";

// Importa l'ABI e l'indirizzo del contratto
import VitaVerseNFTABI from "./constants/abi/vitaVerseABI.json";
import { CONTRACT_ADDRESS } from "./constants/constants.js";

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome"); 

  // Controlla se MetaMask è installato all'avvio
  useEffect(() => {
    const checkIfMetaMaskInstalled = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Check if already connected
        // Modifica in Dashboard.jsx, nella funzione checkIfMetaMaskInstalled
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);

            // Verifica che l'ABI sia corretto prima di inizializzare il contratto
            console.log("ABI:", VitaVerseNFTABI); // Aggiungi questo log per verificare l'ABI

            // Se VitaVerseNFTABI è un oggetto con una proprietà 'abi', usa quello
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
            } else {
              console.error("ABI non valido:", abiToUse);
            }

            // Se l'utente è già connesso, mostra le statistiche
            setActiveTab("statistics");
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkIfMetaMaskInstalled();
  }, []);

  // Gestisci l'evento di cambio account
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);

          // Aggiorna il contratto con il nuovo account
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            VitaVerseNFTABI.abi,
            provider.getSigner()
          );
          setProvider(provider);
          setContract(contract);
        } else {
          // L'utente ha disconnesso il suo wallet
          setAccount("");
          setIsConnected(false);
          setContract(null);
          setActiveTab("welcome");
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  // Funzione per connettersi a MetaMask
  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        setConnecting(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAccount(accounts[0]);
        setIsConnected(true);

        // Initialize contract
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          VitaVerseNFTABI.abi,
          provider.getSigner()
        );
        setProvider(provider);
        setContract(contract);
        setConnecting(false);

        // Passa alla pagina delle statistiche dopo la connessione
        setActiveTab("statistics");
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        setConnecting(false);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install it to use this application."
      );
    }
  };

  // Mostra il contenuto appropriato in base al tab attivo
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="intro-section">
          <h2>Transform Your Health Journey with Blockchain</h2>
          <p>
            VitaVerse is a revolutionary platform that combines blockchain
            technology with health tracking, rewarding you for maintaining a
            healthy lifestyle with exclusive NFT badges and YODA tokens.
          </p>
          <p>
            Track your exercise, hydration, sleep, and energy levels. Earn
            badges for your achievements and climb the leaderboard to showcase
            your commitment to wellness.
          </p>
          <div className="features">
            <div className="feature">
              <h3>Track Progress</h3>
              <p>Record and monitor your daily health metrics</p>
            </div>
            <div className="feature">
              <h3>Earn Rewards</h3>
              <p>Receive NFT badges and YODA tokens for achievements</p>
            </div>
            <div className="feature">
              <h3>Build Streaks</h3>
              <p>Maintain consistency and unlock higher tier badges</p>
            </div>
          </div>

          <div className="connect-section">
            <button
              className={`connect-button ${connecting ? "connecting" : ""}`}
              onClick={connectToMetaMask}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <span className="button-spinner"></span>
                  Connecting...
                </>
              ) : (
                "Connect to MetaMask"
              )}
            </button>
          </div>
        </div>
      );
    }

    // Contenuto per utenti connessi
    switch (activeTab) {
      case "statistics":
        return <Statistics account={account} contract={contract} />;
      case "leaderboard":
        return <Leaderboard account={account} contract={contract} />;
      case "badges":
        return <Badges account={account} contract={contract} />;
      default:
        return (
          <div className="welcome-connected">
            <h2>Welcome to VitaVerse!</h2>
            <p>
              You are now connected. Start tracking your health data and earn
              rewards!
            </p>
            <button
              className="start-button"
              onClick={() => setActiveTab("statistics")}
            >
              Get Started
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-logo">
          <div className="small-logo">
            <svg
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
            >
              <circle cx="100" cy="100" r="80" fill="#4CAF50" />
              <path d="M100 40 L140 100 L100 160 L60 100 Z" fill="#2E7D32" />
              <circle cx="100" cy="100" r="30" fill="#81C784" />
              <path d="M70 90 Q100 60 130 90 Q100 120 70 90" fill="#1B5E20" />
            </svg>
          </div>
          <h1 className="app-title">VitaVerse</h1>
        </div>

        {isConnected && (
          <>
            <nav className="app-nav">
              <ul>
                <li>
                  <button
                    className={activeTab === "statistics" ? "active" : ""}
                    onClick={() => setActiveTab("statistics")}
                  >
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Statistics</span>
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === "leaderboard" ? "active" : ""}
                    onClick={() => setActiveTab("leaderboard")}
                  >
                    <span className="nav-icon">🏆</span>
                    <span className="nav-text">Leaderboard</span>
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === "badges" ? "active" : ""}
                    onClick={() => setActiveTab("badges")}
                  >
                    <span className="nav-icon">🏅</span>
                    <span className="nav-text">Badges</span>
                  </button>
                </li>
              </ul>
            </nav>

            <div className="account-info">
              <span>
                {account.substring(0, 6)}...
                {account.substring(account.length - 4)}
              </span>
            </div>
          </>
        )}
      </header>

      <main className="app-content">
        {isConnected && activeTab !== "welcome" ? (
          <div className="connected-content">{renderContent()}</div>
        ) : (
          <div className="dashboard-container">
            <div className="dashboard-content">
              <div className="logo-container">
                <div className="logo">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" fill="#4CAF50" />
                    <path
                      d="M100 40 L140 100 L100 160 L60 100 Z"
                      fill="#2E7D32"
                    />
                    <circle cx="100" cy="100" r="30" fill="#81C784" />
                    <path
                      d="M70 90 Q100 60 130 90 Q100 120 70 90"
                      fill="#1B5E20"
                    />
                  </svg>
                </div>
                <h1 className="app-title">VitaVerse</h1>
              </div>

              {renderContent()}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          &copy; {new Date().getFullYear()} VitaVerse - Blockchain Health
          Tracking Platform
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
