// import React, { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// /**
//  * React Ludo – Local Multiplayer (2–4 players)
//  * - Full pass-and-play (same device) multiplayer
//  * - Legal moves enforced: enter on 6, safe tiles, captures, home stretch
//  * - Extra roll on 6, three sixes penalty (turn forfeited)
//  * - 4 tokens per player; first to home all 4 wins
//  * - Minimal, clean Tailwind UI; SVG board
//  *
//  * Notes:
//  * - This file exports a default React component; it should run in a typical React + Tailwind setup.
//  * - No backend required. Networking hooks are left as TODO if you want to add online play later.
//  */

// // --- Utility helpers ---
// const range = (n) => [...Array(n).keys()];
// const COLORS = ["red", "green", "yellow", "blue"]; // Player order
// const COLOR_CLASSES = {
//   red: { bg: "bg-red-500", text: "text-red-500", fill: "fill-red-500", stroke: "stroke-red-700" },
//   green: { bg: "bg-green-500", text: "text-green-500", fill: "fill-green-500", stroke: "stroke-green-700" },
//   yellow: { bg: "bg-yellow-400", text: "text-yellow-400", fill: "fill-yellow-400", stroke: "stroke-yellow-600" },
//   blue: { bg: "bg-blue-500", text: "text-blue-500", fill: "fill-blue-500", stroke: "stroke-blue-700" },
// };

// // --- Ludo Constants ---
// const CELL_SIZE = 40;
// const BOARD_SIZE = 15 * CELL_SIZE;
// const TOKENS_PER_PLAYER = 4;
// const TRACK_LEN = 52;
// const HOME_LEN = 6;

// // --- Board Geometry & Path Definitions ---
// const TRACK_PATH = [
//   { r: 6, c: 0 } ,{ r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
//   { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
//   { r: 0, c: 7 },
//   { r: 0, c: 8 }, { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
//   { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
//   { r: 7, c: 14 },
//   { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
//   { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
//   { r: 14, c: 7 },
//   { r: 14, c: 6 }, { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
//   { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
//   { r: 7, c: 0 },
// ];

// const ENTRY_INDEX = { red: 1, green: 14, yellow: 27, blue: 40 };
// // CORRECTED: This now points to the last square on the main track before turning home.
// const HOME_ENTRY_INDEX = { red: 51, green: 12, yellow: 25, blue: 38 };
// const SAFE_INDICES = new Set([1, 9, 14, 22, 27, 35, 40, 48]);

// const HOME_LANE_PATHS = {
//   red: range(HOME_LEN + 1).map(i => ({ r: 7, c: 1 + i })),
//   green: range(HOME_LEN + 1).map(i => ({ r: 1 + i, c: 7 })),
//   yellow: range(HOME_LEN + 1).map(i => ({ r: 7, c: 13 - i })),
//   blue: range(HOME_LEN + 1).map(i => ({ r: 13 - i, c: 7 })),
// };

// const BASE_PADS = {
//   red: [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 }],
//   green: [{ r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 }],
//   yellow: [{ r: 11, c: 11 }, { r: 11, c: 12 }, { r: 12, c: 11 }, { r: 12, c: 12 }],
//   blue: [{ r: 11, c: 2 }, { r: 11, c: 3 }, { r: 12, c: 2 }, { r: 12, c: 3 }],
// };

// // --- Game State & Logic ---
// const initialPlayer = (color, name = "Player") => ({
//   color,
//   name,
//   tokens: range(TOKENS_PER_PLAYER).map(() => ({
//     state: "base", // "base", "track", "home", "done"
//     pos: null, // on track: abs index, on home: lane index
//     relSteps: 0, // steps taken from start
//   })),
//   finished: 0,
// });

// function mod(a, n) {
//   return ((a % n) + n) % n;
// }

// function isSafeIndex(idx) {
//   return SAFE_INDICES.has(idx);
// }

// function absoluteTrackIndex(color, relSteps) {
//   return mod(ENTRY_INDEX[color] + relSteps, TRACK_LEN);
// }

// function legalMovesForPlayer(player, players, dice) {
//   const moves = [];
//   const { color, tokens } = player;
//   const homeEntryRelSteps = mod(HOME_ENTRY_INDEX[color] - ENTRY_INDEX[color], TRACK_LEN) + 1;

//   tokens.forEach((t, idx) => {
//     if (t.state === "base") {
//       if (dice === 6) {
//         const entryAbs = ENTRY_INDEX[color];
//         const isBlockedByOpponent = players.some(
//           (p) => p.color !== color && p.tokens.some((otherToken) => otherToken.state === "track" && otherToken.pos === entryAbs)
//         );
//         if (!isBlockedByOpponent) {
//           moves.push({ token: idx, type: "enter" });
//         }
//       }
//     } else if (t.state === "track") {
//       const nextRel = t.relSteps + dice;
//       if (nextRel < homeEntryRelSteps) {
//         const toAbs = absoluteTrackIndex(color, nextRel);
//         const isBlockedBySelf = tokens.some(
//             (otherToken) => otherToken.state === "track" && otherToken.pos === toAbs
//         );
//         if (!isBlockedBySelf) {
//           moves.push({ token: idx, type: "advance", to: toAbs, nextRelSteps: nextRel });
//         }
//       } else {
//         const homeLanePos = nextRel - homeEntryRelSteps;
//         if (homeLanePos < HOME_LEN) {
//           const isBlockedBySelf = tokens.some(
//             (otherToken) => otherToken.state === "home" && otherToken.pos === homeLanePos
//           );
//           if(!isBlockedBySelf) {
//             moves.push({ token: idx, type: "home-lane", laneTo: homeLanePos });
//           }
//         } else if (homeLanePos === HOME_LEN) {
//           moves.push({ token: idx, type: "finish" });
//         }
//       }
//     } else if (t.state === "home") {
//       const to = t.pos + dice;
//       if (to < HOME_LEN) {
//         const isBlockedBySelf = tokens.some(
//             (otherToken) => otherToken.state === "home" && otherToken.pos === to
//         );
//         if(!isBlockedBySelf) {
//           moves.push({ token: idx, type: "home-advance", laneTo: to });
//         }
//       } else if (to === HOME_LEN) {
//         moves.push({ token: idx, type: "finish" });
//       }
//     }
//   });
//   return moves;
// }

// function applyMove(game, pIdx, move) {
//   // Deep copy to avoid mutation issues
//   const g = { ...game, players: game.players.map(p => ({ ...p, tokens: p.tokens.map(t => ({ ...t })) })) };
//   const player = g.players[pIdx];
//   const token = player.tokens[move.token];

//   const captureIfAny = (absIndex) => {
//     if (isSafeIndex(absIndex)) return false;

//     let captured = false;
//     g.players.forEach((op, oi) => {
//       if (oi === pIdx) return; // Can't capture your own pieces
//       op.tokens.forEach((ot) => {
//         if (ot.state === "track" && ot.pos === absIndex) {
//           ot.state = "base";
//           ot.pos = null;
//           ot.relSteps = 0;
//           captured = true;
//         }
//       });
//     });
//     return captured;
//   };

//   let capturedOnMove = false;
//   if (move.type === "enter") {
//     token.state = "track";
//     token.pos = ENTRY_INDEX[player.color];
//     token.relSteps = 0;
//     capturedOnMove = captureIfAny(token.pos);
//   } else if (move.type === "advance") {
//     token.pos = move.to;
//     token.relSteps = move.nextRelSteps;
//     capturedOnMove = captureIfAny(token.pos);
//   } else if (move.type === "home-lane") {
//     token.state = "home";
//     token.pos = move.laneTo;
//   } else if (move.type === "home-advance") {
//     token.pos = move.laneTo;
//   } else if (move.type === "finish") {
//     token.state = "done";
//     token.pos = HOME_LEN; // Final position in home lane
//     player.finished += 1;
//   }

//   const rolledSix = game.diceValue === 6;
//   // An extra turn is granted for rolling a 6 or for a capture
//   g.extraTurn = rolledSix || capturedOnMove;

//   return g;
// }

// function nextActivePlayerIdx(game, current) {
//   if (game.extraTurn) return current;
//   for (let i = 1; i <= game.players.length; i++) {
//     const nextIdx = (current + i) % game.players.length;
//     // Skip players who have finished
//     if (game.players[nextIdx].finished < TOKENS_PER_PLAYER) return nextIdx;
//   }
//   return current; // Should only happen if all players are done
// }

// function getWinner(game) {
//     const finishedPlayers = game.players.filter(p => p.finished === TOKENS_PER_PLAYER);
//     if (finishedPlayers.length > 0) return finishedPlayers[0];
//     return null;
// }

// // --- UI Components ---
// function Token({ x, y, color, size = 18, highlight = false, onClick }) {
//   return (
//     <g onClick={onClick} className="cursor-pointer transition-transform duration-300 hover:scale-110">
//       <circle cx={x} cy={y} r={size} className={`${COLOR_CLASSES[color].fill} drop-shadow-lg`} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
//       <circle cx={x} cy={y} r={size * 0.65} className="fill-white/70" />
//       <circle cx={x} cy={y} r={size * 0.4} className={`${COLOR_CLASSES[color].fill}`} />
//       {highlight && (
//         <motion.circle
//           cx={x} cy={y} r={size + 6}
//           className="fill-transparent stroke-yellow-300"
//           strokeWidth="4"
//           initial={{ opacity: 0, scale: 1 }}
//           animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
//           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//         />
//       )}
//     </g>
//   );
// }

// function Dice({ value, rolling, onRoll, disabled }) {
//   return (
//     <button
//       onClick={onRoll}
//       disabled={rolling || disabled}
//       className="w-24 h-24 rounded-2xl shadow-lg bg-white text-black text-5xl font-bold flex items-center justify-center
//                    hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed
//                    focus:outline-none focus:ring-4 focus:ring-yellow-400"
//     >
//       {rolling ? "..." : value ?? ""}
//     </button>
//   );
// }

// function PlayerBadge({ p, active }) {
//   return (
//     <div className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-md transition-all duration-300 ${active ? "ring-4 ring-yellow-400 scale-105 bg-white" : "bg-white/80"}`}>
//       <span className={`inline-block w-5 h-5 rounded-full ${COLOR_CLASSES[p.color].bg} border-2 border-white/80 shadow-sm`} />
//       <span className="font-bold text-lg">{p.name}</span>
//       <span className="text-sm text-neutral-600 font-medium">({p.finished}/{TOKENS_PER_PLAYER})</span>
//     </div>
//   );
// }

// const LudoBoardSvg = () => {
//   return (
//     <svg viewBox={`-10 -10 ${BOARD_SIZE + 20} ${BOARD_SIZE + 20}`} className="w-full h-auto drop-shadow-2xl">
//       <defs>
//         <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
//           <feDropShadow dx="2" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.15"/>
//         </filter>
//       </defs>
//       <rect x="0" y="0" width={BOARD_SIZE} height={BOARD_SIZE} rx="20" className="fill-neutral-200" filter="url(#shadow)"/>

//       {/* Player Base Areas */}
//       {COLORS.map(color => (
//         <rect key={color}
//           x={color === 'red' || color === 'blue' ? 0 : 9 * CELL_SIZE}
//           y={color === 'red' || color === 'green' ? 0 : 9 * CELL_SIZE}
//           width={6 * CELL_SIZE} height={6 * CELL_SIZE}
//           className={`${COLOR_CLASSES[color].fill}`}
//         />
//       ))}

//       {/* Main Track Path */}
//       {TRACK_PATH.map((pos, i) => (
//         <rect key={`track-${i}`}
//           x={pos.c * CELL_SIZE} y={pos.r * CELL_SIZE}
//           width={CELL_SIZE} height={CELL_SIZE}
//           className="fill-white"
//         />
//       ))}

//       {/* Home Lanes */}
//       {COLORS.map(color => (
//         HOME_LANE_PATHS[color].slice(0, HOME_LEN).map((pos, i) => (
//           <rect key={`${color}-home-${i}`}
//             x={pos.c * CELL_SIZE} y={pos.r * CELL_SIZE}
//             width={CELL_SIZE} height={CELL_SIZE}
//             className={`${COLOR_CLASSES[color].fill}`}
//           />
//         ))
//       ))}

//       {/* Entry Squares */}
//       {COLORS.map(color => {
//         const pos = TRACK_PATH[ENTRY_INDEX[color]];
//         return <rect key={`${color}-entry`} x={pos.c * CELL_SIZE} y={pos.r * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} className={COLOR_CLASSES[color].fill} />
//       })}

//       {/* Grid lines */}
//       {range(16).map(i => <line key={`v-${i}`} x1={i*CELL_SIZE} y1={0} x2={i*CELL_SIZE} y2={BOARD_SIZE} className="stroke-black/10" strokeWidth="1"/>)}
//       {range(16).map(i => <line key={`h-${i}`} x1={0} y1={i*CELL_SIZE} x2={BOARD_SIZE} y2={i*CELL_SIZE} className="stroke-black/10" strokeWidth="1"/>)}

//       {/* Inner Base Squares */}
//       {COLORS.map(color => (
//         <rect key={`${color}-base-inner`}
//           x={(color === 'red' || color === 'blue' ? 1 : 10) * CELL_SIZE}
//           y={(color === 'red' || color === 'green' ? 1 : 10) * CELL_SIZE}
//           width={4 * CELL_SIZE} height={4 * CELL_SIZE}
//           rx="10"
//           className="fill-white/90"
//         />
//       ))}

//       {/* Home Base Token Placeholders */}
//       {COLORS.map(color =>
//         BASE_PADS[color].map((pad, i) => (
//           <g key={`${color}-pad-${i}`} className="opacity-70">
//             <circle
//               cx={(pad.c + 0.5) * CELL_SIZE}
//               cy={(pad.r + 0.5) * CELL_SIZE}
//               r={CELL_SIZE * 0.4}
//               className="fill-white"
//               stroke={COLOR_CLASSES[color].fill}
//               strokeWidth="2"
//             />
//             <circle
//               cx={(pad.c + 0.5) * CELL_SIZE}
//               cy={(pad.r + 0.5) * CELL_SIZE}
//               r={CELL_SIZE * 0.25}
//               className={`${COLOR_CLASSES[color].fill}`}
//               fillOpacity="0.4"
//             />
//           </g>
//         ))
//       )}

//       {/* Home Triangle */}
//       <polygon points={`${6*CELL_SIZE},${6*CELL_SIZE} ${9*CELL_SIZE},${6*CELL_SIZE} ${7.5*CELL_SIZE},${7.5*CELL_SIZE}`} className={COLOR_CLASSES.green.fill} />
//       <polygon points={`${9*CELL_SIZE},${6*CELL_SIZE} ${9*CELL_SIZE},${9*CELL_SIZE} ${7.5*CELL_SIZE},${7.5*CELL_SIZE}`} className={COLOR_CLASSES.yellow.fill} />
//       <polygon points={`${9*CELL_SIZE},${9*CELL_SIZE} ${6*CELL_SIZE},${9*CELL_SIZE} ${7.5*CELL_SIZE},${7.5*CELL_SIZE}`} className={COLOR_CLASSES.blue.fill} />
//       <polygon points={`${6*CELL_SIZE},${9*CELL_SIZE} ${6*CELL_SIZE},${6*CELL_SIZE} ${7.5*CELL_SIZE},${7.5*CELL_SIZE}`} className={COLOR_CLASSES.red.fill} />

//       {/* Safe Spot Stars */}
//       {Array.from(SAFE_INDICES).map(i => {
//         const pos = TRACK_PATH[i];
//         return <text key={`safe-${i}`} x={(pos.c + 0.5) * CELL_SIZE} y={(pos.r + 0.7) * CELL_SIZE} fontSize="28" textAnchor="middle" className="fill-gray-400">★</text>
//       })}
//     </svg>
//   );
// };

// function Setup({ onStart }) {
//   const [count, setCount] = useState(4);
//   const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);

//   return (
//     <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center">
//       <h1 className="text-4xl font-bold mb-2">Ludo Game</h1>
//       <p className="text-neutral-600 mb-6">Local pass-and-play for 2–4 players.</p>

//       <div className="mb-6">
//           <label className="block mb-2 font-bold text-lg">How many players?</label>
//           <div className="flex gap-4 justify-center">
//             {[2, 3, 4].map((n) => (
//               <button key={n} className={`w-16 h-16 rounded-full border-4 transition-all ${n === count ? "bg-yellow-400 border-yellow-600 scale-110" : "bg-neutral-200 border-transparent"}`} onClick={() => setCount(n)}>
//                 <span className="text-2xl font-bold">{n}</span>
//               </button>
//             ))}
//           </div>
//       </div>

//       <div className="space-y-4 mb-8">
//         {range(count).map((i) => (
//           <div key={i} className="flex items-center gap-3">
//             <span className={`w-8 h-8 rounded-full ${COLOR_CLASSES[COLORS[i]].bg}`} />
//             <input
//               className="w-full border-2 border-neutral-300 rounded-xl px-4 py-2 focus:border-yellow-500 focus:ring-yellow-500 transition"
//               value={names[i]}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 setNames((prev) => prev.map((p, idx) => (idx === i ? v : p)));
//               }}
//             />
//           </div>
//         ))}
//       </div>

//       <button
//         onClick={() => onStart(names.slice(0, count))}
//         className="w-full py-4 rounded-2xl bg-black text-white text-xl font-bold shadow-lg hover:bg-neutral-800 transition transform hover:scale-105"
//       >
//         Start Game
//       </button>
//     </div>
//   );
// }

// export default function App() {
//   const [game, setGame] = useState(null);
//   const [rolling, setRolling] = useState(false);
//   const [activeIdx, setActiveIdx] = useState(0);
//   const [sixChain, setSixChain] = useState(0);
//   const [message, setMessage] = useState("");
//   const [winner, setWinner] = useState(null);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [testDiceValue, setTestDiceValue] = useState("");

//   const startGame = (names) => {
//     const players = names.map((nm, i) => initialPlayer(COLORS[i], nm));
//     setGame({ players, diceValue: null, extraTurn: false });
//     setActiveIdx(0);
//     setSixChain(0);
//     setWinner(null);
//     setIsAnimating(false);
//     setMessage(`Game started! ${players[0].name} (Red) begins.`);
//   };

//   const activePlayer = game ? game.players[activeIdx] : null;

//   const legal = useMemo(() => {
//     if (!game || game.diceValue == null || !activePlayer || isAnimating) return [];
//     return legalMovesForPlayer(activePlayer, game.players, game.diceValue);
//   }, [game, activeIdx, isAnimating]);

//   const processDiceRoll = (v) => {
//     const newSixChain = v === 6 ? sixChain + 1 : 0;
//     setSixChain(newSixChain);
//     const currentActivePlayer = game.players[activeIdx];

//     setGame(g => ({ ...g, diceValue: v }));
//     setRolling(false);

//     if (newSixChain === 3) {
//       setMessage(`${currentActivePlayer.name} rolled three 6s. Turn forfeited!`);
//       setTimeout(() => endTurn(false), 1000);
//     } else {
//       const possibleMoves = legalMovesForPlayer(currentActivePlayer, game.players, v);
//       if (possibleMoves.length === 0) {
//           setMessage(`${currentActivePlayer.name} rolled a ${v} but has no moves.`);
//           setTimeout(() => endTurn(v === 6), 1500);
//       }
//     }
//   };

//   const rollDice = () => {
//     if (!game || rolling || winner || game.diceValue != null) return;
//     setRolling(true);
//     setMessage("");

//     setTimeout(() => {
//       const v = Math.floor(Math.random() * 6) + 1;
//       processDiceRoll(v);
//     }, 500);
//   };

//   const handleTestRoll = () => {
//     if (!game || rolling || winner || game.diceValue != null) return;
//     const value = parseInt(testDiceValue, 10);

//     if (isNaN(value) || value < 1 || value > 6) {
//       setMessage("Invalid tester value. Please enter a number between 1 and 6.");
//       return;
//     }

//     setTestDiceValue("");
//     setMessage(`Tester dice set to ${value}.`);
//     processDiceRoll(value);
//   };

//   const endTurn = (extraTurn) => {
//     if (!game) return;

//     const w = getWinner(game);
//     if (w) {
//         setWinner(w);
//         setMessage(`${w.name} has won the game! Congratulations!`);
//         return;
//     }

//     const nextIdx = extraTurn ? activeIdx : nextActivePlayerIdx(game, activeIdx);
//     setActiveIdx(nextIdx);
//     setGame(g => ({...g, diceValue: null, extraTurn: false }));
//     setSixChain(extraTurn ? sixChain : 0);
//     if (!getWinner(game)) {
//       setMessage(`${game.players[nextIdx].name}'s turn to roll.`);
//     }
//   };

//  const executeMove = async (mv) => {
//     if (!game || game.diceValue == null || winner || isAnimating) return;

//     setIsAnimating(true);

//     const player = activePlayer;
//     const tokenIndex = mv.token;
//     const dice = game.diceValue;
//     const startToken = player.tokens[tokenIndex];

//     if (mv.type === 'enter' || mv.type === 'finish') {
//         const finalGame = applyMove(game, activeIdx, mv);
//         setGame(finalGame);
//         setTimeout(() => {
//             const w = getWinner(finalGame);
//             if (w) {
//                 setWinner(w);
//                 setMessage(`${w.name} wins!`);
//             } else {
//                 endTurn(finalGame.extraTurn);
//             }
//             setIsAnimating(false);
//         }, 100);
//         return;
//     }

//     const pathSteps = [];
//     const homeEntryRelSteps = mod(HOME_ENTRY_INDEX[player.color] - ENTRY_INDEX[player.color], TRACK_LEN) + 1;

//     if (startToken.state === 'track' && mv.type === 'advance') {
//         for (let i = 1; i <= dice; i++) {
//             const nextRelSteps = startToken.relSteps + i;
//             pathSteps.push({
//                 state: 'track',
//                 pos: absoluteTrackIndex(player.color, nextRelSteps),
//                 relSteps: nextRelSteps,
//             });
//         }
//     } else if (startToken.state === 'track' && mv.type === 'home-lane') {
//         // CORRECTED ANIMATION LOGIC
//         for (let i = 1; i <= dice; i++) {
//             const currentTotalSteps = startToken.relSteps + i;
//             if (currentTotalSteps < homeEntryRelSteps) {
//                 // Still on the main track
//                 pathSteps.push({
//                     state: 'track',
//                     pos: absoluteTrackIndex(player.color, currentTotalSteps),
//                     relSteps: currentTotalSteps,
//                 });
//             } else {
//                 // Entered the home lane
//                 const homeLanePos = currentTotalSteps - homeEntryRelSteps;
//                 pathSteps.push({
//                     state: 'home',
//                     pos: homeLanePos,
//                     relSteps: currentTotalSteps,
//                 });
//             }
//         }
//     } else if (startToken.state === 'home' && mv.type === 'home-advance') {
//         for (let i = 1; i <= dice; i++) {
//             pathSteps.push({
//                 state: 'home',
//                 pos: startToken.pos + i,
//             });
//         }
//     }

//     const originalGameForApply = JSON.parse(JSON.stringify(game));
//     for (const step of pathSteps) {
//         setGame(g => {
//             const newG = JSON.parse(JSON.stringify(g));
//             const tokenToMove = newG.players[activeIdx].tokens[tokenIndex];
//             tokenToMove.state = step.state;
//             tokenToMove.pos = step.pos;
//             if (step.relSteps !== undefined) {
//                 tokenToMove.relSteps = step.relSteps;
//             }
//             return newG;
//         });
//         await new Promise(res => setTimeout(res, 200));
//     }

//     const finalGame = applyMove(originalGameForApply, activeIdx, mv);
//     setGame(finalGame);

//     setTimeout(() => {
//         const w = getWinner(finalGame);
//         if (w) {
//             setWinner(w);
//             setMessage(`${w.name} wins!`);
//         } else {
//             endTurn(finalGame.extraTurn);
//         }
//         setIsAnimating(false);
//     }, 100);
// };

//   const reset = () => {
//     setGame(null);
//     setMessage("");
//     setWinner(null);
//   };

//   const tokenCoord = (playerColor, token, tokenIndex) => {
//     let r, c;
//     if (token.state === "base") {
//       ({ r, c } = BASE_PADS[playerColor][tokenIndex]);
//     } else if (token.state === "track") {
//       ({ r, c } = TRACK_PATH[token.pos]);
//     } else if (token.state === "home" || token.state === 'done') {
//       ({ r, c } = HOME_LANE_PATHS[playerColor][token.pos]);
//     } else {
//       return { x: -100, y: -100 }; // Should not happen
//     }
//     return { x: (c + 0.5) * CELL_SIZE, y: (r + 0.5) * CELL_SIZE };
//   };

//   const selectableTokens = useMemo(() => {
//     if (!game || game.diceValue == null) return new Set();
//     return new Set(legal.map(mv => mv.token));
//   }, [legal]);

//   return (
//     <div className="w-full min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 gap-4 font-sans">
//       {!game ? (
//         <Setup onStart={startGame} />
//       ) : (
//         <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center">
//           <div className="flex-[2] relative w-full mx-auto aspect-square">
//             <LudoBoardSvg />
//             <svg viewBox={`-10 -10 ${BOARD_SIZE + 20} ${BOARD_SIZE + 20}`} className="absolute top-0 left-0 w-full h-full pointer-events-none">
//               <AnimatePresence>
//                 {game.players.map((p) =>
//                   p.tokens.map((t, ti) => {
//                     const { x, y } = tokenCoord(p.color, t, ti);
//                     const isSelectable = selectableTokens.has(ti) && p.color === activePlayer.color;
//                     return (
//                         <motion.g
//                           key={`${p.color}-${ti}`}
//                           initial={{ x: x, y: y }}
//                           animate={{ x: x, y: y }}
//                           transition={{ type: "tween", duration: 0.2, ease: "linear" }}
//                           className="pointer-events-auto"
//                         >
//                             <Token
//                                 x={0} y={0}
//                                 color={p.color}
//                                 highlight={isSelectable}
//                                 onClick={() => {
//                                     if (!isSelectable) return;
//                                     const mv = legal.find((m) => m.token === ti);
//                                     if (mv) executeMove(mv);
//                                 }}
//                             />
//                         </motion.g>
//                     );
//                   })
//                 )}
//               </AnimatePresence>
//             </svg>
//           </div>

//           <div className="flex-[1] bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col gap-5 w-full md:w-auto">
//             <div className="flex flex-wrap items-center justify-center gap-3">
//                 {game.players.map((p, i) => (
//                     <PlayerBadge key={i} p={p} active={i === activeIdx && !winner} />
//                 ))}
//             </div>
//             <hr className="border-t-2 border-neutral-200"/>
//             <div className="flex flex-col items-center gap-4 text-center">
//                 <h2 className="text-2xl font-bold">
//                     {winner ? "Game Over!" : `${activePlayer?.name}'s Turn`}
//                 </h2>
//                 <Dice value={game.diceValue} rolling={rolling} onRoll={rollDice} disabled={game.diceValue != null || winner || isAnimating} />
//                 <p className="h-12 text-neutral-700 font-medium text-lg px-4">{message}</p>
//             </div>
//             {/* Tester Dice Section */}
//             <div className="flex flex-col items-center gap-2 mt-4 p-4 border-t-2 border-neutral-200">
//               <h3 className="text-lg font-semibold">Tester Dice</h3>
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   min="1"
//                   max="6"
//                   value={testDiceValue}
//                   onChange={(e) => setTestDiceValue(e.target.value)}
//                   placeholder="1-6"
//                   className="w-20 px-2 py-1 text-center border-2 border-neutral-300 rounded-lg"
//                   disabled={game.diceValue != null || winner || isAnimating}
//                 />
//                 <button
//                   onClick={handleTestRoll}
//                   disabled={game.diceValue != null || winner || isAnimating}
//                   className="px-4 py-2 bg-yellow-400 text-neutral-900 font-bold rounded-lg shadow-md hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Set Roll
//                 </button>
//               </div>
//             </div>

//             <div className="mt-auto flex flex-col gap-4">
//                 {winner && (
//                     <div className="p-4 bg-yellow-300 rounded-xl text-center font-bold text-2xl text-yellow-900 shadow-inner">
//                             {winner.name} Wins!
//                     </div>
//                 )}
//                 <button className="w-full py-3 rounded-xl bg-black text-white text-xl font-bold shadow-lg hover:bg-neutral-800 transition transform hover:scale-105" onClick={reset}>
//                     {winner ? "Play Again" : "New Game"}
//                 </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

//2nd - Break the app code into component .
// import React, { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// // Config & Logic
// import {
//     COLORS, BASE_PADS, TRACK_PATH, HOME_LANE_PATHS, BOARD_SIZE, CELL_SIZE,
//     ENTRY_INDEX, HOME_ENTRY_INDEX, TRACK_LEN
// } from './config/constants';
// import { initialPlayer, legalMovesForPlayer, applyMove, nextActivePlayerIdx, getWinner, mod } from './logic/gameLogic';

// // Components
// import SetupScreen from './components/SetupScreen';
// import LudoBoard from './components/LudoBoard';
// import Token from './components/Token';
// import Dice from './components/Dice';
// import PlayerBadge from './components/PlayerBadge';

// export default function App() {
//     const [game, setGame] = useState(null);
//     const [rolling, setRolling] = useState(false);
//     const [activeIdx, setActiveIdx] = useState(0);
//     const [sixChain, setSixChain] = useState(0);
//     const [message, setMessage] = useState("");
//     const [winner, setWinner] = useState(null);
//     const [isAnimating, setIsAnimating] = useState(false);
//     const [testDiceValue, setTestDiceValue] = useState("");

//     const startGame = (names) => {
//         const players = names.map((nm, i) => initialPlayer(COLORS[i], nm));
//         setGame({ players, diceValue: null, extraTurn: false });
//         setActiveIdx(0);
//         setSixChain(0);
//         setWinner(null);
//         setIsAnimating(false);
//         setMessage(`Game started! ${players[0].name} (Red) begins.`);
//     };

//     const activePlayer = game ? game.players[activeIdx] : null;

//     const legal = useMemo(() => {
//         if (!game || game.diceValue == null || !activePlayer || isAnimating) return [];
//         return legalMovesForPlayer(activePlayer, game.players, game.diceValue);
//     }, [game, activeIdx, isAnimating]);

//     const processDiceRoll = (v) => {
//         const newSixChain = v === 6 ? sixChain + 1 : 0;
//         setSixChain(newSixChain);
//         const currentActivePlayer = game.players[activeIdx];

//         setGame(g => ({ ...g, diceValue: v }));
//         setRolling(false);

//         if (newSixChain === 3) {
//             setMessage(`${currentActivePlayer.name} rolled three 6s. Turn forfeited!`);
//             setTimeout(() => endTurn(false), 1000);
//         } else {
//             const possibleMoves = legalMovesForPlayer(currentActivePlayer, game.players, v);
//             if (possibleMoves.length === 0) {
//                 setMessage(`${currentActivePlayer.name} rolled a ${v} but has no moves.`);
//                 setTimeout(() => endTurn(v === 6), 1500);
//             }
//         }
//     };

//     const rollDice = () => {
//         if (!game || rolling || winner || game.diceValue != null) return;
//         setRolling(true);
//         setMessage("");

//         setTimeout(() => {
//             const v = Math.floor(Math.random() * 6) + 1;
//             processDiceRoll(v);
//         }, 500);
//     };

//     const handleTestRoll = () => {
//         if (!game || rolling || winner || game.diceValue != null) return;
//         const value = parseInt(testDiceValue, 10);

//         if (isNaN(value) || value < 1 || value > 6) {
//             setMessage("Invalid tester value. Please enter a number between 1 and 6.");
//             return;
//         }

//         setTestDiceValue("");
//         setMessage(`Tester dice set to ${value}.`);
//         processDiceRoll(value);
//     };

//     const endTurn = (extraTurn) => {
//         if (!game) return;

//         const w = getWinner(game);
//         if (w) {
//             setWinner(w);
//             setMessage(`${w.name} has won the game! Congratulations!`);
//             return;
//         }

//         const nextIdx = extraTurn ? activeIdx : nextActivePlayerIdx(game, activeIdx);
//         setActiveIdx(nextIdx);
//         setGame(g => ({...g, diceValue: null, extraTurn: false }));
//         setSixChain(extraTurn ? sixChain : 0);
//         if (!getWinner(game)) {
//             setMessage(`${game.players[nextIdx].name}'s turn to roll.`);
//         }
//     };

//     const executeMove = async (mv) => {
//         if (!game || game.diceValue == null || winner || isAnimating) return;

//         setIsAnimating(true);

//         const player = activePlayer;
//         const tokenIndex = mv.token;
//         const dice = game.diceValue;
//         const startToken = player.tokens[tokenIndex];

//         if (mv.type === 'enter' || mv.type === 'finish') {
//             const finalGame = applyMove(game, activeIdx, mv);
//             setGame(finalGame);
//             setTimeout(() => {
//                 const w = getWinner(finalGame);
//                 if (w) {
//                     setWinner(w);
//                     setMessage(`${w.name} wins!`);
//                 } else {
//                     endTurn(finalGame.extraTurn);
//                 }
//                 setIsAnimating(false);
//             }, 100);
//             return;
//         }

//         const pathSteps = [];
//         const homeEntryRelSteps = mod(HOME_ENTRY_INDEX[player.color] - ENTRY_INDEX[player.color], TRACK_LEN) + 1;

//         if (startToken.state === 'track' && mv.type === 'advance') {
//             for (let i = 1; i <= dice; i++) {
//                 const nextRelSteps = startToken.relSteps + i;
//                 pathSteps.push({
//                     state: 'track',
//                     pos: mod(ENTRY_INDEX[player.color] + nextRelSteps, TRACK_LEN),
//                     relSteps: nextRelSteps,
//                 });
//             }
//         } else if (startToken.state === 'track' && mv.type === 'home-lane') {
//             for (let i = 1; i <= dice; i++) {
//                 const currentTotalSteps = startToken.relSteps + i;
//                 if (currentTotalSteps < homeEntryRelSteps) {
//                     pathSteps.push({
//                         state: 'track',
//                         pos: mod(ENTRY_INDEX[player.color] + currentTotalSteps, TRACK_LEN),
//                         relSteps: currentTotalSteps,
//                     });
//                 } else {
//                     const homeLanePos = currentTotalSteps - homeEntryRelSteps;
//                     pathSteps.push({
//                         state: 'home',
//                         pos: homeLanePos,
//                         relSteps: currentTotalSteps,
//                     });
//                 }
//             }
//         } else if (startToken.state === 'home' && mv.type === 'home-advance') {
//             for (let i = 1; i <= dice; i++) {
//                 pathSteps.push({
//                     state: 'home',
//                     pos: startToken.pos + i,
//                 });
//             }
//         }

//         const originalGameForApply = JSON.parse(JSON.stringify(game));
//         for (const step of pathSteps) {
//             setGame(g => {
//                 const newG = JSON.parse(JSON.stringify(g));
//                 const tokenToMove = newG.players[activeIdx].tokens[tokenIndex];
//                 tokenToMove.state = step.state;
//                 tokenToMove.pos = step.pos;
//                 if (step.relSteps !== undefined) {
//                     tokenToMove.relSteps = step.relSteps;
//                 }
//                 return newG;
//             });
//             await new Promise(res => setTimeout(res, 200));
//         }

//         const finalGame = applyMove(originalGameForApply, activeIdx, mv);
//         setGame(finalGame);

//         setTimeout(() => {
//             const w = getWinner(finalGame);
//             if (w) {
//                 setWinner(w);
//                 setMessage(`${w.name} wins!`);
//             } else {
//                 endTurn(finalGame.extraTurn);
//             }
//             setIsAnimating(false);
//         }, 100);
//     };

//     const reset = () => {
//         setGame(null);
//         setMessage("");
//         setWinner(null);
//     };

//     const tokenCoord = (playerColor, token, tokenIndex) => {
//         let r, c;
//         if (token.state === "base") {
//             ({ r, c } = BASE_PADS[playerColor][tokenIndex]);
//         } else if (token.state === "track") {
//             ({ r, c } = TRACK_PATH[token.pos]);
//         } else if (token.state === "home" || token.state === 'done') {
//             ({ r, c } = HOME_LANE_PATHS[playerColor][token.pos]);
//         } else {
//             return { x: -100, y: -100 }; // Should not happen
//         }
//         return { x: (c + 0.5) * CELL_SIZE, y: (r + 0.5) * CELL_SIZE };
//     };

//     const selectableTokens = useMemo(() => {
//         if (!game || game.diceValue == null) return new Set();
//         return new Set(legal.map(mv => mv.token));
//     }, [legal]);

//     return (
//         <div className="w-full min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 gap-4 font-sans">
//             {!game ? (
//                 <SetupScreen onStart={startGame} />
//             ) : (
//                 <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center">
//                     <div className="flex-[2] relative w-full mx-auto aspect-square">
//                         <LudoBoard />
//                         <svg viewBox={`-10 -10 ${BOARD_SIZE + 20} ${BOARD_SIZE + 20}`} className="absolute top-0 left-0 w-full h-full pointer-events-none">
//                             <AnimatePresence>
//                                 {game.players.map((p) =>
//                                     p.tokens.map((t, ti) => {
//                                         const { x, y } = tokenCoord(p.color, t, ti);
//                                         const isSelectable = selectableTokens.has(ti) && p.color === activePlayer.color;
//                                         return (
//                                             <motion.g
//                                                 key={`${p.color}-${ti}`}
//                                                 initial={{ x: x, y: y }}
//                                                 animate={{ x: x, y: y }}
//                                                 transition={{ type: "tween", duration: 0.2, ease: "linear" }}
//                                                 className="pointer-events-auto"
//                                             >
//                                                 <Token
//                                                     x={0} y={0}
//                                                     color={p.color}
//                                                     highlight={isSelectable}
//                                                     onClick={() => {
//                                                         if (!isSelectable) return;
//                                                         const mv = legal.find((m) => m.token === ti);
//                                                         if (mv) executeMove(mv);
//                                                     }}
//                                                 />
//                                             </motion.g>
//                                         );
//                                     })
//                                 )}
//                             </AnimatePresence>
//                         </svg>
//                     </div>

//                     <div className="flex-[1] bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col gap-5 w-full md:w-auto">
//                         <div className="flex flex-wrap items-center justify-center gap-3">
//                             {game.players.map((p, i) => (
//                                 <PlayerBadge key={i} p={p} active={i === activeIdx && !winner} />
//                             ))}
//                         </div>
//                         <hr className="border-t-2 border-neutral-200" />
//                         <div className="flex flex-col items-center gap-4 text-center">
//                             <h2 className="text-2xl font-bold">
//                                 {winner ? "Game Over!" : `${activePlayer?.name}'s Turn`}
//                             </h2>
//                             <Dice value={game.diceValue} rolling={rolling} onRoll={rollDice} disabled={game.diceValue != null || winner || isAnimating} />
//                             <p className="h-12 text-neutral-700 font-medium text-lg px-4">{message}</p>
//                         </div>
//                         {/* Tester Dice Section */}
//                         <div className="flex flex-col items-center gap-2 mt-4 p-4 border-t-2 border-neutral-200">
//                             <h3 className="text-lg font-semibold">Tester Dice</h3>
//                             <div className="flex gap-2">
//                                 <input
//                                     type="number" min="1" max="6"
//                                     value={testDiceValue}
//                                     onChange={(e) => setTestDiceValue(e.target.value)}
//                                     placeholder="1-6"
//                                     className="w-20 px-2 py-1 text-center border-2 border-neutral-300 rounded-lg"
//                                     disabled={game.diceValue != null || winner || isAnimating}
//                                 />
//                                 <button
//                                     onClick={handleTestRoll}
//                                     disabled={game.diceValue != null || winner || isAnimating}
//                                     className="px-4 py-2 bg-yellow-400 text-neutral-900 font-bold rounded-lg shadow-md hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     Set Roll
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="mt-auto flex flex-col gap-4">
//                             {winner && (
//                                 <div className="p-4 bg-yellow-300 rounded-xl text-center font-bold text-2xl text-yellow-900 shadow-inner">
//                                     {winner.name} Wins!
//                                 </div>
//                             )}
//                             <button className="w-full py-3 rounded-xl bg-black text-white text-xl font-bold shadow-lg hover:bg-neutral-800 transition transform hover:scale-105" onClick={reset}>
//                                 {winner ? "Play Again" : "New Game"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid"; // Import uuid

import OnlineSetup from "./components/OnlineSetup";
import Lobby from "./components/Lobby";
import GameScreen from "./components/GameScreen";
import * as SoundManager from "./utils/SoundManager";

// Your server URL
const socket = io("https://ludo-server-production.up.railway.app/");
// const socket = io("https://qnl5mx-4000.csb.app/");

// Function to get or create a persistent user ID
const getUserId = () => {
  let userId = localStorage.getItem("ludoUserId");
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("ludoUserId", userId);
  }
  return userId;
};

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState("");
  const [userId] = useState(getUserId()); // Get or create the user's persistent ID on load

  useEffect(() => {
    // --- Reconnection Logic ---
    const roomId = localStorage.getItem("ludoRoomId");
    if (roomId && userId) {
      socket.emit("reconnectGame", { roomId, userId });
    }

    const handleGameStateUpdate = (newGameState) => {
      setGameState(newGameState);
      // Store the current room ID to enable reconnection on refresh
      localStorage.setItem("ludoRoomId", newGameState.roomId);
      setError("");
    };
    const handleError = (errorMessage) => {
      setError(errorMessage);
    };

    socket.on("gameStateUpdate", handleGameStateUpdate);
    socket.on("error", handleError);

    return () => {
      socket.off("gameStateUpdate", handleGameStateUpdate);
      socket.off("error", handleError);
    };
  }, [userId]); // Dependency array ensures this runs once on load

  useEffect(() => {
    if (gameState?.status === "playing") {
      SoundManager.playBackgroundMusic();
    } else {
      SoundManager.stopBackgroundMusic();
    }

    // --- Cleanup Logic ---
    // If the game is finished, remove the roomId from local storage
    if (gameState?.status === "finished") {
      localStorage.removeItem("ludoRoomId");
    }
  }, [gameState]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
          {/* Pass userId to OnlineSetup */}
          <OnlineSetup socket={socket} userId={userId} />
          <p className="mt-4 p-4 bg-red-200 text-red-800 rounded-lg shadow-md">
            {error}
          </p>
        </div>
      );
    }

    if (!gameState) {
      // Pass userId to OnlineSetup
      return <OnlineSetup socket={socket} userId={userId} />;
    }

    if (gameState.status === "lobby") {
      // Pass userId to Lobby
      return <Lobby gameState={gameState} socket={socket} userId={userId} />;
    }

    if (gameState.status === "playing" || gameState.status === "finished") {
      // Pass userId to GameScreen
      return (
        <GameScreen gameState={gameState} socket={socket} userId={userId} />
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-[url('/casino-image.jpg')] bg-repeat flex flex-col items-center justify-center p-4 gap-4 font-sans">
      {renderContent()}
    </div>
  );
}
