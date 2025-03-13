const RED_PAWN = 1;
const BLACK_PAWN = 2;
const RED_QUEEN = 3;
const BLACK_QUEEN = 4;
const MAX_DEPTH = 6;

// Enhanced to return detailed information about the board
function evaluateBoard(board) {
    let score = 0;
    let redCount = 0;
    let blackCount = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let piece = board[i][j];
            if (piece === RED_PAWN) {
                score += 5;
                // Increase the value of pawns that are closer to becoming queens
                score += i * 0.8; // Increased multiplier to prioritize promotion
                redCount++;
            }
            else if (piece === BLACK_PAWN) {
                score -= 5;
                // Increase the value of pawns that are closer to becoming queens
                score -= (7 - i) * 0.8; // Increased multiplier to prioritize promotion
                blackCount++;
            }
            else if (piece === RED_QUEEN) {
                score += 10;
                redCount++;
            }
            else if (piece === BLACK_QUEEN) {
                score -= 10;
                blackCount++;
            }
        }
    }
    
    return {
        score,
        pieceCounts: {
            red: redCount,
            black: blackCount
        }
    };
}

// Fixed to properly handle captures and prioritize capturing moves
function getValidMoves(board, playerColor, currentPos = null, jumped = []) {
    let moves = [];
    let captureMoves = []; // Separate array for capture moves
    
    const isPiecePlayerColor = (piece) => {
        if (playerColor === 'red') {
            return piece === RED_PAWN || piece === RED_QUEEN;
        } else {
            return piece === BLACK_PAWN || piece === BLACK_QUEEN;
        }
    };

    // Debug info for tracking pieces and their possible moves
    let piecesFound = 0;
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (currentPos && (i !== currentPos.i || j !== currentPos.j)) continue;

            const piece = board[i][j];
            if (!isPiecePlayerColor(piece)) continue;
            
            piecesFound++;
            
            const isQueen = piece === RED_QUEEN || piece === BLACK_QUEEN;
            const directions = [];
            
            // Fixed direction logic - ensure queens get all directions
            if (piece === RED_PAWN) {
                directions.push({ di: 1, dj: 1 }, { di: 1, dj: -1 });
            } else if (piece === BLACK_PAWN) {
                directions.push({ di: -1, dj: 1 }, { di: -1, dj: -1 });
            } else if (isQueen) {
                // Queens get all four diagonal directions
                directions.push(
                    { di: 1, dj: 1 }, 
                    { di: 1, dj: -1 }, 
                    { di: -1, dj: 1 }, 
                    { di: -1, dj: -1 }
                );
            }

            let pieceMoves = 0;
            
            // First check for capture moves
            for (const dir of directions) {
                const di1 = i + dir.di;
                const dj1 = j + dir.dj;
                
                if (di1 < 0 || di1 >= 8 || dj1 < 0 || dj1 >= 8) continue;
                
                const middlePiece = board[di1][dj1];
                const isOpponentPiece = 
                    (playerColor === 'red' && (middlePiece === BLACK_PAWN || middlePiece === BLACK_QUEEN)) ||
                    (playerColor === 'black' && (middlePiece === RED_PAWN || middlePiece === RED_QUEEN));
                
                if (isOpponentPiece) {
                    const di2 = di1 + dir.di;
                    const dj2 = dj1 + dir.dj;
                    
                    if (di2 >= 0 && di2 < 8 && dj2 >= 0 && dj2 < 8 && board[di2][dj2] === 0) {
                        const alreadyJumped = jumped.some(pos => pos.i === di1 && pos.j === dj1);
                        
                        if (!alreadyJumped) {
                            let newJumped = [...jumped, { i: di1, j: dj1 }];
                            captureMoves.push({ from: { i, j }, to: { i: di2, j: dj2 }, jumped: newJumped });
                            pieceMoves++;
                            
                            // Check for additional captures from the new position
                            let newBoard = applyMove(board, { from: { i, j }, to: { i: di2, j: dj2 }, jumped: newJumped });
                            let nextMoves = getValidMoves(
                                newBoard, 
                                playerColor, 
                                { i: di2, j: dj2 }, 
                                []  // Reset jumped list since we're using a new board state
                            );
                            
                            // Filter to only include jump sequences
                            let nextCaptures = nextMoves.filter(m => m.jumped && m.jumped.length > 0);
                            
                            // Combine the jumps for complete multi-jump paths
                            for (const nextMove of nextCaptures) {
                                captureMoves.push({
                                    from: { i, j },
                                    to: nextMove.to,
                                    jumped: [...newJumped, ...nextMove.jumped]
                                });
                                pieceMoves++;
                            }
                        }
                    }
                }
            }
            
            // If no captures, check for regular moves
            if (jumped.length === 0) {  // Only add regular moves if not in the middle of a jump sequence
                for (const dir of directions) {
                    const maxSteps = isQueen ? 7 : 1;
                    
                    for (let step = 1; step <= maxSteps; step++) {
                        const di1 = i + dir.di * step;
                        const dj1 = j + dir.dj * step;
                        
                        if (di1 < 0 || di1 >= 8 || dj1 < 0 || dj1 >= 8) break;
                        
                        if (board[di1][dj1] === 0) {
                            moves.push({ from: { i, j }, to: { i: di1, j: dj1 } });
                            pieceMoves++;
                        } else {
                            break;  // Stop looking beyond an occupied square
                        }
                    }
                }
            }
        }
    }

    // Debug logging
    const debugInfo = {
        playerColor,
        piecesFound,
        captureMoves: captureMoves.length,
        regularMoves: moves.length,
        hasJumpMoves: captureMoves.length > 0
    };
    
    // Prioritize capture moves - this is a critical fix for the AI
    const result = captureMoves.length > 0 ? captureMoves : moves;
    result.debugInfo = debugInfo;
    
    return result;
}

// Fixed to handle multi-jumps correctly
function applyMove(board, move) {
    let newBoard = JSON.parse(JSON.stringify(board));
    const piece = newBoard[move.from.i][move.from.j];
    
    newBoard[move.to.i][move.to.j] = piece;
    newBoard[move.from.i][move.from.j] = 0;
    
    if (move.jumped && move.jumped.length > 0) {
        for (const jumpedPiece of move.jumped) {
            newBoard[jumpedPiece.i][jumpedPiece.j] = 0;
        }
    }
    
    // Promotion logic
    if (piece === RED_PAWN && move.to.i === 7) {
        newBoard[move.to.i][move.to.j] = RED_QUEEN;
    } else if (piece === BLACK_PAWN && move.to.i === 0) {
        newBoard[move.to.i][move.to.j] = BLACK_QUEEN;
    }
    
    return newBoard;
}

// Enhanced minimax with better handling of terminal positions and promotion bonus
function minimax(board, depth, isMaximizing, alpha, beta) {
    // Evaluate current board state
    const evaluation = evaluateBoard(board);
    
    // Check for game over conditions
    if (evaluation.pieceCounts.red === 0) return -1000; // Black wins
    if (evaluation.pieceCounts.black === 0) return 1000; // Red wins
    
    if (depth === 0) return evaluation.score;

    const currentPlayer = isMaximizing ? 'red' : 'black';
    let validMoves = getValidMoves(board, currentPlayer);
    
    // No valid moves means the current player loses
    if (validMoves.length === 0) return isMaximizing ? -1000 : 1000;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let move of validMoves) {
            let newBoard = applyMove(board, move);
            let eval = minimax(newBoard, depth - 1, false, alpha, beta);
            
            // Add bonus for captures - larger bonus for multiple captures
            if (move.jumped && move.jumped.length > 0) {
                eval += move.jumped.length * 3;
            }
            
            // Add bonus for reaching the last row (making a queen)
            if (board[move.from.i][move.from.j] === RED_PAWN && move.to.i === 7) {
                eval += 8; // Significant bonus for promotion
            }
            
            // Add bonus for safe moves (avoid putting pieces where they can be captured)
            if (!canBeCaptured(newBoard, move.to.i, move.to.j, 'black')) {
                eval += 1; // Small bonus for safe moves
            }
            
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of validMoves) {
            let newBoard = applyMove(board, move);
            let eval = minimax(newBoard, depth - 1, true, alpha, beta);
            
            // Add bonus for captures - larger bonus for multiple captures
            if (move.jumped && move.jumped.length > 0) {
                eval -= move.jumped.length * 3;
            }
            
            // Add bonus for reaching the last row (making a queen)
            if (board[move.from.i][move.from.j] === BLACK_PAWN && move.to.i === 0) {
                eval -= 8; // Significant bonus for promotion
            }
            
            // Add bonus for safe moves (avoid putting pieces where they can be captured)
            if (!canBeCaptured(newBoard, move.to.i, move.to.j, 'red')) {
                eval -= 1; // Small bonus for safe moves
            }
            
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

// New function to check if a piece can be captured
function canBeCaptured(board, i, j, opponentColor) {
    const piece = board[i][j];
    if (piece === 0) return false;
    
    const isRed = piece === RED_PAWN || piece === RED_QUEEN;
    
    // Only check if the piece matches our color and the opponent is the specified color
    if ((isRed && opponentColor !== 'black') || (!isRed && opponentColor !== 'red')) {
        return false;
    }
    
    // Check all four diagonal directions for opponent pieces that could capture this piece
    const directions = [
        { di: -1, dj: -1 }, { di: -1, dj: 1 },
        { di: 1, dj: -1 }, { di: 1, dj: 1 }
    ];
    
    for (const dir of directions) {
        const oppI = i + dir.di;
        const oppJ = j + dir.dj;
        
        // Check if opponent piece exists in this direction
        if (oppI >= 0 && oppI < 8 && oppJ >= 0 && oppJ < 8) {
            const oppPiece = board[oppI][oppJ];
            const isOpponentPiece = 
                (isRed && (oppPiece === BLACK_PAWN || oppPiece === BLACK_QUEEN)) ||
                (!isRed && (oppPiece === RED_PAWN || oppPiece === RED_QUEEN));
                
            if (isOpponentPiece) {
                // Check if there's an empty space behind this piece for the capture
                const landI = i - dir.di;
                const landJ = j - dir.dj;
                
                if (landI >= 0 && landI < 8 && landJ >= 0 && landJ < 8 && board[landI][landJ] === 0) {
                    // For pawns, ensure they can only move in their allowed direction
                    if (oppPiece === RED_PAWN && dir.di < 0) continue; // Red pawns can't move up
                    if (oppPiece === BLACK_PAWN && dir.di > 0) continue; // Black pawns can't move down
                    
                    return true; // This piece can be captured
                }
            }
        }
    }
    
    return false;
}

// Enhanced to choose better moves
function getBestMove(board) {
    // First check if AI has pieces
    const evaluation = evaluateBoard(board);
    if (evaluation.pieceCounts.black === 0) {
        return { error: "Game over - AI has no pieces" };
    }
    
    let moves = getValidMoves(board, 'black');
    
    // Enhanced debugging for no-moves situation
    if (moves.length === 0) {
        // Analyze the board to understand why there are no moves
        const blackPiecePositions = [];
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const piece = board[i][j];
                if (piece === BLACK_PAWN || piece === BLACK_QUEEN) {
                    blackPiecePositions.push({
                        position: { i, j },
                        type: piece === BLACK_PAWN ? "pawn" : "queen",
                        surroundings: getSurroundings(board, i, j)
                    });
                }
            }
        }
        
        return { 
            error: "No valid moves for AI",
            debugInfo: {
                pieceCounts: evaluation.pieceCounts,
                blackPieces: blackPiecePositions,
                moveGenDebug: moves.debugInfo
            }
        };
    }
    
    // Check if there are capture moves available
    const captureMoves = moves.filter(move => move.jumped && move.jumped.length > 0);
    
    if (captureMoves.length > 0) {
        // Always take the capture with the most pieces if available
        let bestCapture = captureMoves[0];
        for (const move of captureMoves) {
            if (move.jumped.length > bestCapture.jumped.length) {
                bestCapture = move;
            }
        }
        return bestCapture;
    }
    
    let bestMoves = [];
    let bestValue = -Infinity;
    
    // Find best move value
    for (let move of moves) {
        let newBoard = applyMove(board, move);
        
        let moveValue = 0;
        
        // Strong bonus for promotion (making a queen)
        if (board[move.from.i][move.from.j] === BLACK_PAWN && move.to.i === 0) {
            moveValue += 10; // Significant immediate bonus for promotion
        }
        
        // Penalty for moves that put the piece in danger
        if (canBeCaptured(newBoard, move.to.i, move.to.j, 'red')) {
            moveValue -= 5; // Significant penalty for unsafe moves
        }
        
        // Evaluate position after move
        let boardValue = minimax(newBoard, MAX_DEPTH, true, -Infinity, Infinity) + moveValue;
        
        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMoves = [move];
        } else if (boardValue === bestValue) {
            bestMoves.push(move);
        }
    }
    
    // If all moves are equal, prioritize safe moves
    if (bestMoves.length > 1) {
        const safeMoves = bestMoves.filter(move => {
            const newBoard = applyMove(board, move);
            return !canBeCaptured(newBoard, move.to.i, move.to.j, 'red');
        });
        
        if (safeMoves.length > 0) {
            bestMoves = safeMoves;
        }
    }
    
    // Add randomness but with less chance for obviously bad moves
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
}

// Utility function to analyze surroundings of a piece
function getSurroundings(board, i, j) {
    const surroundings = [];
    const directions = [
        { di: -1, dj: -1 }, { di: -1, dj: 1 },
        { di: 1, dj: -1 }, { di: 1, dj: 1 }
    ];
    
    for (const dir of directions) {
        const ni = i + dir.di;
        const nj = j + dir.dj;
        
        if (ni >= 0 && ni < 8 && nj >= 0 && nj < 8) {
            surroundings.push({
                direction: `${dir.di},${dir.dj}`,
                content: board[ni][nj],
                position: { i: ni, j: nj }
            });
        }
    }
    
    return surroundings;
}

// Helper function to print board state for debugging
function printBoard(board) {
    let result = "";
    for (let i = 0; i < 8; i++) {
        let row = "";
        for (let j = 0; j < 8; j++) {
            let cell = board[i][j];
            let symbol = ".";
            if (cell === RED_PAWN) symbol = "r";
            else if (cell === BLACK_PAWN) symbol = "b";
            else if (cell === RED_QUEEN) symbol = "R";
            else if (cell === BLACK_QUEEN) symbol = "B";
            row += symbol + " ";
        }
        result += row + "\n";
    }
    return result;
}

module.exports = { 
    getBestMove, 
    getValidMoves, 
    applyMove, 
    evaluateBoard,
    printBoard
};