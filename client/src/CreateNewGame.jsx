import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function CreateNewGame({ createGame }) {
  const [name, setName] = useState('');
  const [playAgainstAI, setPlayAgainstAI] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a game name');
      return;
    }
    createGame(name, playAgainstAI);
  };

  return (
    <div>
      <h1 className="mb-4">Create New Game</h1>
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name">
              <Form.Label>Game Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={name}
                onChange={({ target }) => setName(target.value)}
                placeholder="Enter a name for your game"
                required
              />
            </Form.Group>
            
            <Form.Group controlId="gameType">
              <Form.Label>Game Type</Form.Label>
              <Row>
                <Col md={6}>
                  <Card 
                    className={`mb-3 ${!playAgainstAI ? 'border-primary' : ''}`} 
                    onClick={() => setPlayAgainstAI(false)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body>
                      <Form.Check
                        type="radio"
                        label="Multiplayer Game"
                        checked={!playAgainstAI}
                        onChange={() => setPlayAgainstAI(false)}
                        id="multiplayer"
                      />
                      <p className="text-muted small mt-2">Create a game that other players can join</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card 
                    className={`mb-3 ${playAgainstAI ? 'border-primary' : ''}`}
                    onClick={() => setPlayAgainstAI(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body>
                      <Form.Check
                        type="radio"
                        label="Play Against AI"
                        checked={playAgainstAI}
                        onChange={() => setPlayAgainstAI(true)}
                        id="AI"
                      />
                      <p className="text-muted small mt-2">Play against the computer AI opponent</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form.Group>
            
            <div className="text-center mt-4">
              <Button variant="primary" type="submit">
                Create Game
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => window.history.back()} 
                className="ml-2"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}