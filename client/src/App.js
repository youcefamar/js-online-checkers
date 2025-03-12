import React, { useEffect, useState } from 'react';
import './App.css';
import io from 'socket.io-client';
import CreateNewGame from './CreateNewGame';
import Lobby from './Lobby';
import Game from './Game';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

import 'bootstrap/dist/css/bootstrap.min.css';

const PAGE_GAME = 'Game';
const PAGE_LOBBY = 'Lobby';
const PAGE_CREATE_NEW_GAME = 'CreateNewGame';

function App() {
  const [page, setPage] = useState('Lobby');
  const [games, setGames] = useState([]);
  const [color, setColor] = useState('');
  const [game, setGame] = useState({ board: [], chat: [] });
  const [gameId, setGameId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalText, setModalText] = useState('');

  const joinGame = (gameId) => {
    socket.emit('join-game', gameId);
    setPage(PAGE_GAME);
    setGameId(gameId);
  };

  const movePiece = ({ selectedPiece, destination }) => {
    socket.emit('move-piece', {
      selectedPiece,
      destination,
    });
  };

  useEffect(() => {
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      setGame({
        board: [],
        chat: [],
      });
    } else {
      setGame(game);
    }
  }, [games, gameId]);

  const leaveGame = () => {
    setPage(PAGE_LOBBY);
    socket.emit('leave-game');
  };

  const createGame = (name, playAgainstAI = false) => {
    socket.emit('create-game', { name, aiOpponent: playAgainstAI });
    setTimeout(() => {
      setPage(PAGE_GAME);
    }, 100);
   // socket.once('your-game-created', (gameId) => {
    //  setGameId(gameId);
    //  setPage(PAGE_GAME);
    //});
  };

  const sendChat = (message) => {
    socket.emit('chat-message', message);
  };

  useEffect(() => {
    const newSocket = io('http://localhost:4000', {
      transports: ['websocket'],
    });
    
    newSocket.on('disconnect', () => {
      setGameId(null);
      setColor('');
      setPage(PAGE_LOBBY);
      setShowModal(true);
      setModalTitle('Connection Lost');
      setModalText('The server connection was lost. Please refresh the page.');
    });
    
    newSocket.on('games', (games) => {
      setGames(games);
    });
    
    newSocket.on('your-game-created', (gameId) => {
      setGameId(gameId);
    });
    
    newSocket.on('color', (color) => setColor(color));
    
    newSocket.on('end-game', () => {
      setGameId(null);
      setColor('');
      setPage(PAGE_LOBBY);
      setShowModal(true);
      setModalText('Your opponent has left the game');
      setModalTitle('Game Over');
    });
    
    newSocket.on('winner', (winner) => {
      setShowModal(true);
      setModalTitle('Game Over');
      setModalText(`${winner.toUpperCase()} has won the game!`);
      
      // After a short delay, return to lobby
      setTimeout(() => {
        setGameId(null);
        setColor('');
        setPage(PAGE_LOBBY);
      }, 3000);
    });
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleCloseModal = () => setShowModal(false);

  const handleBackToLobby = () => {
    setPage(PAGE_LOBBY);
    handleCloseModal();
  };

  return (
    <>
      <Navbar className="mb-4" bg="dark" variant="dark">
        <Navbar.Brand href="#home">
          React Online Checkers
        </Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link onClick={() => setPage(PAGE_LOBBY)}>
            Lobby
          </Nav.Link>
        </Nav>
      </Navbar>
      <Container>
        <Row>
          <Col>
            {page === PAGE_LOBBY && (
              <Lobby
                games={games}
                setPage={setPage}
                joinGame={joinGame}
              />
            )}
            {page === PAGE_CREATE_NEW_GAME && (
              <CreateNewGame createGame={createGame} />
            )}
            {page === PAGE_GAME && (
              <Game
                color={color}
                game={game}
                leaveGame={leaveGame}
                movePiece={movePiece}
                sendChat={sendChat}
                socket ={socket}
              />
            )}
          </Col>
        </Row>
      </Container>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalText}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleBackToLobby}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;
