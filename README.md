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
cd online-checkers
```
### 2. Backend Setup
```sh
cd backend
npm install
npm start
```
The backend server will start on `http://localhost:4000`.

### 3. Frontend Setup
```sh
cd ../frontend
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

## AI Logic (Minimax)
The AI opponent uses the **Minimax algorithm with alpha-beta pruning** to make optimal moves. The AI:
- Evaluates the board to assign scores to positions.
- Simulates possible future moves up to a certain depth.
- Picks the best move based on calculated outcomes.

---

## Future Improvements
- Add user authentication.
- Enhance AI difficulty levels.
- Improve UI animations and effects.

---

## Contributors
- **Your Name** (GitHub: [yourusername](https://github.com/yourusername))

## License
This project is licensed under the MIT License.
