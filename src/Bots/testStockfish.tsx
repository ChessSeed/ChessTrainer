import React, { Component } from "react";
import PropTypes from "prop-types";
import { Chess } from "chess.js";
import Chessboard from "chessboardjsx";

const STOCKFISH: any = window.STOCKFISH;
const game: Chess = new Chess();

interface StockfishProps {
  children: ({position, onDrop}: {position: {fen: string}, onDrop: (params: {sourceSquare: string, targetSquare: string}) => void}) => JSX.Element;
}

interface StockfishState {
  fen: string;
}

class Stockfish extends Component<StockfishProps, StockfishState> {
  static propTypes = {
    children: PropTypes.func.isRequired
  };

  state: StockfishState = {
    fen: "start"
  };

  componentDidMount() {
    this.setState({ fen: game.fen() });
    //this.engineGame().prepareMove();
  }

  onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string }) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    if (move === null) return;
    return new Promise<void>(resolve => {
      this.setState({ fen: game.fen() });
      resolve();
    })//.then(() => this.engineGame().prepareMove());
  };

  engineGame = (options?: { stockfishjs?: string }) => {
    options = options || {};
    let engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || "stockfish.js");
    let evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || "stockfish.js");
    let engineStatus = { engineLoaded: false, search: "null", searching: false, engineReady: false, score : "0" };
    let time = { wtime: 3000, btime: 3000, winc: 1500, binc: 1500, startTime: Date.now(), depth: 3, nodes:0 };
    let playerColor = "black";
    var clockTimeoutID: string | number | NodeJS.Timeout | null | undefined = null;
    let announced_game_over: boolean;

    setInterval(function() {
      if (announced_game_over) {
        return;
      }
      if (game.isGameOver()) {
        announced_game_over = true;
      }
    }, 500);

    function uciCmd(cmd: string, which?: any) {
      (which || engine).postMessage(cmd);
    }

    uciCmd("uci");

    function clockTick() {
      let t = (playerColor === "white" ? time.wtime : time.btime) + time.startTime - Date.now();
      let timeToNextSecond = (t % 1000) + 1;
      clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
    }

    function stopClock() {
      if (clockTimeoutID !== null) {
        clearTimeout(clockTimeoutID);
        clockTimeoutID = null;
      }
      if (time.startTime > 0) {
        let elapsed = Date.now() - time.startTime;
        time.startTime = NaN;
        if (playerColor === "white") {
          time.wtime = Math.max(0, time.wtime - elapsed);
        } else {
          time.btime = Math.max(0, time.btime - elapsed);
        }
      }
    }

    function startClock() {
      if (game.turn() === "w") {
        time.wtime += time.winc;
        playerColor = "white";
      } else {
        time.btime += time.binc;
        playerColor = "black";
      }
      time.startTime = Date.now();
      clockTick();
    }

    function get_moves() {
      let moves = "";
      let history = game.history({ verbose: true });
      for (let i = 0; i < history.length; ++i) {
        let move = history[i];
        moves += " " + move.from + move.to + (move.promotion ? move.promotion : "");
      }
      return moves;
    }

    const prepareMove = () => {
      stopClock();
      let turn = game.turn() === "w" ? "white" : "black";
      if (!game.isGameOver()) {
        if (turn !== playerColor) {
          uciCmd("position startpos moves" + get_moves());
          uciCmd("position startpos moves" + get_moves(), evaler);
          uciCmd("eval", evaler);
          if (time && time.wtime) {
            uciCmd("go " + (time.depth ? "depth "
                + time.depth : "") + " wtime " + time.wtime + " winc " + time.winc + " btime " + time.btime
                + " binc " + time.binc);
            } else {
                uciCmd("go " + (time.depth ? "depth " + time.depth : ""));
                }
        }
        if (game.history().length >= 2 && !time.depth && !time.nodes) {
            startClock();
            }
        }
    };

    evaler.onmessage = function(event: { data: any; }) {
        let line;
        if (event && typeof event === "object") {
            line = event.data;
        } else {
            line = event;
        }
        /// Ignore some output.
        if (
            line === "uciok" ||
            line === "readyok" ||
            line.substr(0, 11) === "option name"
        ) {
            return;
        }
        }
    engine.onmessage = (event: { data: any; }) => {
        let line;

        if (event && typeof event === "object") {
            line = event.data;
        }
        else {
            line = event;
        }

        if (line === "uciok") {
            engineStatus.engineLoaded = true;
          } else if (line === "readyok") {
            engineStatus.engineReady = true;
          } else {
            let match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
            /// Did the AI move?
            if (match) {
              // isEngineRunning = false;
              game.move({ from: match[1], to: match[2], promotion: match[3] });
              this.setState({ fen: game.fen() });
              prepareMove();
              uciCmd("eval", evaler);
              //uciCmd("eval");
              /// Is it sending feedback?
            } else if (
              (match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/))
            ) {
              engineStatus.search = "Depth: " + match[1] + " Nps: " + match[2];
            }
    
            /// Is it sending feed back with a score?
            if ((match = line.match(/^info .*\bscore (\w+) (-?\d+)/))) {
              let score = parseInt(match[2], 10) * (game.turn() === "w" ? 1 : -1);
              /// Is it measuring in centipawns?
              if (match[1] === "cp") {
                engineStatus.score = (score / 100.0).toFixed(2);
                /// Did it find a mate?
              } else if (match[1] === "mate") {
                engineStatus.score = "Mate in " + Math.abs(score);
              }
    
              /// Is the score bounded?
              if ((match = line.match(/\b(upper|lower)bound\b/))) {
                engineStatus.score =
                  ((match[1] === "upper") === (game.turn() === "w")
                    ? "<= "
                    : ">= ") + engineStatus.score;
              }
            }
          }
          // displayStatus();
        };


    return (
        <div>
            hey
        </div>
    )            
    
    }

}



        
        