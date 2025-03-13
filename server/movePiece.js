const RED_PAWN = 1;
const BLACK_PAWN = 2;
const RED_QUEEN = 3;
const BLACK_QUEEN = 4;
const TOP_ROW = 0;
const BOTTOM_ROW = 7;

module.exports = ({ game, destination, selectedPiece }) => {
  if (
    selectedPiece.i === undefined ||
    selectedPiece.j === undefined
  )
    return;
  const i = selectedPiece.i;
  const j = selectedPiece.j;
  const di = destination.i;
  const dj = destination.j;
  const distanceI = destination.i - selectedPiece.i;
  const distanceJ = destination.j - selectedPiece.j;
  const oneCellForwardI =
    i + Math.abs(distanceI) / distanceI;
  const oneCellForwardJ =
    j + Math.abs(distanceJ) / distanceJ;
  const destinationPiece = game.board[di][dj];
  const piece = game.board[i][j];

  // only move to empty spaces
  if (destinationPiece !== 0) return;

  // must move diagonal
  if (Math.abs(distanceI) !== Math.abs(distanceJ)) return;

  // red pawn can't move up
  if (piece === RED_PAWN && di <= i) return;

  // black pawn can't move down
  if (piece === BLACK_PAWN && di >= i) return;
  
  // determine the max move distance based on piece type
  const maxMoveDistance = (piece === RED_QUEEN || piece === BLACK_QUEEN) ? 7 : 2;
  
  // can only move up to maxMoveDistance slots
  if (Math.abs(distanceI) > maxMoveDistance) return;

  // Check if jumping a piece when moving 2 or more slots
  if (Math.abs(distanceI) >= 2) {
    // For each step along the diagonal path
    let checkI = i;
    let checkJ = j;
    let jumpedCount = 0;
    
    for (let step = 1; step < Math.abs(distanceI); step++) {
      checkI += Math.sign(distanceI);
      checkJ += Math.sign(distanceJ);
      
      const cellContent = game.board[checkI][checkJ];
      
      // If cell is empty, continue for queens, fail for pawns
      if (cellContent === 0) {
        if (piece === RED_PAWN || piece === BLACK_PAWN) {
          return; // Pawns can't jump over empty spaces
        }
        continue;
      }
      
      // Can't jump over your own pieces
      const isPlayerPiece = 
        ((piece === RED_PAWN || piece === RED_QUEEN) && 
         (cellContent === RED_PAWN || cellContent === RED_QUEEN)) ||
        ((piece === BLACK_PAWN || piece === BLACK_QUEEN) && 
         (cellContent === BLACK_PAWN || cellContent === BLACK_QUEEN));
         
      if (isPlayerPiece) {
        return;
      }
      
      // Can't jump over more than one piece at a time (unless it's a queen)
      jumpedCount++;
      if (jumpedCount > 1 && (piece === RED_PAWN || piece === BLACK_PAWN)) {
        return;
      }
      
      // If it's a valid jump, clear the jumped piece
      game.board[checkI][checkJ] = 0;
    }
  }

  // Move the piece
  game.board[di][dj] = game.board[i][j];
  game.board[i][j] = 0;

  // Handle promotion
  if (piece === RED_PAWN && di === BOTTOM_ROW) {
    game.board[di][dj] = RED_QUEEN;
  } else if (piece === BLACK_PAWN && di === TOP_ROW) {
    game.board[di][dj] = BLACK_QUEEN;
  }

  // Change turn
  game.turn = game.turn === 'red' ? 'black' : 'red';
};