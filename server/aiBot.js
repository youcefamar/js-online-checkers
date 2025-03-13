const RED_PAWN = 1;
const BLACK_PAWN = 2;
const RED_QUEEN = 3;
const BLACK_QUEEN = 4;
const MAX_DEPTH = 4; // Adjust depth for performance

// Evaluate board state
function evaluateBoard(board) {
    let score = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let piece = board[i][j];
            if (piece === RED_PAWN) score += 5;
            else if (piece === BLACK_PAWN) score -= 5;
            else if (piece === RED_QUEEN) score += 10;
            else if (piece === BLACK_QUEEN) score -= 10;
        }
    }
    return score;
}

// Get possible moves for a player
// Get possible moves for a player
function getValidMoves(board, playerColor, currentPos = null, jumped = []) {
    let moves = [];
    const isPiecePlayerColor = (piece) => {
        if (playerColor === 'red') {
            return piece === RED_PAWN || piece === RED_QUEEN;
        } else {
            return piece === BLACK_PAWN || piece === BLACK_QUEEN;
        }
    };

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (currentPos && (i !== currentPos.i || j !== currentPos.j)) continue; // If continuing a jump, restrict moves

            const piece = board[i][j];
            if (!isPiecePlayerColor(piece)) continue;

            const directions = [];
            if (piece === RED_PAWN || piece === RED_QUEEN) {
                directions.push({ di: 1, dj: 1 }, { di: 1, dj: -1 });
            }
            if (piece === BLACK_PAWN || piece === BLACK_QUEEN) {
                directions.push({ di: -1, dj: 1 }, { di: -1, dj: -1 });
            }
            if (piece === RED_QUEEN || piece === BLACK_QUEEN) {
                directions.push({ di: -1, dj: 1 }, { di: -1, dj: -1 }, { di: 1, dj: 1 }, { di: 1, dj: -1 });
            }

            for (const dir of directions) {
                const di1 = i + dir.di;
                const dj1 = j + dir.dj;
                if (di1 >= 0 && di1 < 8 && dj1 >= 0 && dj1 < 8) {
                    if (board[di1][dj1] === 0 && jumped.length === 0) {  // Normal move (only if not in a jump chain)
                        moves.push({ from: { i, j }, to: { i: di1, j: dj1 } });
                    } else {
                        // Check jump move
                        const di2 = di1 + dir.di;
                        const dj2 = dj1 + dir.dj;
                        if (di2 >= 0 && di2 < 8 && dj2 >= 0 && dj2 < 8) {
                            const middlePiece = board[di1][dj1];
                            const isOpponentPiece = 
                                (playerColor === 'red' && (middlePiece === BLACK_PAWN || middlePiece === BLACK_QUEEN)) ||
                                (playerColor === 'black' && (middlePiece === RED_PAWN || middlePiece === RED_QUEEN));
                            
                            if (isOpponentPiece && board[di2][dj2] === 0) {
                                let newJumped = [...jumped, { i: di1, j: dj1 }];
                                moves.push({ from: { i, j }, to: { i: di2, j: dj2 }, jumped: newJumped });

                                // 🚀 **Recursively find more jumps from this new position**
                                let nextMoves = getValidMoves(board, playerColor, { i: di2, j: dj2 }, newJumped);
                                moves.push(...nextMoves);
                            }
                        }
                    }
                }
            }
        }
    }

    // ✅ **Prioritize jump moves over normal moves**
    const jumpMoves = moves.filter(m => m.jumped && m.jumped.length > 0);
    return jumpMoves.length > 0 ? jumpMoves : moves;
}

// Minimax Algorithm with Alpha-Beta Pruning
function minimax(board, depth, isMaximizing, alpha, beta) {
    if (depth === 0) return evaluateBoard(board);

    let validMoves = getValidMoves(board, isMaximizing ? 'red' : 'black');
    if (validMoves.length === 0) return evaluateBoard(board); // No moves left

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let move of validMoves) {
            let newBoard = applyMove(board, move);
            let eval = minimax(newBoard, depth - 1, false, alpha, beta);
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
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

// Apply a move to a board and return new board state
function applyMove(board, move) {
    let newBoard = JSON.parse(JSON.stringify(board)); // Clone board
    newBoard[move.to.i][move.to.j] = newBoard[move.from.i][move.from.j];
    newBoard[move.from.i][move.from.j] = 0;
    return newBoard;
}

// Get the best move for the AI
function getBestMove(board) {
    let bestMove = null;
    let bestValue = -Infinity;
    let moves = getValidMoves(board, 'black');

    for (let move of moves) {
        let newBoard = applyMove(board, move);
        let boardValue = minimax(newBoard, MAX_DEPTH, false, -Infinity, Infinity);
        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove;
}

module.exports = { getBestMove };