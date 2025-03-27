import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./style/Badges.css";
import VitaVerseNFTABI from "./constants/abi/vitaVerseABI.json";
import { CONTRACT_ADDRESS } from "./constants/constants.js";

const Badges = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 

  // Inizializza il contratto e carica i dati
  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            setAccount(accounts[0]);

    
            const abiToUse = VitaVerseNFTABI.abi ? VitaVerseNFTABI.abi : VitaVerseNFTABI;

            // Double check for the error 
            if (Array.isArray(abiToUse)) {
              const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abiToUse,
                provider.getSigner()
              );
              setContract(contract);

             
              await loadBadgesData(contract, accounts[0]);
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

  // We need badges data to be loaded before we can display them

  const loadBadgesData = async (contract, userAccount) => {
    try {
      // contract logic: 9 badges, each with a different type and reward  
      const badgesData = [];
      const userBadgesStatus = {};
      // the idea is to get all the badges(REMEBER THE THRESHOLD) and then check if the user has them
      for (let i = 0; i < 9; i++) {
        try {
          const badgeDetails = await contract.getBadgeDetails(i);          
          const hasBadge = await contract.hasBadge(userAccount, i);
          userBadgesStatus[i] = hasBadge;
          const badgeType = badgeDetails.badgeType;
          const threshold = await contract.achievementThresholds(badgeType);
          const reward = await contract.badgeRewards(badgeType);
          const badgeTypeText = getBadgeTypeAndUnit(badgeDetails.name);
          const badge = {
            id: i,
            name: badgeDetails.name,
            description: badgeDetails.description,
            supply: parseInt(badgeDetails.supply),
            remaining: parseInt(badgeDetails.remaining),
            active: badgeDetails.active,
            hasNextLevel: badgeDetails.hasNextLevel,
            nextBadgeId: parseInt(badgeDetails.nextBadgeId),
            threshold: parseInt(threshold),
            thresholdUnit: badgeTypeText.unit,
            badgeType: badgeTypeText.type,
            reward: ethers.utils.formatEther(reward), 
            image: getBadgeImage(badgeDetails.name),
          };

          badgesData.push(badge);
        } catch (error) {
          console.error(`Error loading badge ${i}:`, error);
        }
      }

      setBadges(badgesData);
      setUserBadges(userBadgesStatus);
      setLoading(false);
    } catch (error) {
      console.error("Error loading badges data:", error);
      setLoading(false);
    }
  };

  // function to get badge ttype 
  const getBadgeTypeAndUnit = (name) => {
    if (name.includes("Early Bird")) {
      return { type: "Early Bird", unit: "consecutive days" };
    } else if (name.includes("Workout Warrior")) {
      return { type: "Workout Warrior", unit: "minutes" };
    } else if (name.includes("Hydration Hero")) {
      return { type: "Hydration Hero", unit: "days above threshold" };
    } else {
      return { type: "Achievement", unit: "achievement points" };
    }
  };

  // placeholder, in my final version i should use 
  const getBadgeImage = (name) => {
    let backgroundColor, iconText;

    if (name.includes("Early Bird")) {
      backgroundColor = "#FFC107";
      iconText = "🌅";
    } else if (name.includes("Workout Warrior")) {
      backgroundColor = "#F44336";
      iconText = "💪";
    } else if (name.includes("Hydration Hero")) {
      backgroundColor = "#2196F3";
      iconText = "💧";
    } else {
      backgroundColor = "#9C27B0";
      iconText = "🏅";
    }
    if (name.includes("Master")) {
      backgroundColor = `linear-gradient(135deg, ${backgroundColor}, #FFD700)`;
    } else if (name.includes("II")) {
      backgroundColor = `linear-gradient(135deg, ${backgroundColor}, #C0C0C0)`;
    }
    return { backgroundColor, iconText };
  };

  // filtering  and manage filter 
  const getFilteredBadges = () => {
    switch (filter) {
      case "earned":
        return badges.filter((badge) => userBadges[badge.id]);
      case "available":
        return badges.filter((badge) => !userBadges[badge.id] && badge.active);
      case "locked":
        return badges.filter((badge) => !userBadges[badge.id] && !badge.active);
      default:
        return badges;
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
 
  const groupBadgesByType = () => {
    const filteredBadges = getFilteredBadges();

   
    const groups = {};

    filteredBadges.forEach((badge) => {
      const baseType = badge.badgeType;

      if (!groups[baseType]) {
        groups[baseType] = [];
      }

      groups[baseType].push(badge);
    });

    Object.keys(groups).forEach((groupKey) => {
      groups[groupKey].sort((a, b) => {
        
        const getLevel = (name) => {
          if (name.includes("Master")) return 3;
          if (name.includes("II")) return 2;
          return 1;
        };

        return getLevel(a.name) - getLevel(b.name);
      });
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="badges-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your badges...</p>
        </div>
      </div>
    );
  }

  const badgeGroups = groupBadgesByType();

  return (
    <div className="badges-container">
      <div className="badges-header">
        <h1>Achievement Badges</h1>
        <div className="badges-filter">
          <label htmlFor="filter">Show:</label>
          <select id="filter" value={filter} onChange={handleFilterChange}>
            <option value="all">All Badges</option>
            <option value="earned">Earned</option>
            <option value="available">Available</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      <div className="badges-summary">
        <div className="badge-stat">
          <span className="badge-stat-value">
            {Object.values(userBadges).filter(Boolean).length}
          </span>
          <span className="badge-stat-label">Badges Earned</span>
        </div>
        <div className="badge-stat">
          <span className="badge-stat-value">
            {badges.filter((b) => b.active && !userBadges[b.id]).length}
          </span>
          <span className="badge-stat-label">Available</span>
        </div>
        <div className="badge-stat">
          <span className="badge-stat-value">
            {badges.filter((b) => !b.active).length}
          </span>
          <span className="badge-stat-label">Locked</span>
        </div>
      </div>

      <div className="badges-grid-container">
        {Object.keys(badgeGroups).length > 0 ? (
          Object.keys(badgeGroups).map((groupName) => (
            <div key={groupName} className="badge-group">
              <h2 className="badge-group-title">{groupName}</h2>
              <div className="badges-grid">
                {badgeGroups[groupName].map((badge) => (
                  <div
                    key={badge.id}
                    className={`badge-card ${
                      userBadges[badge.id]
                        ? "earned"
                        : badge.active
                        ? "available"
                        : "locked"
                    }`}
                  >
                    <div
                      className="badge-icon"
                      style={{
                        background: badge.image.backgroundColor,
                      }}
                    >
                      <span>{badge.image.iconText}</span>
                      {!badge.active && <div className="badge-lock">🔒</div>}
                    </div>
                    <div className="badge-info">
                      <h3>{badge.name}</h3>
                      <p className="badge-description">{badge.description}</p>
                      <div className="badge-meta">
                        <div className="badge-requirement">
                          <span className="badge-label">Requirement:</span>
                          <span className="badge-value">
                            {badge.threshold} {badge.thresholdUnit}
                          </span>
                        </div>
                        <div className="badge-reward">
                          <span className="badge-label">Reward:</span>
                          <span className="badge-value">
                            {badge.reward} YODA
                          </span>
                        </div>
                      </div>
                      <div className="badge-rarity">
                        <div className="rarity-bar-container">
                          <div
                            className="rarity-bar"
                            style={{
                              width: `${Math.max(
                                5,
                                Math.min(
                                  100,
                                  ((badge.supply - badge.remaining) /
                                    badge.supply) *
                                    100
                                )
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="rarity-text">
                          {badge.remaining} of {badge.supply} remaining
                        </span>
                      </div>
                      {userBadges[badge.id] && (
                        <div className="badge-earned-status">Earned ✓</div>
                      )}
                      {!userBadges[badge.id] && badge.active && (
                        <div className="badge-progress">In progress...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-badges-message">
            <p>
              No badges match your current filter.
            </p>
          </div>
        )}
      </div>

      <div className="badges-info">
        <h2>How to Earn Badges</h2>
        <p>
          Badges are earned by meeting specific health and wellness goals in
          VitaVerse. As you track your progress, you'll automatically earn
          badges when you reach milestones like consecutive days of activity,
          exercise minutes, or hydration levels.
        </p>
        <p>
          Each badge comes with a YODA token reward. 
          Keep up your healthy habits to collect them all! 😎
        </p>
      </div>
    </div>
  );
};

export default Badges;