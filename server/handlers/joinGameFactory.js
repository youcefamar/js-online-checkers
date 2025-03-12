const {
  getGameById,
  addPlayerToGame,
} = require('../gameManager');
const sendGames = require('../helpers/sendGames');

module.exports = ({ io, socket }) => (gameId) => {
  const game = getGameById(gameId);
  if (!game) return; // safe check
  
  if (game.aiOpponent) {
    // AI games are automatically "full" when created
    socket.emit('color', 'red'); // Always red for human
    sendGames(io);
  } else if (game.numberOfPlayers < 2) {
    const color = addPlayerToGame({ player: socket, gameId });
    socket.emit('color', color);
    sendGames(io);
  }
};