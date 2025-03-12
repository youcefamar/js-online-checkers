const { movePiece, isGameOver, endGame, getGameForPlayer } = require('../gameManager');
const { getBestMove } = require('../aiBot');
const sendGames = require('../helpers/sendGames');

module.exports = ({ io, socket }) => ({ selectedPiece, destination }) => {
    // Get the current game state first
    const game = movePiece({ player: socket, selectedPiece, destination });
    const currentgame = getGameForPlayer(socket); // Get current game

    if (!currentgame || !currentgame.board) {
        console.error("Error: Game state missing when checking game over", game);
        return;
    }
    const winner = isGameOver({ player: socket });

    if (winner !== false) {
        console.log("✅ Game Over Detected! Winner:", winner);
        endGame({ player: socket, winner });
    } else if (game && game.aiOpponent && game.turn === 'black') {
        console.log("✅ Game is NOT over, continuing play.");
        console.log("AI turn detected, making move...");

        setTimeout(() => {
            if (!game || !game.board) {
                console.error("Error: AI game state is missing or corrupted!", game);
                return;
            }
        
            const aiMove = getBestMove(game.board);
        
            if (aiMove) {
                console.log("AI Move:", aiMove);
                movePiece({
                    game,
                    selectedPiece: aiMove.from,
                    destination: aiMove.to
                });
        
                const aiWinner = isGameOver({ player: socket });
                if (aiWinner !== false) {
                    endGame({ player: socket, winner: aiWinner });
                } else {
                    console.log("✅ AI move applied. Sending updated game state...");
                    const safeGame = {
                        ...game,
                        players: game.players.map(p => ({ color: p.color })),
                    };
                    io.emit("game-updated", safeGame);
                    sendGames(io);
        
                    // 🚀 If it's still AI's turn, make another move
                    if (game.turn === 'black' && game.aiOpponent) {
                        setTimeout(() => {
                            console.log("🔄 AI is making another move...");
                            movePieceFactory({ io, socket })({ selectedPiece: aiMove.to, destination: getBestMove(game.board).to });
                        }, 500);
                    }
                }
            } else {
                console.log("AI has no valid moves.");
            }
        }, 500);
        
    }



    sendGames(io);
};