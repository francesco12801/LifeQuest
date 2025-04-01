import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./style/Dashboard.css";
import Statistics from "./Statistics.jsx";
import Leaderboard from "./Leaderboard.jsx";
import Badges from "./Badges.jsx";
import VitaVerseNFTABI from "./constants/abi/vitaVerseABI.json";
import { CONTRACT_ADDRESS } from "./constants/constants.jsx";
import { VitaVerseLogo } from "./constants/constants.jsx";


const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");

  // Funzione di utilità per inizializzare il contratto
  const initializeContract = (providerInstance, accountAddress) => {
    // Ottieni la versione corretta dell'ABI
    const abiToUse = VitaVerseNFTABI.abi ? VitaVerseNFTABI.abi : VitaVerseNFTABI;
    
    if (!Array.isArray(abiToUse)) {
      console.error("ABI non valido:", abiToUse);
      return null;
    }
    
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      abiToUse,
      providerInstance.getSigner()
    );
  };

  // Funzione di utilità per gestire la connessione
  const handleConnection = (accountAddress) => {
    setAccount(accountAddress);
    setIsConnected(true);
    setActiveTab("statistics");
  };

  // Controllo iniziale della connessione
  useEffect(() => {
    const checkIfMetaMaskInstalled = async () => {
      if (!window.ethereum) return;
      
      const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(providerInstance);
      
      try {
        const accounts = await providerInstance.listAccounts();
        if (accounts.length > 0) {
          handleConnection(accounts[0]);
          
          const contractInstance = initializeContract(providerInstance, accounts[0]);
          if (contractInstance) {
            setContract(contractInstance);
          }
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkIfMetaMaskInstalled();
  }, []);

  // Listener per il cambio di account
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        handleConnection(accounts[0]);
        
        const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
        const contractInstance = initializeContract(providerInstance, accounts[0]);
        
        setProvider(providerInstance);
        if (contractInstance) {
          setContract(contractInstance);
        }
      } else {
        setAccount("");
        setIsConnected(false);
        setContract(null);
        setActiveTab("welcome");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  // Funzione per connettere a MetaMask
  const connectToMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this application.");
      return;
    }
    
    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      const contractInstance = initializeContract(providerInstance, accounts[0]);
      
      handleConnection(accounts[0]);
      setProvider(providerInstance);
      if (contractInstance) {
        setContract(contractInstance);
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    } finally {
      setConnecting(false);
    }
  };

  // Componente per il Welcome Screen
  const WelcomeScreen = () => (
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

  // Componente per il Welcome Screen quando connesso
  const WelcomeConnected = () => (
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

  // Mostra il contenuto appropriato in base al tab attivo
  const renderContent = () => {
    if (!isConnected) {
      return <WelcomeScreen />;
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
        return <WelcomeConnected />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-logo">
          <div className="small-logo">
            <VitaVerseLogo />
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
                  <VitaVerseLogo width="200" height="200" />
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