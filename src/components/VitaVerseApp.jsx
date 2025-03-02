import React, { useState, useEffect } from "react";
import { Activity, Moon, Droplet, Wallet } from "lucide-react";
import { ethers } from "ethers";

// Importazione dei componenti
import Dashboard from "./Dashboard";
import Badges from "./Badges";
import Statistics from "./Statistics";
import Leaderboard from "./Leaderboard";

// Importazione delle costanti
import {
  YodaTokenABI,
  VitaVerseNFTABI,
  YODA_TOKEN_ADDRESS,
  VITAVERSE_NFT_ADDRESS,
  defaultBadges,
  defaultHealthData,
} from "./constants/constants";

function VitaVerseApp() {
  // User and wallet state
  const [account, setAccount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [yodaBalance, setYodaBalance] = useState(0);
  const [nftBalance, setNftBalance] = useState(0);
  const [ownedBadges, setOwnedBadges] = useState([]);

  // Contracts
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [yodaToken, setYodaToken] = useState(null);
  const [vitaVerseNFT, setVitaVerseNFT] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, badges, stats
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Health data state
  const [healthData, setHealthData] = useState(defaultHealthData);
  // statistics state
  const [userStats, setUserStats] = useState({
    streakDays: 0,
    totalUpdates: 0,
    averageWaterIntake: 0,
    averageSleepHours: 0,
    averageExerciseMinutes: 0,
  });

  // Aggiungiamo le icone ai badge
  const [availableBadges, setAvailableBadges] = useState(
    defaultBadges.map((badge) => {
      // Assegna le icone in base al tipo
      let BadgeIcon;
      if (badge.type === "EarlyBird") {
        BadgeIcon = Moon;
      } else if (badge.type === "WorkoutWarrior") {
        BadgeIcon = Activity;
      } else if (badge.type === "HydrationHero") {
        BadgeIcon = Droplet;
      }
      return { ...badge, icon: BadgeIcon };
    })
  );

  // Platform statistics
  const [platformStats, setPlatformStats] = useState({
    totalTransactions: 0,
    averageFee: 0,
    confirmationTime: 0,
    recentTransactions: [],
  });

  // Initialize provider and contracts when the wallet is connected
  useEffect(() => {
    if (walletConnected && window.ethereum) {
      const initializeContracts = async () => {
        try {
          // Per ethers.js v6
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          const userSigner = await web3Provider.getSigner();
          setSigner(userSigner);

          const yodaContract = new ethers.Contract(
            YODA_TOKEN_ADDRESS,
            YodaTokenABI,
            userSigner
          );
          const nftContract = new ethers.Contract(
            VITAVERSE_NFT_ADDRESS,
            VitaVerseNFTABI,
            userSigner
          );

          setYodaToken(yodaContract);
          setVitaVerseNFT(nftContract);

          // Now that contracts are initialized, fetch data
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            // In v6, account è un oggetto con address
            await fetchUserData(accounts[0].address);
            await fetchPlatformStats();
          }
        } catch (error) {
          console.error("Error initializing contracts:", error);
          setErrorMessage(
            "Error connecting to contracts. Check your connection and MetaMask."
          );
        }
      };

      initializeContracts();
    }
  }, [walletConnected, account]);

  // Wallet connection
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true);
        setErrorMessage("");

        // Request access to accounts
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        // Set address and connection status
        setAccount(accounts[0]);
        setWalletConnected(true);

        // Listen for account change events
        window.ethereum.on("accountsChanged", handleAccountsChanged);

        setSuccessMessage("Wallet connected successfully!");
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setErrorMessage(
          "Error connecting wallet. Make sure you have MetaMask installed."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorMessage(
        "MetaMask not detected! Install the MetaMask extension to continue."
      );
    }
  };

  // Handle account change in MetaMask
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setWalletConnected(false);
      setAccount("");
      setYodaBalance(0);
      setNftBalance(0);
      setOwnedBadges([]);
      setErrorMessage("Wallet disconnected.");
    } else {
      // User changed account
      setAccount(accounts[0]);
      // Reload data for the new account
      fetchUserData(accounts[0]);
    }
  };

  // Function to fetch user data from the blockchain
  // Function to fetch user data from the blockchain
  const fetchUserData = async (userAddress) => {
    if (!yodaToken || !vitaVerseNFT) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      console.log("Fetching data for address:", userAddress);

      // 1. Get Yoda token balance
      const yodaAmount = await yodaToken.balanceOf(userAddress);
      setYodaBalance(ethers.formatUnits(yodaAmount, 18));

      // 2. Get user health data
      try {
        const userData = await vitaVerseNFT.getHealthData(userAddress);
        console.log("Raw userData received:", userData);

        const healthDataFromContract = {
          weight: Number(userData[0]),
          sleepHours: Number(userData[1]),
          energyLevel: Number(userData[2]),
          exercise: Number(userData[3]),
          waterIntake: Number(userData[4]),
          lastUpdated: Number(userData[5]),
        };

        setHealthData(healthDataFromContract);
        console.log("Parsed health data:", healthDataFromContract);

        // Utilizzando la nuova funzione getUserStats
        try {
          // Ottieni statistiche dettagliate dell'utente dalla nuova funzione
          const stats = await vitaVerseNFT.getUserStats(userAddress);
          console.log("Raw stats from getUserStats:", stats);

          // Popoliamo lo stato userStats con i dati dal contratto
          const statsFromContract = {
            streakDays: Number(stats[0]), // streakDays
            lastUpdateDay: Number(stats[1]), // lastUpdateDay
            totalExercise: Number(stats[2]), // totalExercise
            waterIntake: Number(stats[3]), // waterIntake
            badgeCount: Number(stats[4]), // badgeCount
            // Aggiungiamo anche queste statistiche calcolate
            averageWaterIntake: Number(stats[3]), // stessa acqua dell'ultimo aggiornamento
            averageSleepHours: healthDataFromContract.sleepHours / 10,
            averageExerciseMinutes: Number(stats[2]), // stesso esercizio totale
          };

          setUserStats(statsFromContract);
          console.log("User stats from contract:", statsFromContract);
        } catch (error) {
          console.log("Error fetching user stats:", error);
          // Usa le informazioni disponibili per calcolare alcune statistiche basilari
          setUserStats({
            streakDays: 0, // Non abbiamo questa info senza getUserStats
            totalUpdates: healthDataFromContract.lastUpdated > 0 ? 1 : 0,
            averageWaterIntake: healthDataFromContract.waterIntake,
            averageSleepHours: healthDataFromContract.sleepHours / 10,
            averageExerciseMinutes: healthDataFromContract.exercise,
          });
        }
      } catch (error) {
        console.log("Error getting health data:", error);
        console.log(
          "User has no health data registered yet, using default values."
        );
        // Keep default values in healthData
      }

      // 3. Get the number of owned badges
      try {
        const nftCount = await vitaVerseNFT.balanceOf(userAddress);
        // Per ethers.js v6, use Number() instead of toNumber()
        setNftBalance(Number(nftCount));
      } catch (error) {
        console.error("Error fetching badge count:", error);
        setNftBalance(0);
      }

      // 4. Check which badges the user owns
      const updatedBadges = [...availableBadges];
      try {
        for (let i = 0; i < updatedBadges.length; i++) {
          const hasBadge = await vitaVerseNFT.hasBadge(userAddress, i);
          updatedBadges[i].earned = hasBadge;

          // Fetch badge details from the contract to update the remaining badges
          if (i < 3) {
            // Solo per i badge predefiniti
            try {
              const badgeInfo = await vitaVerseNFT.badges(i);
              updatedBadges[i].name = badgeInfo[0];
              updatedBadges[i].description = badgeInfo[1];
              // Per ethers.js v6, formatUnits è una funzione indipendente
              updatedBadges[i].price = ethers.formatUnits(badgeInfo[2], 18);
              updatedBadges[i].supply = Number(badgeInfo[3]);
              updatedBadges[i].remaining = Number(badgeInfo[4]);
              // badgeInfo[5] contiene badgeType che è un bytes32
              // badgeInfo[6] contiene active che è un bool
            } catch (error) {
              console.error("Error fetching badge details:", error);
            }
          }
        }
        setAvailableBadges(updatedBadges);
        setOwnedBadges(updatedBadges.filter((badge) => badge.earned));
      } catch (error) {
        console.error("Error fetching owned badges:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage(
        "Error fetching data from the blockchain. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Function to fetch platform statistics
  const fetchPlatformStats = async () => {
    if (!provider || !account) return;

    try {
      // In a real app, you might have a dedicated contract for statistics
      // or fetch events from the blockchain to calculate these metrics

      // For now, fetch some example data from the network
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      const gasPrice = await provider.getFeeData();

      // Aggiungiamo la lettura degli eventi dal contratto
      let recentTransactions = [];

      // Cerca eventi BadgePurchased
      try {
        // Cerca solo negli ultimi 1000 blocchi per velocizzare la query
        const filter = vitaVerseNFT.filters.BadgePurchased();
        const events = await vitaVerseNFT.queryFilter(
          filter,
          blockNumber - 1000,
          blockNumber
        );

        // Converti gli eventi in transazioni per la UI
        if (events.length > 0) {
          for (let i = 0; i < Math.min(events.length, 5); i++) {
            const event = events[i];
            const badge = availableBadges.find(
              (b) => b.id === Number(event.args.badgeId)
            );
            const badgeName = badge
              ? badge.name
              : `Badge #${Number(event.args.badgeId)}`;

            // Calcola quanto tempo fa è avvenuta la transazione
            const eventBlock = await provider.getBlock(event.blockNumber);
            const secondsAgo =
              Number(block.timestamp) - Number(eventBlock.timestamp);
            let timeAgo;

            if (secondsAgo < 60) {
              timeAgo = `${secondsAgo} sec ago`;
            } else if (secondsAgo < 3600) {
              timeAgo = `${Math.floor(secondsAgo / 60)} min ago`;
            } else {
              timeAgo = `${Math.floor(secondsAgo / 3600)} hours ago`;
            }

            recentTransactions.push({
              id: i,
              badgeName: badgeName,
              from:
                event.args.user.slice(0, 6) + "..." + event.args.user.slice(-4),
              to:
                VITAVERSE_NFT_ADDRESS.slice(0, 6) +
                "..." +
                VITAVERSE_NFT_ADDRESS.slice(-4),
              price: ethers.formatUnits(event.args.price, 18),
              time: timeAgo,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching badge purchase events:", error);
      }

      // Se non ci sono transazioni, usa i dati di esempio
      if (recentTransactions.length === 0) {
        recentTransactions = [
          {
            id: 1,
            badgeName: "Early Bird",
            from: account.slice(0, 6) + "..." + account.slice(-4),
            to: "0x5d6...7e8f",
            price: 20,
            time: "2 hours ago",
          },
          {
            id: 2,
            badgeName: "Workout Warrior",
            from: "0x7g8...9h0i",
            to: account.slice(0, 6) + "..." + account.slice(-4),
            price: 50,
            time: "3 hours ago",
          },
          {
            id: 3,
            badgeName: "Hydration Hero",
            from: account.slice(0, 6) + "..." + account.slice(-4),
            to: "0x9p0...1q2r",
            price: 30,
            time: "5 hours ago",
          },
        ];
      }

      setPlatformStats({
        totalTransactions: recentTransactions.length, // Dal numero di eventi
        // Per ethers.js v6, getFeeData() restituisce un oggetto con gasPrice
        averageFee: parseFloat(
          ethers.formatUnits(gasPrice.gasPrice || 0, "gwei")
        ).toFixed(2), // Gas price in gwei
        confirmationTime: Number(block.timestamp) > 0 ? 15 : 0, // Static example (15 seconds)
        recentTransactions: recentTransactions,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Update health data
  const saveHealthData = async () => {
    if (!walletConnected || !vitaVerseNFT) {
      setErrorMessage("You must connect your wallet first.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Send transaction to update health data
      const tx = await vitaVerseNFT.updateHealthData(
        healthData.weight,
        healthData.sleepHours,
        healthData.energyLevel,
        healthData.exercise,
        healthData.waterIntake
      );

      // Wait for transaction confirmation
      await tx.wait();

      setSuccessMessage("Health data updated successfully!");

      // Reload user data to check if new badges were awarded
      await fetchUserData(account);
    } catch (error) {
      console.error("Error updating data:", error);
      setErrorMessage(
        "An error occurred while updating health data. Check your available gas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase a badge
  const purchaseBadge = async (badgeId) => {
    if (!walletConnected || !vitaVerseNFT || !yodaToken) {
      setErrorMessage("You must connect your wallet first.");
      return;
    }

    const badge = availableBadges.find((b) => b.id === badgeId);
    if (!badge || badge.remaining === 0) {
      setErrorMessage("Badge not available.");
      return;
    }

    if (badge.earned) {
      setErrorMessage("You already earned this badge.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Check Yoda token balance
      const balance = await yodaToken.balanceOf(account);
      // Per ethers.js v6, parseUnits è una funzione indipendente
      const price = ethers.parseUnits(badge.price.toString(), 18);

      // Per ethers.js v6, non c'è lt method, usa < operator
      if (balance < price) {
        setErrorMessage(
          `Insufficient Yoda balance. You need ${badge.price} YODA.`
        );
        return;
      }

      // Approve the NFT contract to spend Yoda tokens
      const approveTx = await yodaToken.approve(VITAVERSE_NFT_ADDRESS, price);
      await approveTx.wait();

      // Purchase the badge
      const purchaseTx = await vitaVerseNFT.purchaseBadge(badgeId);
      await purchaseTx.wait();

      setSuccessMessage(`You successfully purchased the ${badge.name} badge!`);

      // Reload user data
      await fetchUserData(account);
      await fetchPlatformStats();
    } catch (error) {
      console.error("Error purchasing:", error);
      setErrorMessage(
        "An error occurred while purchasing the badge. Check your balance and available gas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Se l'utente naviga alla scheda Statistics, assicuriamoci che i dati siano caricati
    if (tab === "stats" && walletConnected && account) {
      fetchUserData(account);
      fetchPlatformStats();
    }
  };

  useEffect(() => {
    // Carica i dati quando l'utente è sulla scheda Statistics e il wallet è connesso
    if (activeTab === "stats" && walletConnected && account && vitaVerseNFT) {
      fetchUserData(account);
      fetchPlatformStats();
    }
  }, [activeTab, walletConnected, account, vitaVerseNFT]);

  const handleInputChange = (field, value) => {
    // Convert values for the smart contract
    let processedValue;

    if (field === "weight") {
      // Store weight as integer (70.5 kg = 705)
      processedValue = Math.round(parseFloat(value) * 10);
    } else if (field === "sleepHours") {
      // Store sleep hours as integer (7.5 hours = 75)
      processedValue = Math.round(parseFloat(value) * 10);
    } else {
      processedValue = parseInt(value);
    }

    setHealthData((prev) => ({
      ...prev,
      [field]: isNaN(processedValue) ? prev[field] : processedValue,
    }));
  };

  // Listen to blockchain events for earned badges
  useEffect(() => {
    if (!vitaVerseNFT || !account) return;

    const onBadgeEarned = (user, badgeId, badgeName) => {
      if (user.toLowerCase() === account.toLowerCase()) {
        setSuccessMessage(
          `Congratulations! You earned the "${badgeName}" badge!`
        );
        // Update data
        fetchUserData(account);
      }
    };

    // Listen for BadgeEarned event
    vitaVerseNFT.on("BadgeEarned", onBadgeEarned);

    // Cleanup
    return () => {
      vitaVerseNFT.removeListener("BadgeEarned", onBadgeEarned);
    };
  }, [vitaVerseNFT, account]);

  // Resto del componente...
  return (
    <div className="min-h-screen bg-indigo-50/30">
      <div className="container mx-auto px-4 py-6">
        {/* Header with wallet connect */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="bg-indigo-500 rounded-full p-3 mr-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12L9 16L19 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">VitaVerse</h1>
              <p className="text-gray-600">NFTs for Digital Wellness</p>
            </div>
          </div>

          {walletConnected ? (
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center">
                <Wallet size={16} className="mr-2" />
                <span className="font-medium truncate max-w-[120px]">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
              <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg flex items-center">
                <span className="font-medium">{yodaBalance} YODA</span>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors duration-200"
            >
              <Wallet size={20} className="mr-2" />
              <span className="font-medium">Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Error or success messages */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {!walletConnected ? (
          // Wallet not connected - show connect prompt
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <div className="bg-indigo-100 p-6 rounded-full mb-4">
              <Wallet size={48} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Connect your MetaMask wallet to access the VitaVerse platform and
              start earning NFT badges for your wellness.
            </p>
            <p className="text-amber-600 text-center max-w-md mb-6">
              Note: This project uses the Sepolia testnet and YODA tokens for
              transactions. Make sure you have Sepolia ETH and YODA tokens in
              your wallet.
            </p>
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors duration-200"
            >
              <Wallet size={20} className="mr-2" />
              <span className="font-medium">Connect Wallet</span>
            </button>
          </div>
        ) : (
          // Wallet connected - show content
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => handleTabChange("dashboard")}
                className={`py-3 px-6 font-medium ${
                  activeTab === "dashboard"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleTabChange("badges")}
                className={`py-3 px-6 font-medium ${
                  activeTab === "badges"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                NFT Badges
              </button>
              <button
                onClick={() => handleTabChange("stats")}
                className={`py-3 px-6 font-medium ${
                  activeTab === "stats"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => handleTabChange("leaderboard")}
                className={`py-3 px-6 font-medium ${
                  activeTab === "leaderboard"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Leaderboard
              </button>
            </div>

            {/* Main content based on active tab */}
            {activeTab === "dashboard" && (
              <Dashboard
                healthData={healthData}
                handleInputChange={handleInputChange}
                saveHealthData={saveHealthData}
                isLoading={isLoading}
                ownedBadges={ownedBadges}
              />
            )}
            {activeTab === "badges" && (
              <Badges
                availableBadges={availableBadges}
                purchaseBadge={purchaseBadge}
                isLoading={isLoading}
              />
            )}
            {activeTab === "stats" && (
              <Statistics
                platformStats={platformStats}
                userStats={userStats}
                healthData={healthData}
                ownedBadges={ownedBadges}
              />
            )}
            {activeTab === "leaderboard" && (
              <Leaderboard vitaVerseNFT={vitaVerseNFT} account={account} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VitaVerseApp;
