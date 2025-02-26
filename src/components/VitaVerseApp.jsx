import React, { useState, useEffect } from "react";
import {
  Activity,
  Moon,
  Droplet,
  ShoppingCart,
  Tag,
  Wallet,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import { ethers } from "ethers";

// Example ABI - Replace with actual ABIs exported from the Solidity compiler
// Note: In a real project, you would import these from JSON files
const YodaTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const VitaVerseNFTABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function updateHealthData(uint256 weight, uint256 sleepHours, uint256 energyLevel, uint256 exercise, uint256 waterIntake) returns (bool)",
  "function getHealthData(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
  "function purchaseBadge(uint256 badgeId) returns (bool)",
  "function badges(uint256 badgeId) view returns (string, string, uint256, uint256, uint256, string)",
  "function hasBadge(address user, uint256 badgeId) view returns (bool)",
  "event HealthDataUpdated(address indexed user, uint256 weight, uint256 sleepHours, uint256 energyLevel, uint256 exercise, uint256 waterIntake)",
  "event BadgeEarned(address indexed user, uint256 badgeId, string badgeName)",
];

// Addresses on the Sepolia testnet - replace with actual addresses
const YODA_TOKEN_ADDRESS = "0xYourYodaTokenAddressHere"; // Address provided by the professor
const VITAVERSE_NFT_ADDRESS = "0xYourVitaVerseNFTAddressHere"; // Address of your deployed contract

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
  const [healthData, setHealthData] = useState({
    weight: 700, // Stored as 70.0 kg * 10
    sleepHours: 75, // Stored as 7.5 hours * 10
    energyLevel: 8,
    exercise: 30,
    waterIntake: 2000,
    lastUpdated: 0,
  });

  // Available badges
  const [availableBadges, setAvailableBadges] = useState([
    {
      id: 0,
      name: "Early Bird",
      description: "Completed 7 consecutive days of morning exercise",
      price: 20,
      supply: 100,
      remaining: 100,
      type: "EarlyBird",
      icon: Moon,
      earned: false,
    },
    {
      id: 1,
      name: "Workout Warrior",
      description: "Achieved 1000 total minutes of exercise",
      price: 50,
      supply: 50,
      remaining: 50,
      type: "WorkoutWarrior",
      icon: Activity,
      earned: false,
    },
    {
      id: 2,
      name: "Hydration Hero",
      description:
        "Maintained daily water intake above 2500ml for 14 days",
      price: 30,
      supply: 75,
      remaining: 75,
      type: "HydrationHero",
      icon: Droplet,
      earned: false,
    },
  ]);

  // Platform statistics (in a real app, these would be fetched from the blockchain)
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
          const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setProvider(web3Provider);

          const userSigner = web3Provider.getSigner();
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
          fetchUserData(account);
          fetchPlatformStats();
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
    }
  };

  // Function to fetch user data from the blockchain
  const fetchUserData = async (userAddress) => {
    if (!yodaToken || !vitaVerseNFT) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      // 1. Get Yoda token balance
      const yodaAmount = await yodaToken.balanceOf(userAddress);
      setYodaBalance(ethers.utils.formatUnits(yodaAmount, 18));

      // 2. Get user health data
      try {
        const userData = await vitaVerseNFT.getHealthData(userAddress);
        setHealthData({
          weight: userData[0].toNumber(),
          sleepHours: userData[1].toNumber(),
          energyLevel: userData[2].toNumber(),
          exercise: userData[3].toNumber(),
          waterIntake: userData[4].toNumber(),
          lastUpdated: userData[5].toNumber(),
        });
      } catch (error) {
        console.log(
          "User has no health data registered yet, using default values."
        );
        // Keep default values in healthData
      }

      // 3. Get the number of owned badges
      try {
        const nftCount = await vitaVerseNFT.balanceOf(userAddress);
        setNftBalance(nftCount.toNumber());
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
    if (!provider) return;

    try {
      // In a real app, you might have a dedicated contract for statistics
      // or fetch events from the blockchain to calculate these metrics

      // For now, fetch some example data from the network
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      const gasPrice = await provider.getGasPrice();

      // Simulate some recent transactions (in a real app, you would fetch real events)
      const mockTransactions = [
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

      setPlatformStats({
        totalTransactions: 127, // Static example
        averageFee: parseFloat(
          ethers.utils.formatUnits(gasPrice, "gwei")
        ).toFixed(2), // Gas price in gwei
        confirmationTime: block.timestamp > 0 ? 15 : 0, // Static example (15 seconds)
        recentTransactions: mockTransactions,
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
      fetchUserData(account);
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
      const price = ethers.utils.parseUnits(badge.price.toString(), 18);

      if (balance.lt(price)) {
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
      fetchUserData(account);
      fetchPlatformStats();
    } catch (error) {
      console.error("Error purchasing:", error);
      setErrorMessage(
        "An error occurred while purchasing the badge. Check your balance and available gas."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      vitaVerseNFT.off("BadgeEarned", onBadgeEarned);
    };
  }, [vitaVerseNFT, account]);

  // Render the main dashboard
  const renderDashboard = () => (
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

  // Render the available badges page
  const renderBadges = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <div className="flex items-center mb-6 text-indigo-700">
        <Award size={20} className="mr-2" />
        <h2 className="text-xl font-semibold">Available Badges</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableBadges.map((badge) => {
          const BadgeIcon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-6 rounded-xl border ${
                badge.earned
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex justify-center mb-4">
                <div
                  className={`rounded-full p-4 ${
                    badge.earned
                      ? "bg-green-100 text-green-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  <BadgeIcon size={32} />
                </div>
              </div>

              <h3
                className={`text-lg font-medium text-center ${
                  badge.earned ? "text-green-700" : "text-gray-800"
                }`}
              >
                {badge.name}
              </h3>

              <p className="text-gray-600 text-sm text-center mt-2 mb-4">
                {badge.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center text-gray-600">
                  <Tag size={14} className="mr-1" />
                  {badge.price} YODA
                </span>
                <span className="text-gray-500">
                  {badge.remaining}/{badge.supply}
                </span>
              </div>

              <div className="mt-4">
                {badge.earned ? (
                  <div className="bg-green-100 text-green-700 py-2 px-4 rounded-lg text-center font-medium">
                    Badge Earned
                  </div>
                ) : (
                  <button
                    onClick={() => purchaseBadge(badge.id)}
                    disabled={isLoading || badge.remaining === 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium ${
                      isLoading || badge.remaining === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {badge.remaining === 0 ? "Sold Out" : "Purchase"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-indigo-700 mb-3">
          How to Earn Badges
        </h3>
        <p className="text-gray-700 mb-4">
          There are two ways to earn VitaVerse badges:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <span className="font-medium">Direct purchase:</span> You can
            purchase any badge with your YODA tokens.
          </li>
          <li>
            <span className="font-medium">Achieve goals:</span> Some badges can be
            earned automatically when you reach certain wellness goals. These badges
            will also reward you with YODA!
          </li>
        </ul>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <div className="flex items-center mb-6 text-indigo-700">
        <TrendingUp size={20} className="mr-2" />
        <h2 className="text-xl font-semibold">Platform Statistics</h2>
      </div>

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
          {platformStats.recentTransactions.map((tx) => (
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
          ))}
        </div>
      </div>

      <div className="mt-8 bg-amber-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-amber-700 mb-3">
          Performance Metrics
        </h3>
        <p className="text-gray-700 mb-4">
          As a participant in the StarPeace P2P Marketplace, the following metrics
          will be evaluated:
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
                onClick={() => setActiveTab("dashboard")}
                className={`py-3 px-6 font-medium ${
                  activeTab === "dashboard"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("badges")}
                className={`py-3 px-6 font-medium ${
                  activeTab === "badges"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                NFT Badges
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`py-3 px-6 font-medium ${
                  activeTab === "stats"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Statistics
              </button>
            </div>

            {/* Main content based on active tab */}
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "badges" && renderBadges()}
            {activeTab === "stats" && renderStats()}
          </>
        )}
      </div>
    </div>
  );
}

export default VitaVerseApp;