// ABIs
export const YodaTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// ABI aggiornato per essere compatibile con il nuovo contratto
export const VitaVerseNFTABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function updateHealthData(uint256 weight, uint256 sleepHours, uint256 energyLevel, uint256 exercise, uint256 waterIntake) returns (bool)",
  "function getHealthData(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
  "function purchaseBadge(uint256 badgeId) returns (bool)",
  // Funzione badges aggiornata per corrispondere alla struct del contratto
  "function getUserStats(address _user) view returns (uint256, uint256, uint256, uint256, uint256)",
  "function badges(uint256 badgeId) view returns (string, string, uint256, uint256, uint256, bytes32, bool)",
  "function hasBadge(address user, uint256 badgeId) view returns (bool)",
  "function getTopHealthUsers(uint256 limit) view returns (address[] memory, uint256[] memory)",
  // Eventi

  "event HealthDataUpdated(address indexed user, uint256 weight, uint256 sleepHours, uint256 energyLevel, uint256 exercise, uint256 waterIntake)",
  "event BadgeEarned(address indexed user, uint256 badgeId, string badgeName)",
  "event BadgePurchased(address indexed user, uint256 badgeId, uint256 price)",
];

// Indirizzi dei contratti sulla testnet Sepolia
export const YODA_TOKEN_ADDRESS = "0x3C9AcB0Df0316b9B9A66C6d727668c200C1c5Dd1"; 
export const VITAVERSE_NFT_ADDRESS = "0xC348F3b3FE2D8dDD1116867D64D64b67281D1f4a";

// Badge predefiniti
export const defaultBadges = [
  {
    id: 0,
    name: "Early Bird",
    description: "Completed 7 consecutive days of morning exercise",
    price: 20,
    supply: 100,
    remaining: 100,
    type: "EarlyBird",
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
    earned: false,
  },
  {
    id: 2,
    name: "Hydration Hero",
    description: "Maintained daily water intake above 2500ml for 14 days",
    price: 30,
    supply: 75,
    remaining: 75,
    type: "HydrationHero",
    earned: false,
  },
];

// Dati di salute predefiniti
export const defaultHealthData = {
  weight: 700, // Stored as 70.0 kg * 10
  sleepHours: 75, // Stored as 7.5 hours * 10
  energyLevel: 8,
  exercise: 30,
  waterIntake: 2000,
  lastUpdated: 0,
};