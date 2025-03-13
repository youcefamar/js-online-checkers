# Online Checkers Game with AI

## Overview
This is a real-time online checkers game that allows players to compete against each other or play against an AI opponent. The project consists of a **React frontend** and a **Node.js backend** with WebSocket support for live gameplay.

## Features
- Play checkers online with friends or against AI.
- Real-time gameplay using WebSockets (`socket.io`).
- AI opponent using the Minimax algorithm with alpha-beta pruning.
- Multiplayer support with game lobbies.
- Chat functionality within games.
- Responsive UI using React and Bootstrap.

## Technologies Used
### Backend (Node.js & Express)
- **Express.js** - Handles server logic.
- **Socket.io** - Real-time communication.
- **Minimax Algorithm** - AI decision-making.
- **Game Manager** - Handles game state, moves, and rules.

### Frontend (React)
- **React.js** - UI framework.
- **Bootstrap** - Styling and layout.
- **Socket.io-client** - Connects to the WebSocket server.

---

## Installation & Setup
### 1. Clone the Repository
```sh
git clone https://github.com/youcefamar/js-online-checkers.git
you can use vscode or just run it on your terminal 
```
### 2. Backend Setup
```sh
cd server
npm install
npm start
```
The backend server will start on `http://localhost:4000`.

### 3. Frontend Setup
```sh
cd ../client
npm install
npm start
```
The React app will start on `http://localhost:3000`.

---

## How to Play
1. Open the game in your browser (`http://localhost:3000`).
2. Join an existing game or create a new one.
3. Choose to play against a friend or AI.
4. Make your moves and enjoy the game!

---
## Project Structure
### Backend (`backend/`)
- `server.js` - Main Express & WebSocket server.
- `gameManager.js` - Manages game state.
- `aiBot.js` - AI logic with Minimax.
- `movePiece.js` - Validates and executes moves.
- `factories/` - Handles socket events (`createGameFactory.js`, `joinGameFactory.js`, etc.).

### Frontend (`frontend/`)
- `App.js` - Main application logic.
- `Game.jsx` - Board UI & player actions.
- `Lobby.jsx` - Displays available games.
- `CreateNewGame.jsx` - Game creation form.
- `index.js` - React entry point.
- `styles/` - Contains CSS files (`Game.css`, `App.css`).

---

## WebSocket Events
| Event           | Description |
|---------------|-------------|
| `create-game`  | Creates a new game (vs AI or multiplayer). |
| `join-game`    | Joins an existing game. |
| `move-piece`   | Sends a move request to the server. |
| `game-updated` | Receives game state updates. |
| `end-game`     | Ends the game and announces the winner. |
| `chat-message` | Sends and receives chat messages. |

---

## AI Logic (file aiBot.js)

1. Board Evaluation (evaluateBoard function)
Assigns a score based on the number and type of pieces on the board.
Pawns are worth 5 points, queens are worth 10 points.
Additional points are given to pawns that are closer to promotion (i.e., reaching the last row).
2. Finding Valid Moves (getValidMoves function)
Identifies all possible moves for a given player.
Ensures moves follow the game rules (e.g., diagonal movement, capturing opponents).
Handles multi-jumps (chains of captures in a single turn).
3. Applying Moves (applyMove function)
Simulates moving a piece to a new position.
Removes captured pieces from the board.
Promotes pawns to queens if they reach the opposite end of the board.
4. Minimax Algorithm (minimax function)
Recursive decision-making function that simulates different future game states.
Alternates between maximizing (AI's turn) and minimizing (opponent's turn).
Uses alpha-beta pruning to optimize performance by cutting off unnecessary calculations.
Evaluates board states at a depth of 5 moves ahead.
5. Choosing the Best Move (getBestMove function)
Calls minimax on all valid moves.
Picks the move with the highest evaluated score.
Adds bonuses for captures and promotions.
6. AI Turn Execution
When it's AI's turn (black), the game calls getBestMove.
The AI selects and makes the optimal move.
If the AI can make multiple jumps, it continues until no more jumps are available.
Example of AI Move Execution Flow
Player moves a piece.
If it's the AI's turn, getBestMove is called.
AI evaluates possible moves using Minimax.
The best move is applied.
If a jump is available, AI continues moving.
The updated game state is sent back to the frontend.
