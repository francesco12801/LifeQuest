// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// basic idea of token reward distribution: DeFi
contract VitaVerseNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // YodaToken contract reference, supposing that i have to insert the address of the token given in class
    IERC20 public yodaToken;

    // Badge structure
    struct Badge {
        string name;
        string description;
        uint256 price; // it's not useful for the moment but maybe in the future i can use it to get money.
        uint256 supply;
        uint256 remaining;
        bytes32 badgeType;
        bool active;
        uint256 nextBadgeId;
        bool hasNextLevel;
    }

    // Daily health data structure
    struct DailyHealthData {
        uint256 weight;
        uint256 sleepHours;
        uint256 energyLevel;
        uint256 exercise;
        uint256 waterIntake;
        uint256 timestamp;
    }

    // User health data structure
    struct HealthData {
        uint256 weight;
        uint256 sleepHours;
        uint256 energyLevel;
        uint256 exercise;
        uint256 waterIntake;
        uint256 lastUpdated;
        uint256 streakDays;
        uint256 lastUpdateDay;
    }
    mapping(uint256 => Badge) private _badges;
    mapping(address => mapping(uint256 => bool)) public userBadges;
    mapping(address => HealthData) public userHealthData;
    mapping(address => mapping(uint256 => DailyHealthData))
        public userHealthHistory;
    mapping(address => uint256[]) public userHistoryDays;
    mapping(bytes32 => uint256) public achievementThresholds;
    mapping(bytes32 => uint256) public badgeRewards;
    address[] public activeUsers;
    mapping(address => bool) public isActiveUser;

    // Events
    // i do not need now these events but i will need them to implement my social features.
    // IDEA REMEMBER: notify all the users when some friend get a badge
    // Aggiornare l'interfaccia utente in tempo reale
    // Inviare notifiche agli utenti
    event HealthDataUpdated(
        address indexed user,
        uint256 weight,
        uint256 sleepHours,
        uint256 energyLevel,
        uint256 exercise,
        uint256 waterIntake
    );
    event BadgeEarned(address indexed user, uint256 badgeId, string badgeName);
    event NewBadgeCreated(uint256 badgeId, string name, bytes32 badgeType);
    event NextBadgeUnlocked(uint256 badgeId, string badgeName);

    constructor(
        address _yodaTokenAddress
    ) ERC721("VitaVerse Badge", "VVB") ERC721Enumerable() Ownable(msg.sender) {
        yodaToken = IERC20(_yodaTokenAddress);

        initBadges();
    }

    function initBadges() private {
        // Badges are organized in tree tier: i do not want to create so many tiers since the contract can't be so long
        _createBadge(
            "Early Bird I",
            "Completed 7 consecutive days of morning exercise",
            20 ether,
            100,
            "EarlyBirdI"
        );
        _createBadge(
            "Workout Warrior I",
            "Achieved 1000 total minutes of exercise",
            50 ether,
            50,
            "WorkoutWarriorI"
        );
        _createBadge(
            "Hydration Hero I",
            "Maintained daily water intake above 2500ml for 14 days",
            30 ether,
            75,
            "HydrationHeroI"
        );

        // Initialize second tier badges (initially inactive)
        _createBadge(
            "Early Bird II",
            "Completed 15 consecutive days of morning exercise",
            40 ether,
            50,
            "EarlyBirdII",
            false
        );
        _createBadge(
            "Workout Warrior II",
            "Achieved 2500 total minutes of exercise",
            75 ether,
            25,
            "WorkoutWarriorII",
            false
        );
        _createBadge(
            "Hydration Hero II",
            "Maintained daily water intake above 3000ml for 30 days",
            60 ether,
            35,
            "HydrationHeroII",
            false
        );

        // Initialize third tier badges (initially inactive)
        _createBadge(
            "Early Bird Master",
            "Completed 30 consecutive days of morning exercise",
            80 ether,
            25,
            "EarlyBirdMaster",
            false
        );
        _createBadge(
            "Workout Warrior Master",
            "Achieved 5000 total minutes of exercise",
            100 ether,
            10,
            "WorkoutWarriorMaster",
            false
        );
        _createBadge(
            "Hydration Hero Master",
            "Maintained daily water intake above 3500ml for 60 days",
            90 ether,
            15,
            "HydrationHeroMaster",
            false
        );

        // Link badges to their next levels
        _linkBadges(0, 3); // Early Bird I -> Early Bird II
        _linkBadges(1, 4); // Workout Warrior I -> Workout Warrior II
        _linkBadges(2, 5); // Hydration Hero I -> Hydration Hero II
        _linkBadges(3, 6); // Early Bird II -> Early Bird Master
        _linkBadges(4, 7); // Workout Warrior II -> Workout Warrior Master
        _linkBadges(5, 8); // Hydration Hero II -> Hydration Hero Master

        // Set achievement thresholds - First tier
        achievementThresholds[keccak256(abi.encodePacked("EarlyBirdI"))] = 7;
        achievementThresholds[
            keccak256(abi.encodePacked("WorkoutWarriorI"))
        ] = 1000; 
        achievementThresholds[
            keccak256(abi.encodePacked("HydrationHeroI"))
        ] = 14; 

        // Set achievement thresholds - Second tier
        achievementThresholds[keccak256(abi.encodePacked("EarlyBirdII"))] = 15;
        achievementThresholds[
            keccak256(abi.encodePacked("WorkoutWarriorII"))
        ] = 2500; 
        achievementThresholds[
            keccak256(abi.encodePacked("HydrationHeroII"))
        ] = 30; 

        // Set achievement thresholds - Third tier
        achievementThresholds[
            keccak256(abi.encodePacked("EarlyBirdMaster"))
        ] = 30;
        achievementThresholds[
            keccak256(abi.encodePacked("WorkoutWarriorMaster"))
        ] = 5000; 
        achievementThresholds[
            keccak256(abi.encodePacked("HydrationHeroMaster"))
        ] = 60; 

        // Set rewards for automatic achievement badges - First tier
        badgeRewards[keccak256(abi.encodePacked("EarlyBirdI"))] = 10 ether; 
        badgeRewards[keccak256(abi.encodePacked("WorkoutWarriorI"))] = 25 ether; 
        badgeRewards[keccak256(abi.encodePacked("HydrationHeroI"))] = 15 ether; 

        // Set rewards for automatic achievement badges - Second tier
        badgeRewards[keccak256(abi.encodePacked("EarlyBirdII"))] = 20 ether; 
        badgeRewards[
            keccak256(abi.encodePacked("WorkoutWarriorII"))
        ] = 50 ether; 
        badgeRewards[keccak256(abi.encodePacked("HydrationHeroII"))] = 30 ether; 

        // Set rewards for automatic achievement badges - Third tier
        badgeRewards[keccak256(abi.encodePacked("EarlyBirdMaster"))] = 40 ether; /
        badgeRewards[
            keccak256(abi.encodePacked("WorkoutWarriorMaster"))
        ] = 100 ether; 
        badgeRewards[
            keccak256(abi.encodePacked("HydrationHeroMaster"))
        ] = 60 ether; 
    }

    function setYodaTokenAddress(address _yodaTokenAddress) external onlyOwner {
        yodaToken = IERC20(_yodaTokenAddress);
    }

    function _createBadge(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _supply,
        string memory _type,
        bool _active
    ) internal {
        uint256 badgeId = _tokenIds.current();
        _badges[badgeId] = Badge({
            name: _name,
            description: _description,
            price: _price,
            supply: _supply,
            remaining: _supply,
            badgeType: keccak256(abi.encodePacked(_type)),
            active: _active,
            nextBadgeId: 0,
            hasNextLevel: false
        });

        emit NewBadgeCreated(
            badgeId,
            _name,
            keccak256(abi.encodePacked(_type))
        );
        _tokenIds.increment();
    }

    function _createBadge(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _supply,
        string memory _type
    ) internal {
        _createBadge(_name, _description, _price, _supply, _type, true);
    }

    function _linkBadges(uint256 _badgeId, uint256 _nextBadgeId) internal {
        _badges[_badgeId].nextBadgeId = _nextBadgeId;
        _badges[_badgeId].hasNextLevel = true;
    }

    // i also need some external function because maybe if i wanna add badges as owner i need to do that
    // adding all the onlyOwner features
    function createBadge(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _supply,
        string memory _type,
        uint256 _achievementThreshold,
        uint256 _rewardAmount,
        bool _active
    ) external onlyOwner {
        _createBadge(_name, _description, _price, _supply, _type, _active);
        uint256 badgeId = _tokenIds.current() - 1;
        bytes32 badgeType = keccak256(abi.encodePacked(_type));
        achievementThresholds[badgeType] = _achievementThreshold;
        badgeRewards[badgeType] = _rewardAmount;
    }

    function linkBadges(
        uint256 _badgeId,
        uint256 _nextBadgeId
    ) external onlyOwner {
        require(_badgeId < _tokenIds.current(), "Invalid badge ID");
        require(_nextBadgeId < _tokenIds.current(), "Invalid next badge ID");
        _linkBadges(_badgeId, _nextBadgeId);
    }

    function setAchievementThreshold(
        string memory _type,
        uint256 _threshold
    ) external onlyOwner {
        bytes32 badgeType = keccak256(abi.encodePacked(_type));
        achievementThresholds[badgeType] = _threshold;
    }

    function setRewardAmount(
        string memory _type,
        uint256 _amount
    ) external onlyOwner {
        bytes32 badgeType = keccak256(abi.encodePacked(_type));
        badgeRewards[badgeType] = _amount;
    }

    function awardBadge(address _user, uint256 _badgeId) external onlyOwner {
        require(_badgeId < _tokenIds.current(), "Invalid badge ID");
        require(!userBadges[_user][_badgeId], "Badge already owned");

        Badge storage badge = _badges[_badgeId];
        require(badge.remaining > 0, "Badge sold out");

        userBadges[_user][_badgeId] = true;

        badge.remaining -= 1;

        _mintBadge(_user);

        if (badge.hasNextLevel) {
            uint256 nextBadgeId = badge.nextBadgeId;
            _badges[nextBadgeId].active = true;
            emit NextBadgeUnlocked(nextBadgeId, _badges[nextBadgeId].name);
        }

        emit BadgeEarned(_user, _badgeId, badge.name);
    }

    // the main idea is to create a pool of yoda tokens that can be used to reward the users (obv only I can do that)
    function withdrawYodaTokens(uint256 _amount) external onlyOwner {
        require(yodaToken.transfer(owner(), _amount), "Transfer failed");
    }

    function toggleBadgeActive(
        uint256 _badgeId,
        bool _active
    ) external onlyOwner {
        require(_badgeId < _tokenIds.current(), "Invalid badge ID");
        _badges[_badgeId].active = _active;
    }

    // user check and get data

    function hasBadge(
        address _user,
        uint256 _badgeId
    ) external view returns (bool) {
        return userBadges[_user][_badgeId];
    }

    function updateHealthData(
        uint256 _weight,
        uint256 _sleepHours,
        uint256 _energyLevel,
        uint256 _exercise,
        uint256 _waterIntake
    ) external returns (bool) {
        // Get current time
        // we have toc check if it's a new day
        uint256 currentTime = block.timestamp;
        uint256 currentDay = currentTime / 86400;
        HealthData storage data = userHealthData[msg.sender];
        bool isNewDay = currentDay > data.lastUpdateDay;
        if (isNewDay) {
            if (currentDay - data.lastUpdateDay == 1) {
                data.streakDays += 1;
            } else if (data.lastUpdateDay > 0) {
                data.streakDays = 1;
            } else {
                data.streakDays = 1;
            }
            data.lastUpdateDay = currentDay;

            // Store this day in the user's history days array
            userHistoryDays[msg.sender].push(currentDay);
        }

        if (!isActiveUser[msg.sender]) {
            activeUsers.push(msg.sender);
            isActiveUser[msg.sender] = true;
        }

        // Update health data in main record and store daily
        data.weight = _weight;
        data.sleepHours = _sleepHours;
        data.energyLevel = _energyLevel;
        data.exercise = _exercise;
        data.waterIntake = _waterIntake;
        data.lastUpdated = currentTime;
        userHealthHistory[msg.sender][currentDay] = DailyHealthData({
            weight: _weight,
            sleepHours: _sleepHours,
            energyLevel: _energyLevel,
            exercise: _exercise,
            waterIntake: _waterIntake,
            timestamp: currentTime
        });

        emit HealthDataUpdated(
            msg.sender,
            _weight,
            _sleepHours,
            _energyLevel,
            _exercise,
            _waterIntake
        );

        // Check for achievements
        _checkAchievements(msg.sender);

        return true;
    }

    function getHealthData(
        address _user
    )
        external
        view
        returns (
            uint256 weight,
            uint256 sleepHours,
            uint256 energyLevel,
            uint256 exercise,
            uint256 waterIntake,
            uint256 lastUpdated
        )
    {
        HealthData memory data = userHealthData[_user];
        return (
            data.weight,
            data.sleepHours,
            data.energyLevel,
            data.exercise,
            data.waterIntake,
            data.lastUpdated
        );
    }

    function getDailyHealthData(
        address _user,
        uint256 _day
    )
        external
        view
        returns (
            uint256 weight,
            uint256 sleepHours,
            uint256 energyLevel,
            uint256 exercise,
            uint256 waterIntake,
            uint256 timestamp
        )
    {
        DailyHealthData memory data = userHealthHistory[_user][_day];
        return (
            data.weight,
            data.sleepHours,
            data.energyLevel,
            data.exercise,
            data.waterIntake,
            data.timestamp
        );
    }

    function getUserHistoryDays(
        address _user
    ) external view returns (uint256[] memory) {
        return userHistoryDays[_user];
    }

    function getUserStats(
        address _user
    )
        external
        view
        returns (
            uint256 streakDays,
            uint256 lastUpdateDay,
            uint256 totalExercise,
            uint256 waterIntake,
            uint256 badgeCount
        )
    {
        HealthData memory data = userHealthData[_user];

        // Count user badges
        uint256 count = 0;
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            if (userBadges[_user][i]) {
                count++;
            }
        }

        return (
            data.streakDays,
            data.lastUpdateDay,
            data.exercise,
            data.waterIntake,
            count
        );
    }

    // Replace the getTopHealthUsers function with this new function

    function getAllActiveUsers()
        external
        view
        returns (address[] memory users, uint256[] memory healthData)
    {
        uint256 count = activeUsers.length;
        users = new address[](count);

        // Create an array to hold multiple health data points per user
        // Index meanings: 0=sleepHours, 1=waterIntake, 2=exercise, 3=streakDays
        healthData = new uint256[](count * 4);

        for (uint256 i = 0; i < count; i++) {
            address user = activeUsers[i];
            users[i] = user;

            HealthData memory data = userHealthData[user];

            // Store the health data in the array
            healthData[i * 4] = data.sleepHours;
            healthData[i * 4 + 1] = data.waterIntake;
            healthData[i * 4 + 2] = data.exercise;
            healthData[i * 4 + 3] = data.streakDays;
        }

        return (users, healthData);
    }

    // Add this function to get badge counts efficiently
    function getUserBadgeCounts(
        address[] calldata _users
    ) external view returns (uint256[] memory badgeCounts) {
        badgeCounts = new uint256[](_users.length);

        for (uint256 i = 0; i < _users.length; i++) {
            uint256 count = 0;
            for (uint256 j = 0; j < _tokenIds.current(); j++) {
                if (userBadges[_users[i]][j]) {
                    count++;
                }
            }
            badgeCounts[i] = count;
        }

        return badgeCounts;
    }

    function badges(
        uint256 _badgeId
    )
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 price,
            uint256 supply,
            uint256 remaining,
            bytes32 badgeType,
            bool active
        )
    {
        Badge memory badge = _badges[_badgeId];
        return (
            badge.name,
            badge.description,
            badge.price,
            badge.supply,
            badge.remaining,
            badge.badgeType,
            badge.active
        );
    }

    function getBadgeDetails(
        uint256 _badgeId
    )
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 price,
            uint256 supply,
            uint256 remaining,
            bytes32 badgeType,
            bool active,
            uint256 nextBadgeId,
            bool hasNextLevel
        )
    {
        Badge memory badge = _badges[_badgeId];
        return (
            badge.name,
            badge.description,
            badge.price,
            badge.supply,
            badge.remaining,
            badge.badgeType,
            badge.active,
            badge.nextBadgeId,
            badge.hasNextLevel
        );
    }

    function _mintBadge(address _user) internal {
        uint256 newItemId = _tokenIds.current();
        _mint(_user, newItemId);
        _tokenIds.increment();
    }

    function _checkAchievements(address _user) internal {
        HealthData memory data = userHealthData[_user];

        if (
            data.streakDays >=
            achievementThresholds[
                (abi.encodePacked("EarlyBirdI"))]
        ) {
            _attemptAwardBadge(_user, 0, "EarlyBirdI");
        }
        if (
            data.streakDays >=
            achievementThresholds[keccak256(abi.encodePacked("EarlyBirdII"))] &&
            _badges[3].active
        ) {
            _attemptAwardBadge(_user, 3, "EarlyBirdII");
        }

        if (
            data.streakDays >=
            achievementThresholds[
                keccak256(abi.encodePacked("EarlyBirdMaster"))
            ] &&
            _badges[6].active
        ) {
            _attemptAwardBadge(_user, 6, "EarlyBirdMaster");
        }

        if (
            data.exercise >=
            achievementThresholds[
                keccak256(abi.encodePacked("WorkoutWarriorI"))
            ]
        ) {
            _attemptAwardBadge(_user, 1, "WorkoutWarriorI");
        }
        if (
            data.exercise >=
            achievementThresholds[
                keccak256(abi.encodePacked("WorkoutWarriorII"))
            ] &&
            _badges[4].active
        ) {
            _attemptAwardBadge(_user, 4, "WorkoutWarriorII");
        }

        if (
            data.exercise >=
            achievementThresholds[
                keccak256(abi.encodePacked("WorkoutWarriorMaster"))
            ] &&
            _badges[7].active
        ) {
            _attemptAwardBadge(_user, 7, "WorkoutWarriorMaster");
        }

        if (
            data.streakDays >=
            achievementThresholds[
                keccak256(abi.encodePacked("HydrationHeroI"))
            ] &&
            data.waterIntake >= 2500
        ) {
            _attemptAwardBadge(_user, 2, "HydrationHeroI");
        }

        if (
            data.streakDays >=
            achievementThresholds[
                keccak256(abi.encodePacked("HydrationHeroII"))
            ] &&
            data.waterIntake >= 3000 &&
            _badges[5].active
        ) {
            _attemptAwardBadge(_user, 5, "HydrationHeroII");
        }

        if (
            data.streakDays >=
            achievementThresholds[
                keccak256(abi.encodePacked("HydrationHeroMaster"))
            ] &&
            data.waterIntake >= 3500 &&
            _badges[8].active
        ) {
            _attemptAwardBadge(_user, 8, "HydrationHeroMaster");
        }
    }

    function _attemptAwardBadge(
        address _user,
        uint256 _badgeId,
        string memory _type
    ) internal {
        if (userBadges[_user][_badgeId]) {
            return;
        }

        Badge storage badge = _badges[_badgeId];

        if (badge.remaining == 0) {
            return;
        }

        if (!badge.active) {
            return;
        }

        userBadges[_user][_badgeId] = true;

        badge.remaining -= 1;

        _mintBadge(_user);

        bytes32 badgeType = keccak256(abi.encodePacked(_type));
        uint256 rewardAmount = badgeRewards[badgeType];

        if (rewardAmount > 0) {
            yodaToken.transfer(_user, rewardAmount);
        }

        if (badge.hasNextLevel) {
            uint256 nextBadgeId = badge.nextBadgeId;
            _badges[nextBadgeId].active = true;
            emit NextBadgeUnlocked(nextBadgeId, _badges[nextBadgeId].name);
        }

        emit BadgeEarned(_user, _badgeId, badge.name);
    }
}
