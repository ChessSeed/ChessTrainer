import React, { useCallback } from "react";
import { Chess, SQUARES, KING, ROOK, QUEEN, WHITE, BLACK } from "chess.js";
import Chessboard from "chessboardjsx";
import Stopwatch from "./StopWatch/Stopwatch";
import NewStockfish from "./Bots/newStockfish";
import SimpleStockfish from "./Bots/simpleStockfish";
//import newStockfish from "./Bots/newStockfish";




enum GameMode {
    Practice,
    Play
}




const GameController = () => {
    const [game, setGame] = React.useState(new Chess());
    const [fen, setFen] = React.useState(game.fen());
    const [gameMode, setGameMode] = React.useState(GameMode.Play);
    const [score, setScore] = React.useState(0);
    const [running, setRunning] = React.useState(0);
    //const [stockfish, setStockfish] = React.useState(new newStockfish({game,fen}));

    const onDrop = useCallback(({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string }) => {

        try {
          var move = game.move({
            from: sourceSquare,
            to: targetSquare, 
            promotion: "q"
          });
        } catch (error) {
          return;
        }
    
        // illegal move
        if (move === null) return;
        
        
        setGame(game);
        setFen(game.fen());
        //stockfish.updateStates(game,game.fen());
        updateScore();


    },[game]);  


    function updateScore() {
        if (gameMode === GameMode.Practice) {
            if(running === 0) {
                setRunning(1);
            }
            if(game.isCheckmate()) {
                setScore(score + 1);
                console.log("Score: " + score)
                if (score+1 >= 5) {
                    setRunning(2);
                }else{
                    newPractice();
                }

            }else if(game.isDraw() ) {
                newPractice();
            }
        }
    }


    const newGame = useCallback(() => {
        setScore(0);
        console.log("New Game");
        let chess = new Chess();
        setGame(chess);
        setFen(chess.fen());
        setGameMode(GameMode.Play);
        setRunning(0);
    },[]);

    const newPractice  = useCallback(() => {
        
        console.log("New Practice");
        const chess = new Chess();
        chess.clear();
        
        //chose 3 random squares that are not the same
        const WRSquare = SQUARES[Math.floor(Math.random() * 64)];
        let WrSquare = SQUARES[Math.floor(Math.random() * 64)];
        while (WrSquare === WRSquare) {
            WrSquare = SQUARES[Math.floor(Math.random() * 64)];
        }
        let WKSquare = SQUARES[Math.floor(Math.random() * 64)];
        while (WKSquare === WRSquare || WKSquare === WrSquare) {
            WKSquare = SQUARES[Math.floor(Math.random() * 64)];
        }

        chess.put({ type: KING, color: WHITE }, WKSquare);
        chess.put({ type: ROOK, color: WHITE }, WRSquare);
        chess.put({ type: ROOK, color: WHITE }, WrSquare);

        let BKSquare = SQUARES[Math.floor(Math.random() * 64)];
        while (chess.isAttacked(BKSquare, WHITE) || BKSquare === WRSquare || BKSquare === WrSquare || BKSquare === WKSquare) {
            BKSquare = SQUARES[Math.floor(Math.random() * 64)];
        }
        chess.put({ type: KING, color: BLACK }, BKSquare);

        setGame(chess);
        setFen(chess.fen());
        setGameMode(GameMode.Practice);
    },[]);

    const MemorizedNewStockfish = React.memo(NewStockfish);

    function handleNewFen(newFen: string) {
        setFen(newFen);
        setGame(new Chess(newFen));
    }

//<MemorizedNewStockfish game={game} fen={fen}/>
    return (
        <div>
            {gameMode === GameMode.Practice ? <div>
                                                <button onClick={newGame}>New Game</button>
                                                <div>Score {score}</div>
                                              </div> : 
                                              <div>
                                                <button onClick={newPractice}>New Practice</button>
                                              </div> }
            <Chessboard position={fen} onDrop={onDrop} />
            {gameMode === GameMode.Practice ? <div> <Stopwatch running = {running} /> </div> : <div></div>}
            {game.turn() === 'b' && <MemorizedNewStockfish fen={fen} handleNewFen={handleNewFen}/> }
            



        </div>
    ) 
};


export default GameController;