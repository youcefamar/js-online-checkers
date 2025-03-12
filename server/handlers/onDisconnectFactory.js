const { endGame,getGameForPlayer } = require('../gameManager');
const sendGames = require('../helpers/sendGames');

module.exports = ({ io, socket }) => () => {
  const game = getGameForPlayer(socket);
  if (!game || game.aiOpponent) {
    console.log("AI game detected, preventing premature end.");
    return; // 🚀 Prevent AI games from ending when a player disconnects
  }
  endGame({player:socket});
  sendGames(io);
};
