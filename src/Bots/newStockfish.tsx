import PropTypes from "prop-types";
import { Chess } from "chess.js";
import React, { useEffect, useRef, useState } from "react";

const STOCKFISH = window.STOCKFISH;
var chess = new Chess();
var remeberedFen = "a";

let engine =
    typeof STOCKFISH === "function"
      ? STOCKFISH()
      : new Worker("stockfish.js");

function uciCmd(cmd: any, which: any = engine) {
  // console.log('UCI: ' + cmd);
  //console.log("uciCmd");
  (which || engine).postMessage(cmd);
}

uciCmd("uci");

const NewStockfish = (props: any) => {
  const [state, setState] = useState({ fen: props.fen});
  
  useEffect(() => { 
    chess.load(props.fen);
    if(chess.turn() === "b"){
      calculateNextMove();
    }

  }, [props.fen]);

  const calculateNextMove = () => {
    console.log("calculateNextMove");
    uciCmd("position fen " + props.fen);
    uciCmd("go depth 1");
  }

  engine.onmessage = function (event: any) {
    console.log("engine.onmessage");
    var line;
    
    if (event && typeof event === "object") {
      line = event.data;
    } else {
      line = event;
    }
    if (line === "uciok") {
      //console.log("Engine has started");
    } else if (line === "readyok") {
      //console.log("Engine is ready");
    } else if (line.substr(0, 11) === "option name" || line.substr(0, 11) === "Stockfish.j" || line.substr(0, 9) === "id author" || line.substr(0, 9) === "id name S") {
    }else {
      var match = line.match(
        /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/i
      );

      // Did the AI move?
      if (match) {
        console.log("match", match)
        chess.move({ from: match[1], to: match[2], promotion: match[3] });
        props.handleNewFen(chess.fen());
      }
    }
  };

  
  return (
    <div>
      <div>Stockfish</div>
    </div>
  );


}


export default React.memo(NewStockfish);