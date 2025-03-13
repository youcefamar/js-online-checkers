const { movePiece, isGameOver, endGame, getGameForPlayer } = require('../gameManager');
const { getBestMove } = require('../aiBot');
const sendGames = require('../helpers/sendGames');

// Create the factory function
const movePieceFactory = ({ io, socket }) => ({ selectedPiece, destination }) => {
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
        
            if (aiMove && !aiMove.error) {
                console.log("AI Move:", aiMove);
                
                // Apply the AI move
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
        
                    // Instead of recursive call, check if there are more jumps available
                    if (game.turn === 'black' && game.aiOpponent) {
                        // Get valid moves for the piece that just moved
                        const nextMoves = require('../aiBot').getValidMoves(
                            game.board, 
                            'black', 
                            aiMove.to, 
                            []
                        );
                        
                        // Filter for jump moves only
                        const jumpMoves = nextMoves.filter(m => m.jumped && m.jumped.length > 0);
                        
                        if (jumpMoves.length > 0) {
                            setTimeout(() => {
                                console.log("🔄 AI is making a follow-up jump move...");
                                
                                // Get the best jump
                                const bestJump = jumpMoves[0]; // Or add logic to select the best one
                                
                                // Apply the jump directly
                                movePiece({
                                    game,
                                    selectedPiece: bestJump.from,
                                    destination: bestJump.to
                                });
                                
                                // Update clients and check for game over
                                const jumpWinner = isGameOver({ player: socket });
                                if (jumpWinner !== false) {
                                    endGame({ player: socket, winner: jumpWinner });
                                } else {
                                    const updatedGame = {
                                        ...game,
                                        players: game.players.map(p => ({ color: p.color })),
                                    };
                                    io.emit("game-updated", updatedGame);
                                    sendGames(io);
                                }
                            }, 500);
                        }
                    }
                }
            } else {
                console.log("AI has no valid moves:", aiMove ? aiMove.error : "unknown error");
                // Maybe end the game if AI can't move
                endGame({ player: socket, winner: 'red' });
            }
        }, 500);
    }

    sendGames(io);
};

// Export the factory function
module.exports = movePieceFactory;