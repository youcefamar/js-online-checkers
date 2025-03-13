import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import classNames from 'classnames';

import './Game.css';

const colorMap = {
  0: 'empty',
  1: 'red',
  2: 'black',
  3: 'redQueen',
  4: 'blackQueen',
};
//export default function Game({ leaveGame, movePiece, game, color, sendChat, socket }) {

export default function Game({ leaveGame, movePiece, game, color, sendChat,socket }) {
  const [selectedPiece, setSelectedPiece] = useState({});
  const [chatText, setChatText] = useState('');
  const [gameState, setGame] = useState(game);

  useEffect(() => {
    return () => {
      // Only call leaveGame when unmounting if this is not an AI game
      if (!game.aiOpponent) {
        leaveGame();
      }
    };
  }, [leaveGame, game.aiOpponent]);
  //see if  ai properly passed
  useEffect(() => {
    console.log("Game props:", { game, color });
    console.log("Is game started:", game?.aiOpponent, game?.numberOfPlayers);
  }, [game, color]);
  useEffect(() => {
    if(!socket) return;
    socket.on('game-updated', (updatedGame) => {
      console.log(" Received game update in frontend", updatedGame);
        if (updatedGame.id === gameState.id) {
            console.log("Game updated:", updatedGame);
            setGame({ ...updatedGame });  // Update the board after AI moves
        }
    });
    return () => {
        socket.off('game-updated'); // Cleanup listener on unmount
    };
}, [gameState?.id, socket]); // Re-run when `game` changes
  const isUserTurn = game && game.turn === color;
  const isAITurn = game && game.aiOpponent && game.turn === 'black';

  const selectPiece = (i, j) => {
    if (!isUserTurn || isAITurn) return;
    if (colorMap[game.board[i][j]] !== color && colorMap[game.board[i][j]] !== `${color}Queen`) return;
    setSelectedPiece({ i, j });
  };

  const dropSelectedPiece = (i, j) => {
    if (!isUserTurn || isAITurn) return;
    if (game.board[i][j] !== 0) return;
    if ((i + j) % 2 === 1) return;
    movePiece({ selectedPiece, destination: { i, j } });
    setSelectedPiece({});
  };

  const isPieceSelected = (i, j) => selectedPiece.i === i && selectedPiece.j === j;

  const getColor = (piece) => {
    if (piece === 1 || piece === 3) return 'red';
    if (piece === 2 || piece === 4) return 'black';
    return '';
  };

  const renderBoard = () => {
    if (!game || !game.board) return <p>Loading...</p>;

    return (
      <div className="board">
        {game.board.map((row, i) => (
          <div key={i} className="row">
            {row.map((piece, j) => (
              <div
                key={`${i} ${j}`}
                className={classNames('cell', { gray: (i + j) % 2 === 0, white: (i + j) % 2 !== 0 })}
                onClick={() => dropSelectedPiece(i, j)}
              >
                {piece !== 0 && (
                  <div
                    className={classNames('piece', {
                      selected: isPieceSelected(i, j),
                      red: piece === 1,
                      black: piece === 2,
                      blackQueen: piece === 4,
                      redQueen: piece === 3,
                      clickable: getColor(piece) === color && isUserTurn && !isAITurn,
                    })}
                    onClick={() => selectPiece(i, j)}
                  ></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderChat = () => {
    return (
      <div>
        <h2>Game Chat</h2>
        {game?.chat?.map((message, idx) => <div key={idx}>{message}</div>)}
        <div className="chat-input-wrapper">
          <Form.Control
            type="text"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="Enter your chat here"
          />
          <Button
            className="chat-button"
            variant="primary"
            onClick={() => {
              sendChat(chatText);
              setChatText('');
            }}
          >
            Send
          </Button>
        </div>
      </div>
    );
  };

  const isGameStarted = () => game?.aiOpponent || game?.numberOfPlayers === 2;

  const renderWaiting = () => (
    <Col>
      <div className="text-center">
        <h2 className="mb-4">{game?.name?.toString()}</h2>
        <div className="mb-4">
          <Spinner animation="border" role="status" />
        </div>
        <span>Waiting for an opponent...</span>
      </div>
    </Col>
  );

  const renderTurnStatus = () => {
    if (isAITurn) {
      return (
        <div className="mb-3">
          <Spinner animation="border" size="sm" className="mr-2" />
          AI is thinking...
        </div>
      );
    }
    return isUserTurn ? 
      <div className="mb-3">It's your turn!</div> : 
      <div className="mb-3">Waiting for opponent's move...</div>;
  };

  const renderGameHeader = () => (
    <div className="mb-4">
      <h2>{game?.name} {game?.aiOpponent ? '(vs AI)' : ''}</h2>
      <div>Your pieces are <span className={`text-${color}`}>{color}</span></div>
      {renderTurnStatus()}
    </div>
  );

  const renderGame = () => (
    <>
      <Col md={7}>
        {renderGameHeader()}
        {renderBoard()}
      </Col>
      <Col md={5}>{renderChat()}</Col>
    </>
  );

  return <Row>{!isGameStarted() ? renderWaiting() : renderGame()}</Row>;
}