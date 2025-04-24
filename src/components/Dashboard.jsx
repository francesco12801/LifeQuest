
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./style/Dashboard.css";
import Statistics from "./Statistics.jsx";
import Leaderboard from "./Leaderboard.jsx";
import Badges from "./Badges.jsx";
import VitaVerseNFTABI from "./constants/abi/vitaVerseABI.json";
import { CONTRACT_ADDRESS, VitaVerseLogo } from "./constants/constants.jsx";

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");

  // init of the contract and provider
  const setupProviderAndContract = async (accountAddress = null) => {
    if (!window.ethereum) {
      console.error("Metamask not installed");
      return { providerInstance: null, contractInstance: null };
    }

    try {
      const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      
      // check if the user is connected 
      // ESSENTIAL: check if the user is connected to the right network
      let address = accountAddress;
      if (!address) {
        const accounts = await providerInstance.listAccounts();
        if (accounts.length > 0) {
          address = accounts[0];
        } else {
          return { providerInstance, contractInstance: null, address: null };
        }
      }
      
      // CONTRACT INIT, SAME AS IN THE COMPONENT
      const abiToUse = VitaVerseNFTABI.abi ? VitaVerseNFTABI.abi : VitaVerseNFTABI;
      if (!Array.isArray(abiToUse)) {
        console.error("ABI non valido:", abiToUse);
        return { providerInstance, contractInstance: null, address };
      }
      
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        abiToUse,
        providerInstance.getSigner()
      );
      
      return { providerInstance, contractInstance, address };
    } catch (error) {
      console.error("Errore nell'inizializzazione:", error);
      return { providerInstance: null, contractInstance: null, address: null };
    }
  };


  const connectToMetaMask = async () => {
    if (!window.ethereum) {
      alert("METAMASK NOT INSTALLED");
      return;
    }
    
    try {
      setConnecting(true);
      // Richiedi accesso agli account
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      // Setup provider e contratto con l'account ottenuto
      const { providerInstance, contractInstance } = await setupProviderAndContract(accounts[0]);
      
      if (providerInstance && accounts[0]) {
        setProvider(providerInstance);
        setContract(contractInstance);
        setAccount(accounts[0]);
        setIsConnected(true);
        setActiveTab("statistics");
      }
    } catch (error) {
      console.error("Errore nella connessione a MetaMask:", error);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const { providerInstance, contractInstance, address } = await setupProviderAndContract();
      
      if (providerInstance && address) {
        setProvider(providerInstance);
        setContract(contractInstance);
        setAccount(address);
        setIsConnected(true);
        setActiveTab("statistics");
      }
    };

    checkConnection();
    
    // CHANGE account in metamask or disconnected
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount("");
          setActiveTab("welcome");
        } else {
          checkConnection();
        }
      });
    }
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Welcome Screen se l'utente non è connesso, ALTRIMENTI mostra il contenuto
  const WelcomeScreen = () => (
    <div className="intro-section">
      <h2>Transform Your Health Journey with Blockchain</h2>
      <p>
        VitaVerse is a platform that combines blockchain
        technology with health tracking, rewarding users for maintaining a
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
                  <VitaVerseLogo width="130" height="130" />
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
          &copy; {new Date().getFullYear()} VitaVerse - Francesco Tinessa. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;