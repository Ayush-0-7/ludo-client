// import React, { useMemo, useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// import LudoBoard from "./LudoBoard";
// import Token from "./Token";
// import Dice from "./Dice";
// import PlayerBadge from "./PlayerBadge";
// import * as SoundManager from "../utils/SoundManager";
// import {
//   BASE_PADS,
//   TRACK_PATH,
//   HOME_LANE_PATHS,
//   BOARD_SIZE,
//   CELL_SIZE,
//   HOME_ENTRY_INDEX,
//   ENTRY_INDEX,
//   TRACK_LEN,
// } from "../config/constants";
// import { legalMovesForPlayer, mod } from "../logic/gameLogic";

// // usePrevious and calculatePath functions remain the same...
// const usePrevious = (value) => {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = value;
//   });
//   return ref.current;
// };

// const calculatePath = (player, startToken, endToken, diceValue) => {
//   const path = [];
//   if (startToken.state === "base" || endToken.state === "done") {
//     path.push(endToken);
//     return path;
//   }
//   const homeEntryRelSteps =
//     mod(HOME_ENTRY_INDEX[player.color] - ENTRY_INDEX[player.color], TRACK_LEN) +
//     1;
//   for (let i = 1; i <= diceValue; i++) {
//     const currentTotalSteps = startToken.relSteps + i;
//     if (currentTotalSteps < homeEntryRelSteps) {
//       path.push({
//         state: "track",
//         pos: mod(ENTRY_INDEX[player.color] + currentTotalSteps, TRACK_LEN),
//         relSteps: currentTotalSteps,
//       });
//     } else {
//       const homeLanePos = currentTotalSteps - homeEntryRelSteps;
//       if (homeLanePos <= 6) {
//         path.push({
//           state: homeLanePos === 6 ? "done" : "home",
//           pos: homeLanePos,
//           relSteps: currentTotalSteps,
//         });
//       }
//     }
//   }
//   if (
//     path.length > 0 &&
//     (path[path.length - 1].pos !== endToken.pos ||
//       path[path.length - 1].state !== endToken.state)
//   ) {
//     path.push(endToken);
//   }
 
//   return path;
// };

// // Receive onLeave prop
// export default function GameScreen({ gameState, socket, userId, onLeave }) {
//   const [animatedPlayers, setAnimatedPlayers] = useState(null);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const previousGameState = usePrevious(gameState);
//   // The useEffect hooks for animation and state sync remain the same...
//   useEffect(() => {
//     if (!animatedPlayers || isAnimating === false) {
//       setAnimatedPlayers(JSON.parse(JSON.stringify(gameState.players)));
//     }
//   }, [gameState]);

//   useEffect(() => {
//     if (!previousGameState || !animatedPlayers || !gameState || isAnimating)
//       return;
//     let movedTokenInfo = null;
//     for (const [pIdx, player] of gameState.players.entries()) {
//       for (const [tIdx, token] of player.tokens.entries()) {
//         const prevToken = previousGameState.players[pIdx]?.tokens[tIdx];
//         if (prevToken && JSON.stringify(prevToken) !== JSON.stringify(token)) {
//           console.log(pIdx,tIdx) ; 
//           movedTokenInfo = {
//             pIdx,
//             tIdx,
//             startToken: prevToken,
//             endToken: token,
//           };
//           break;
//         }
//       }
//       if (movedTokenInfo) break;
//     }
//     if (movedTokenInfo) {
//       // console.log("Focus here ......\n",movedTokenInfo)
//       const { pIdx, tIdx, startToken, endToken } = movedTokenInfo;
//       const player = gameState.players[pIdx];
//       const diceValue = previousGameState.diceValue;
//       const path = calculatePath(player, startToken, endToken, diceValue);
//       const runAnimation = async () => {
//         setIsAnimating(true);
//         if (path.length <= 1) {
//           if (startToken.state === "base") SoundManager.playTokenEnter();
//           if (endToken.state === "done") SoundManager.playTokenFinish();
//         } else {
//           for (const step of path) {
//             setAnimatedPlayers((prev) => {
//               const newPlayers = JSON.parse(JSON.stringify(prev));
//               newPlayers[pIdx].tokens[tIdx] = step;
//               return newPlayers;
//             });
//             SoundManager.playTokenStep();
//             await new Promise((res) => setTimeout(res, 200));
//           }
//         }
//         const prevBaseCount = previousGameState.players.reduce(
//           (sum, p) => sum + p.tokens.filter((t) => t.state === "base").length,
//           0
//         );
//         const currBaseCount = gameState.players.reduce(
//           (sum, p) => sum + p.tokens.filter((t) => t.state === "base").length,
//           0
//         );
//         if (currBaseCount > prevBaseCount && startToken.state !== "base") {
//           SoundManager.playTokenCapture();
//         }
//         setAnimatedPlayers(JSON.parse(JSON.stringify(gameState.players)));
//         setIsAnimating(false);
//       };
//       runAnimation();
//     }
//   }, [gameState, previousGameState, animatedPlayers, isAnimating]);

//   const myPlayer = gameState.players.find((p) => p.userId === userId);
//   const activePlayer = gameState.players[gameState.activeIdx];
//   const isMyTurn = myPlayer && myPlayer.userId === activePlayer.userId;

//   const legal = useMemo(() => {
//     if (!isMyTurn || gameState.diceValue == null) return [];
//     return legalMovesForPlayer(
//       activePlayer,
//       gameState.players,
//       gameState.diceValue
//     );
//   }, [gameState.diceValue, gameState.players, isMyTurn, activePlayer]);

//   const rollDice = () => {
//     if (isAnimating) return;
//     SoundManager.playDiceRoll();
//     socket.emit("rollDice", { roomId: gameState.roomId, userId });
//   };

//   const executeMove = (mv) => {
    
//     if (isAnimating) return;
//     if (
//       legal.find(
//         (legalMove) => JSON.stringify(legalMove) === JSON.stringify(mv)
//       )
//     ) {
//       socket.emit("makeMove", { roomId: gameState.roomId, move: mv, userId });
//     }
//   };

//   const tokenCoord = (playerColor, token, tokenIndex) => {
//     let r, c;
//     if (token.state === "base") ({ r, c } = BASE_PADS[playerColor][tokenIndex]);
//     else if (token.state === "track") ({ r, c } = TRACK_PATH[token.pos]);
//     else if (token.state === "home" || token.state === "done")
//       ({ r, c } = HOME_LANE_PATHS[playerColor][token.pos]);
//     else return { x: -100, y: -100 };
//     return { x: (c + 0.5) * CELL_SIZE, y: (r + 0.5) * CELL_SIZE };
//   };

//   const selectableTokens = useMemo(
//     () => new Set(legal.map((mv) => mv.token)),
//     [legal]
//   );

//   return (
//     <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
//       <div className="flex-[2] relative w-full mx-auto aspect-square max-w-[500px] sm:max-w-[600px] md:max-w-none">
//         <LudoBoard />
//         <svg
//           viewBox={`-10 -10 ${BOARD_SIZE + 20} ${BOARD_SIZE + 20}`}
//           className="absolute top-0 left-0 w-full h-full pointer-events-none"
//         >
//           <AnimatePresence>
//             {animatedPlayers &&
//               animatedPlayers.map((p) =>
//                 p.tokens.map((t, ti) => {
//                   const { x, y } = tokenCoord(p.color, t, ti);
//                   const isSelectable =
//                     selectableTokens.has(ti) &&
//                     p.userId === activePlayer.userId &&
//                     !isAnimating;
//                   return (
//                     <motion.g
//                       key={`${p.color}-${ti}`}
//                       animate={{ x, y }}
//                       transition={{
//                         type: "tween",
//                         duration: 0.15,
//                         ease: "linear",
//                       }}
//                       className="pointer-events-auto"
//                     >
//                       <Token
//                         x={0}
//                         y={0}
//                         color={p.color}
//                         highlight={isSelectable}
//                         onClick={() => {
//                           if (!isSelectable) return;
//                           const mv = legal.find((m) => m.token === ti);
//                           if (mv) executeMove(mv);
//                         }}
//                       />
//                     </motion.g>
//                   );
//                 })
//               )}
//           </AnimatePresence>
//         </svg>
//       </div>
//       <div className="flex-[1] bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-5 w-full md:w-auto text-sm sm:text-base">
//         <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
//           {gameState.players.map((p) => (
//             <PlayerBadge
//               key={p.userId}
//               p={p}
//               active={p.userId === activePlayer.userId && !gameState.winner}
//             />
//           ))}
//         </div>
//         <hr className="border-t-2 border-neutral-200" />
//         <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
//           <h2 className="text-lg sm:text-2xl font-bold">
//             {gameState.winner ? "Game Over!" : `${activePlayer?.name}'s Turn`}
//           </h2>
//           <Dice
//             value={gameState.diceValue}
//             rolling={false}
//             onRoll={rollDice}
//             disabled={
//               !isMyTurn ||
//               gameState.diceValue != null ||
//               gameState.winner ||
//               isAnimating
//             }
//           />
//           <p className="h-10 sm:h-12 text-neutral-700 font-medium text-base sm:text-lg px-4">
//             {isAnimating ? "Moving..." : gameState.message}
//           </p>
//         </div>

//         <div className="mt-auto flex flex-col gap-4">
//           {gameState.winner && (
//             <div className="p-3 sm:p-4 bg-yellow-300 rounded-xl text-center font-bold text-xl sm:text-2xl text-yellow-900 shadow-inner">
//               {gameState.winner.name} Wins!
//             </div>
//           )}
//           {/* NEW: Leave Game Button */}
//           {gameState.status !== "finished" && (
//             <button
//               onClick={onLeave}
//               className="text-center text-sm text-neutral-500 hover:text-neutral-800 transition"
//             >
//               Leave Game
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import LudoBoard from "./LudoBoard";
import Token from "./Token";
import Dice from "./Dice";
import PlayerBadge from "./PlayerBadge";
import * as SoundManager from "../utils/SoundManager";
import {
  BASE_PADS,
  TRACK_PATH,
  HOME_LANE_PATHS,
  BOARD_SIZE,
  CELL_SIZE,
  HOME_ENTRY_INDEX,
  ENTRY_INDEX,
  TRACK_LEN,
  HOME_LEN,
} from "../config/constants";
import { legalMovesForPlayer, mod } from "../logic/gameLogic";



const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const calculatePath = (player, startToken, endToken, diceValue) => {
  const path = [];
  if (startToken.state === "base" || endToken.state === "done") {
    path.push(endToken);
    return path;
  }

  const homeEntryRelSteps =
    mod(HOME_ENTRY_INDEX[player.color] - ENTRY_INDEX[player.color], TRACK_LEN) +
    1;

  // Safety check: if diceValue is missing, just jump to end
  const steps = diceValue || (endToken.relSteps - startToken.relSteps);

  for (let i = 1; i <= steps; i++) {
    const currentTotalSteps = startToken.relSteps + i;
    if (currentTotalSteps < homeEntryRelSteps) {
      path.push({
        state: "track",
        pos: mod(ENTRY_INDEX[player.color] + currentTotalSteps, TRACK_LEN),
        relSteps: currentTotalSteps,
      });
    } else {
      const homeLanePos = currentTotalSteps - homeEntryRelSteps;
      if (homeLanePos <= HOME_LEN) {
        path.push({
          state: homeLanePos === HOME_LEN ? "done" : "home",
          pos: homeLanePos,
          relSteps: currentTotalSteps,
        });
      }
    }
  }
  // Ensure final step matches exactly
  if (
    path.length > 0 &&
    (path[path.length - 1].pos !== endToken.pos ||
      path[path.length - 1].state !== endToken.state)
  ) {
    path.push(endToken);
  }
  return path;
};

// --- Main Component ---

export default function GameScreen({ gameState, socket, userId, onLeave }) {
  const [animatedPlayers, setAnimatedPlayers] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousGameState = usePrevious(gameState);

  // --- THE MASTER EFFECT ---
  // This replaces BOTH previous useEffects to prevent race conditions.
  useEffect(() => {
    // 1. Initial Load or Reconnect: Just sync instantly
    if (!previousGameState) {
      setAnimatedPlayers(JSON.parse(JSON.stringify(gameState.players)));
      return;
    }

    // 2. Detect if ANY token moved
    let movedTokenInfo = null;
    for (const [pIdx, player] of gameState.players.entries()) {
      for (const [tIdx, token] of player.tokens.entries()) {
        const prevToken = previousGameState.players[pIdx]?.tokens[tIdx];
        // Check for position change or state change (base->track, etc.)
        if (prevToken && (prevToken.pos !== token.pos || prevToken.state !== token.state)) {
          movedTokenInfo = {
            pIdx,
            tIdx,
            startToken: prevToken,
            endToken: token,
          };
          break;
        }
      }
      if (movedTokenInfo) break;
    }

    // 3. Decision Tree: Animate or Sync?
    if (movedTokenInfo) {
      // >> ANIMATION PATH <<
      const { pIdx, tIdx, startToken, endToken } = movedTokenInfo;
      const player = gameState.players[pIdx];
      // Important: Use the dice value from the PREVIOUS state (when the roll happened)
      const diceValue = previousGameState.diceValue; 
      const path = calculatePath(player, startToken, endToken, diceValue);

      const runAnimation = async () => {
        setIsAnimating(true);

        // A. Play Start Sound
        if (startToken.state === "base") SoundManager.playTokenEnter();
        
        // B. Step-by-Step Loop
        if (path.length > 0) {
            for (const step of path) {
                setAnimatedPlayers((prev) => {
                    const newPlayers = JSON.parse(JSON.stringify(prev));
                    newPlayers[pIdx].tokens[tIdx] = step;
                    return newPlayers;
                });
                SoundManager.playTokenStep();
                await new Promise((res) => setTimeout(res, 200)); // The visual delay
            }
        }

        // C. Play End/Capture Sounds
        if (endToken.state === "done") SoundManager.playTokenFinish();
        
        const prevBaseCount = previousGameState.players.reduce(
          (sum, p) => sum + p.tokens.filter((t) => t.state === "base").length, 0
        );
        const currBaseCount = gameState.players.reduce(
          (sum, p) => sum + p.tokens.filter((t) => t.state === "base").length, 0
        );
        if (currBaseCount > prevBaseCount && startToken.state !== "base") {
          SoundManager.playTokenCapture();
        }

        // D. Final Cleanup: Sync perfectly with server state
        setAnimatedPlayers(JSON.parse(JSON.stringify(gameState.players)));
        setIsAnimating(false);
      };

      runAnimation();

    } else {
     
      setAnimatedPlayers(JSON.parse(JSON.stringify(gameState.players)));
    }
    
    
  }, [gameState]); 




  const myPlayer = gameState.players.find((p) => p.userId === userId);
  const activePlayer = gameState.players[gameState.activeIdx];
  const isMyTurn = myPlayer && myPlayer.userId === activePlayer.userId;

  const legal = useMemo(() => {
    if (!isMyTurn || gameState.diceValue == null) return [];
    return legalMovesForPlayer(
      activePlayer,
      gameState.players,
      gameState.diceValue
    );
  }, [gameState.diceValue, gameState.players, isMyTurn, activePlayer]);

  const rollDice = () => {
    if (isAnimating) return;
    SoundManager.playDiceRoll();
    socket.emit("rollDice", { roomId: gameState.roomId, userId });
  };

  const executeMove = (mv) => {
    if (isAnimating) return;
    if (legal.find((m) => JSON.stringify(m) === JSON.stringify(mv))) {
      socket.emit("makeMove", { roomId: gameState.roomId, move: mv, userId });
    }
  };

  const tokenCoord = (playerColor, token, tokenIndex) => {
    let r, c;
    if (token.state === "base") ({ r, c } = BASE_PADS[playerColor][tokenIndex]);
    else if (token.state === "track") ({ r, c } = TRACK_PATH[token.pos]);
    else if (token.state === "home" || token.state === "done")
      ({ r, c } = HOME_LANE_PATHS[playerColor][token.pos]);
    else return { x: -100, y: -100 };
    return { x: (c + 0.5) * CELL_SIZE, y: (r + 0.5) * CELL_SIZE };
  };

  const selectableTokens = useMemo(
    () => new Set(legal.map((mv) => mv.token)),
    [legal]
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
      <div className="flex-[2] relative w-full mx-auto aspect-square max-w-[500px] sm:max-w-[600px] md:max-w-none">
        <LudoBoard />
        <svg
          viewBox={`-10 -10 ${BOARD_SIZE + 20} ${BOARD_SIZE + 20}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <AnimatePresence>
            {animatedPlayers &&
              animatedPlayers.map((p) =>
                p.tokens.map((t, ti) => {
                  const { x, y } = tokenCoord(p.color, t, ti);
                  const isSelectable =
                    selectableTokens.has(ti) &&
                    p.userId === activePlayer.userId &&
                    !isAnimating;
                  return (
                    <motion.g
                      key={`${p.color}-${ti}`}
                      animate={{ x, y }}
                      transition={{
                        type: "tween",
                        duration: 0.15, // Smooth slide speed
                        ease: "linear",
                      }}
                      className="pointer-events-auto"
                    >
                      <Token
                        x={0}
                        y={0}
                        color={p.color}
                        highlight={isSelectable}
                        onClick={() => {
                          if (!isSelectable) return;
                          const mv = legal.find((m) => m.token === ti);
                          if (mv) executeMove(mv);
                        }}
                      />
                    </motion.g>
                  );
                })
              )}
          </AnimatePresence>
        </svg>
      </div>
      <div className="flex-[1] bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-5 w-full md:w-auto text-sm sm:text-base">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {gameState.players.map((p) => (
            <PlayerBadge
              key={p.userId}
              p={p}
              active={p.userId === activePlayer.userId && !gameState.winner}
            />
          ))}
        </div>
        <hr className="border-t-2 border-neutral-200" />
        <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
          <h2 className="text-lg sm:text-2xl font-bold">
            {gameState.winner ? "Game Over!" : `${activePlayer?.name}'s Turn`}
          </h2>
          <Dice
            value={gameState.diceValue}
            rolling={false}
            onRoll={rollDice}
            disabled={
              !isMyTurn ||
              gameState.diceValue != null ||
              gameState.winner ||
              isAnimating
            }
          />
          <p className="h-10 sm:h-12 text-neutral-700 font-medium text-base sm:text-lg px-4">
            {isAnimating ? "Moving..." : gameState.message}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          {gameState.winner && (
            <div className="p-3 sm:p-4 bg-yellow-300 rounded-xl text-center font-bold text-xl sm:text-2xl text-yellow-900 shadow-inner">
              {gameState.winner.name} Wins!
            </div>
          )}
          {gameState.status !== "finished" && (
            <button
              onClick={onLeave}
              className="text-center text-sm text-neutral-500 hover:text-neutral-800 transition"
            >
              Leave Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}