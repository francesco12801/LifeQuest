# VitaVerse - Francesco Tinessa 

## Features

- Health metrics tracking (weight, sleep, energy, exercise, water intake)
- NFT badges for achievements
- YODA token rewards
- Leaderboard system
- Statistics and analytics
- Blockchain integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher)
- MetaMask browser extension
- Git

## Dependencies

The project uses the following main dependencies:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "ethers": "^5.7.2",
    "recharts": "^2.7.2",
    "tailwindcss": "^3.3.0"
  }
}
```

## Installation

1. Clone the repository:
```bash
git clone 'git-hub-repo'
cd vitaverse
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

## Smart Contract

The application interacts with a smart contract deployed on the Ethereum network. Make sure to:

1. Have MetaMask installed and configured
2. Be connected to the correct network
3. Have sufficient ETH for gas fees

## Project Structure

```
vitaverse/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Statistics.jsx
│   │   ├── Leaderboard.jsx
│   │   └── Badges.jsx
│   ├── constants/
│   │   └── abi/
│   └── App.jsx
├── public/
├── index.html
└── package.json
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

