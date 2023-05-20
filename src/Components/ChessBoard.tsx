import Chessboard from "chessboardjsx";
import React from "react";
//import StockFish from "../Bots/aStockfish.js";
 
export default function ChessBoard(props: { game: unknown; }) {
    
    const [game, setGame] = React.useState(props.game);
    

    React.useEffect(() => {
        setGame(props.game);
    }, [props.game]);   
    



    //let stockfish = new StockFish({fen:game.fen()});
    //console.log(stockfish);

    //React.useEffect(() => {
    //    stockfish.getReady();
    //}, []);



    return (
        {/* <div>
            <Chessboard id="standard"
            orientation="white"
            onDrop={stockfish.onDrop}
            position={props.position}
            dropOffBoard="trash"/>
            
        </div> */}
    );
}