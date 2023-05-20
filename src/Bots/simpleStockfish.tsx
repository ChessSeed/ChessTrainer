import PropTypes from "prop-types";
import { Chess } from "chess.js";
import React, { useEffect, useRef, useState } from "react";

const STOCKFISH = window.STOCKFISH;
var chess = new Chess();

interface SimpleStockfishProps {
    fen: string;
    newFen: (fen: string) => void;
}

class SimpleStockfish extends React.Component<SimpleStockfishProps, any>{
    
    constructor(props: SimpleStockfishProps) {
        super(props);
        this.state = {
            fen: props.fen,
        };
    }

    componentDidMount() {
        console.log("mounted");
        //this.engineGame({}).prepareMove();
    }
    
    

    handleClick = () => {
        console.log("handleClick");
        this.props.newFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }
    
    engineGame = (options: any) => {
        options = options || {};
        let engine =
            typeof STOCKFISH === "function"
                ? STOCKFISH()
                : new Worker(options.stockfishjs || "stockfish.js");

        function uciCmd(cmd: any, which: any = engine) {
            // console.log('UCI: ' + cmd);
            console.log("uciCmd");
            (which || engine).postMessage(cmd);
        }
        uciCmd("uci");

        engine.onmessage = function (event: any) {
            let line;
            console.log("engine.onmessage");

            if (event && typeof event === "object") {
                line = event.data;
            } else {
                line = event;
            }

            if (line === "uciok") {
                console.log("Engine has started");
            } else if (line === "readyok") {
                console.log("Engine is ready");
            } else if (line.substr(0, 11) === "option name" || line.substr(0, 11) === "Stockfish.j" || line.substr(0, 9) === "id author" || line.substr(0, 9) === "id name S") {
            } else {
                var match = line.match( /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/i); 
                if (match) {
                    console.log("match");
                    chess = new Chess(this.state.fen);
                    var move = chess.move({
                        from: match[1],
                        to: match[2],
                        promotion: match[3]
                    });
                    this.handleClick();
                }
            }
        };

        const prepareMove = () => {
            uciCmd('position fen ' + this.state.fen);
            uciCmd('go movetime 1000');
        }

        return {
            prepareMove: prepareMove
        };


    }

    render(): React.ReactNode {
        return (
            <div>
                <h1>SimpleStockfish</h1>
                <button onClick={this.handleClick}>Restart </button>
            </div>
        );
    }

}


export default SimpleStockfish;