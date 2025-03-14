const { createGame, createAIGame } = require('../gameManager'); 
const sendGames = require('../helpers/sendGames');

module.exports = ({ io, socket }) => ({ name, aiOpponent }) => {
  console.log(`Creating game: ${name}, AI Opponent: ${aiOpponent}`);

  let game;
  if (aiOpponent) {
    console.log("Creating a game against AI...");
    game = createAIGame({ player: socket, name });
  } else {
    console.log("Creating a normal multiplayer game...");
    game = createGame({ player: socket, name });
  }

  sendGames(io);
  socket.emit('your-game-created', game.id);
  socket.emit('color', 'red');
};
