import React, { useState, useEffect, useCallback } from 'react';

const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, null];

export default function SlidingPuzzle() {
  const [board, setBoard] = useState(SOLVED_BOARD);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Timer Effect
  useEffect(() => {
    let intervalId;
    if (gameStarted && !isSolved) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [gameStarted, isSolved, startTime]);

  // Helper: check if two positions are adjacent in 3x3
  const isAdjacent = (idx1, idx2) => {
    const r1 = Math.floor(idx1 / 3);
    const c1 = idx1 % 3;
    const r2 = Math.floor(idx2 / 3);
    const c2 = idx2 % 3;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  };

  // Get valid adjacent moves for empty tile
  const getAdjacentIndices = (emptyIdx) => {
    const adj = [];
    const r = Math.floor(emptyIdx / 3);
    const c = emptyIdx % 3;

    if (r > 0) adj.push(emptyIdx - 3); // Up
    if (r < 2) adj.push(emptyIdx + 3); // Down
    if (c > 0) adj.push(emptyIdx - 1); // Left
    if (c < 2) adj.push(emptyIdx + 1); // Right
    return adj;
  };

  // Scramble board by doing a random walk of valid moves to ensure solvability
  const scrambleBoard = useCallback(() => {
    let currentBoard = [...SOLVED_BOARD];
    let emptyIdx = 8; // start at bottom right
    const scrambles = 120;

    for (let i = 0; i < scrambles; i++) {
      const validMoves = getAdjacentIndices(emptyIdx);
      const randomMoveIdx = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      // Swap empty and target tile
      currentBoard[emptyIdx] = currentBoard[randomMoveIdx];
      currentBoard[randomMoveIdx] = null;
      emptyIdx = randomMoveIdx;
    }

    setBoard(currentBoard);
    setMoves(0);
    setElapsedTime(0);
    setStartTime(Date.now());
    setIsSolved(false);
    setGameStarted(true);
  }, []);

  // Initialize game on first load
  useEffect(() => {
    scrambleBoard();
  }, [scrambleBoard]);

  // Handle tile click
  const handleTileClick = (index) => {
    if (isSolved || board[index] === null) return;

    const emptyIdx = board.indexOf(null);

    if (isAdjacent(index, emptyIdx)) {
      const newBoard = [...board];
      newBoard[emptyIdx] = board[index];
      newBoard[index] = null;
      setBoard(newBoard);
      setMoves(prev => prev + 1);

      // Check if board matches solved state
      const checkSolved = newBoard.every((tile, i) => tile === SOLVED_BOARD[i]);
      if (checkSolved) {
        setIsSolved(true);
        setGameStarted(false);
      }
    }
  };

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="puzzle-container">
      <div className="game-stats">
        <div>
          Moves:
          <span className="stat-val">{moves}</span>
        </div>
        <div>
          Time:
          <span className="stat-val">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="puzzle-board">
        {board.map((tile, index) => (
          <div
            key={index}
            onClick={() => handleTileClick(index)}
            className={`puzzle-tile ${tile === null ? 'empty-tile' : ''}`}
          >
            {tile}
          </div>
        ))}
      </div>

      {isSolved ? (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <h3 style={{ color: 'var(--success-color)', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-digital)' }}>
            Puzzle Solved!
          </h3>
          <button className="glow-btn" onClick={scrambleBoard}>
            Play Again
          </button>
        </div>
      ) : (
        <button className="glow-btn" onClick={scrambleBoard}>
          Restart Game
        </button>
      )}
    </div>
  );
}
