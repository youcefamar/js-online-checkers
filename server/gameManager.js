let nextGameId = 0;

const movePiece = require('./movePiece');

const { getBestMove } = require('./aiBot');//adding aibot
const games = [];

const getGameForPlayer = (player) => {
  const game = games.find((g) => g.players.find((p) => p.socket === player));
  
  if (!game) {
    console.error("Error: No game found for player", player);
    console.log("Current Games:", games);
    return null;
  }

  return game;
};

exports.getGames = () =>
  games.map((g) => {
    const { players, ...game } = g;
    return {
      ...game,
      aiOpponent: g.aiOpponent, // Explicitly include the AI opponent flag
      numberOfPlayers: players.length,
    };
  });
exports.createGame = ({ player, name ,aiOpponent = false}) => {
  const game = {
    name,
    turn: 'red',
    players: [
      {
        socket: player,
        color: 'red',
      },
    ],
    aiOpponent,//add ai flag
    chat: [],
    id: nextGameId++,
    board: [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
    ],
  };

  if (aiOpponent) {
    game.players.push({ socket: "AI", color: "black" });  //AI is auto-joined
}


  games.push(game);
  console.log("Game Created:", game); // Debugging line
  return game;
};
exports.createAIGame = ({ player, name }) => {
  const game = exports.createGame({ player, name, aiOpponent: true });

  if (!game || !game.board) {
    console.error("Error: AI game was not created correctly!", game);
    return null;
  }

  return game;
};
exports.movePiece = ({
  player,
  selectedPiece,
  destination,
  game
}) => {
  // If a game object is passed directly, use it (for AI moves)
  // Otherwise find the game for the player
  const currentGame = game || getGameForPlayer(player);
  if (!currentGame) return null;
  
  movePiece({ game: currentGame, destination, selectedPiece });
  return currentGame;
};
exports.getGameById = (gameId) =>
  exports.getGames().find((g) => g.id === gameId);

exports.addPlayerToGame = ({ player, gameId }) => {
  const game = games.find((g) => g.id === gameId);

  game.players.push({
    color: 'black',
    socket: player,
  });

  return 'black';
};

exports.endGame = ({ player, winner }) => {
  const game = getGameForPlayer(player);
  // players might disconnect while in the lobby
  if (!game) {
    console.error("❌ Tried to end a game, but no game found!", player);
    return;}
    console.log("Ending game:", game);
    if (!game.aiOpponent) {  // ✅ Multiplayer games can be removed
      games.splice(games.indexOf(game), 1);
    }
  game.players.forEach((currentPlayer) => {
   if(currentPlayer.socket !== "AI"){
    if (player !== currentPlayer.socket)
      currentPlayer.socket.emit('end-game');
    if (winner) currentPlayer.socket.emit('winner', winner);
   }
  });
};

exports.isGameOver = ({ player }) => {
  const game = getGameForPlayer(player);
  if (!game || !game.board) {
    console.error("Error: Trying to check game over, but game is missing!", game);
    return false; // ✅ Safe return instead of crashing
  }
  let redCount = 0;
  let blackCount = 0;
  for (let i = 0; i < game.board.length; i++) {
    for (let j = 0; j < game.board[i].length; j++) {
      if (
        game.board[i][j] === 1 ||
        game.board[i][j] === 3
      ) {
        redCount++;
      }
      if (
        game.board[i][j] === 2 ||
        game.board[i][j] === 4
      ) {
        blackCount++;
      }
    }
  }
  console.log("Checking game over state: Red =", redCount, ", Black =", blackCount);
  if (redCount === 0) {
    return 'black';
  } else if (blackCount === 0) {
    return 'red';
  } else {
    return false;
  }
};

exports.addChatMessage = ({ player, message }) => {
  const game = getGameForPlayer(player);
  game.chat.push(message);
};
exports.getGameForPlayer = getGameForPlayer;