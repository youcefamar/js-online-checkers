import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

export default function Lobby({
  setPage,
  joinGame,
  games,
}) {
  return (
    <div className="lobby">
      <h1 className="mb-4">Game Lobby</h1>
      <div className="mb-4">
        <Button
          variant="primary"
          onClick={() => setPage('CreateNewGame')}
        >
          Create New Game
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Game Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">No games created yet</td>
            </tr>
          )}
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.name}</td>
              <td>
                {game.aiOpponent ? 
                  <Badge variant="info">vs AI</Badge> : 
                  <Badge variant="primary">Multiplayer</Badge>
                }
              </td>
              <td>
                {game.aiOpponent ? 
                  'Ready to play' : 
                  <>
                    {game.numberOfPlayers}/2 players
                    {game.numberOfPlayers === 2 && <Badge variant="secondary" className="ml-2">Full</Badge>}
                  </>
                }
              </td>
              <td>
                {(!game.aiOpponent && game.numberOfPlayers < 2) && (
                  <Button onClick={() => joinGame(game.id)} variant="success" size="sm">
                    Join Game
                  </Button>
                )}
                {(game.aiOpponent) && (
                  <Button onClick={() => joinGame(game.id)} variant="success" size="sm" disabled={game.numberOfPlayers >= 2}>
                    Play vs AI
                  </Button>
                )}
                {(!game.aiOpponent && game.numberOfPlayers >= 2) && (
                  <Button variant="secondary" size="sm" disabled>
                    Game Full
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}