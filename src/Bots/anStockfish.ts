
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Chess } from "chess.js";

const STOCKFISH = window.STOCKFISH;
const game = new Chess();

export default function StockFish(props: { fen: string; color: any; }) {
    const [fen, setFen] = React.useState(props.fen);
    const [playerColor, setColor] = React.useState(props.color);
    let clockTimeoutID: null | ReturnType<typeof setTimeout>  = null;

    React.useEffect(() => {
      setFen(props.fen);
  
      engineGame({}).prepareMove()
    }, [props.fen]);
  
    const engineGame = (options: { stockfishjs?: any; }) => {
        options = options || {};

        let engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || "stockfish.js");
        let evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || "stockfish.js");
        let engineStatus = { engineLoaded: false, search: "null", searching: false, engineReady: false, score : "0" };
        let time = { time: 3000, inc: 1500, startTime: Date.now(), depth: 3, nodes:0 };
        
        let announced_game_over: boolean;

        setInterval(function() {
            if (announced_game_over) {
                return;
            }
            if (game.isGameOver()) {
                announced_game_over = true;
            }
        }, 500);

        function uciCmd(cmd: string, which = engine) {
            console.log("UCI: " + cmd);

            (which).postMessage(cmd);
        }

        uciCmd("uci");

        function clockTick() {
            let t = (Date.now() - time.startTime) + time.time;
            let timeToNextSecond = (t % 1000) + 1;
            clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
        }

        function stopClock() {
            if (clockTimeoutID !== null) {
                clearTimeout(clockTimeoutID);
                clockTimeoutID = null;
            }
            if (time.startTime > 0) {
                let t = Date.now() - time.startTime;
                time.time = Math.max(0, time.time - t);
            }
        }
        
        function startClock() {
            time.time += time.inc;
            time.startTime = Date.now();
            clockTick();
        }

        function get_moves(){
          let moves = "";
          let history = game.history({verbose: true});

          for(let i = 0; i < history.length; ++i) {
              let move = history[i];
              moves += " " + move.from + move.to + (move.promotion ? move.promotion : "");
          }

          return moves;
        }

        const prepareMove = () => {
          stopClock();
          // this.setState({ fen: game.fen() });
          let turn = game.turn() === "w" ? "white" : "black";
          if (!game.isGameOver()) {
            // if (turn === playerColor) {
            if (turn !== playerColor) {
              // playerColor = playerColor === 'white' ? 'black' : 'white';
              uciCmd("position startpos moves" + get_moves());
              uciCmd("position startpos moves" + get_moves(), evaler);
              uciCmd("eval", evaler);
    
              if (time && time.time) {
                uciCmd(
                  "go " +
                    (time.depth ? "depth " + time.depth : "") +
                    " wtime " +
                    time.time +
                    " winc " +
                    time.inc +
                    " btime " +
                    time.time +
                    " binc " +
                    time.inc
                );
              } else {
                uciCmd("go " + (time.depth ? "depth " + time.depth : ""));
              }
              // isEngineRunning = true;
            }
            if (game.history().length >= 2 && !time.depth && !time.nodes) {
              startClock();
            }
          }
        };
  
         return {
          prepareMove: function() {
            prepareMove();
          }
         }


        
  };
  
    
  function returnFen() {
    return fen;
  }
  
  return ( returnFen() );

  }
  




