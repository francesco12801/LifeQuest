import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./style/Badges.css";

// Importa l'ABI e l'indirizzo del contratto (sostituisci con i valori reali)
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
        // In Badges.jsx, nella funzione initialize
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            setAccount(accounts[0]);

            // Usa un approccio più sicuro per accedere all'ABI
            const abiToUse = VitaVerseNFTABI.abi ? VitaVerseNFTABI.abi : VitaVerseNFTABI;

            // Inizializza il contratto solo se l'ABI è valido
            if (Array.isArray(abiToUse)) {
              const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abiToUse,
                provider.getSigner()
              );
              setContract(contract);

              // Carica i dati dei badge
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

  // Carica i dati dei badge
  const loadBadgesData = async (contract, userAccount) => {
    try {
      // Ottieni il numero di badge disponibili dal contatore
      const tokenIds = await contract.totalSupply();
      const totalBadges = parseInt(tokenIds.toString());

      // Ottieni i dettagli di ogni badge
      const badgesData = [];
      const userBadgesStatus = {};

      // Supporta fino a 20 badge
      const badgeLimit = Math.min(totalBadges, 20);

      for (let i = 0; i < badgeLimit; i++) {
        // Ottieni i dettagli del badge usando la funzione getBadgeDetails
        const badgeDetails = await contract.getBadgeDetails(i);

        // Verifica se l'utente possiede questo badge
        const hasBadge = await contract.hasBadge(userAccount, i);
        userBadgesStatus[i] = hasBadge;

        // Ottieni la soglia di achievement per questo badge
        const badgeType = badgeDetails.badgeType;
        const threshold = await contract.achievementThresholds(badgeType);

        // Ottieni la ricompensa in token per questo badge
        const reward = await contract.badgeRewards(badgeType);

        // Crea l'oggetto badge con tutti i dati
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
          reward: ethers.utils.formatEther(reward), // Converti da wei a ether
          image: getBadgeImage(badgeDetails.name),
        };

        badgesData.push(badge);
      }

      setBadges(badgesData);
      setUserBadges(userBadgesStatus);
      setLoading(false);
    } catch (error) {
      console.error("Error loading badges data:", error);
      setLoading(false);
    }
  };

  // Funzione per generare un'immagine placeholder per il badge
  const getBadgeImage = (name) => {
    // In un'implementazione reale, avresti immagini vere per i badge
    // Per ora, generiamo colori in base al nome del badge
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

    // Aggiungi sfumature in base al livello
    if (name.includes("Master")) {
      backgroundColor = `linear-gradient(135deg, ${backgroundColor}, #FFD700)`;
    } else if (name.includes("II")) {
      backgroundColor = `linear-gradient(135deg, ${backgroundColor}, #C0C0C0)`;
    }

    return { backgroundColor, iconText };
  };

  // Filtra i badge in base alla selezione corrente
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

  // Gestisci il cambio di filtro
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Mostra i badge in gruppi ordinati per tipo
  const groupBadgesByType = () => {
    const filteredBadges = getFilteredBadges();

    // Raggruppa i badge per categoria (prefisso del nome)
    const groups = {};

    filteredBadges.forEach((badge) => {
      // Determina il tipo di badge dal nome
      const nameParts = badge.name.split(" ");
      // Rimuovi numeri romani o 'Master' per ottenere il tipo base
      const baseType = nameParts.slice(0, -1).join(" ");

      if (!groups[baseType]) {
        groups[baseType] = [];
      }

      groups[baseType].push(badge);
    });

    // Ordina i badge all'interno di ogni gruppo per livello
    Object.keys(groups).forEach((groupKey) => {
      groups[groupKey].sort((a, b) => {
        // Determina il livello del badge
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
                            {badge.threshold}{" "}
                            {badge.name.includes("Workout")
                              ? "minutes"
                              : "days"}
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
              No badges match your current filter. Try changing the filter to
              see more badges.
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
          Each badge comes with a YODA token reward, and earning higher-tier
          badges unlocks access to more exclusive badges with greater rewards.
          Keep up your healthy habits to collect them all!
        </p>
      </div>
    </div>
  );
};

export default Badges;
