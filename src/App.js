import React from 'react';
import ChessBoard from './Components/ChessBoard.tsx';
import Test from './Components/test.js';
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import GameController from './GameController.tsx';
import { useMemo } from 'react';





function App() {

  const boardsContainer = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  }), []);


  return (
    <div style={boardsContainer}>
        <GameController/>
      </div>
  );
}

export default App;
