import React, { useState } from "react";
import { range, COLORS, COLOR_CLASSES } from '../config/constants';

export default function SetupScreen({ onStart }) {
  const [count, setCount] = useState(4);
  const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center">
      <h1 className="text-4xl font-bold mb-2">Ludo Game</h1>
      <p className="text-neutral-600 mb-6">Local pass-and-play for 2–4 players.</p>

      <div className="mb-6">
          <label className="block mb-2 font-bold text-lg">How many players?</label>
          <div className="flex gap-4 justify-center">
            {[2, 3, 4].map((n) => (
              <button key={n} className={`w-16 h-16 rounded-full border-4 transition-all ${n === count ? "bg-yellow-400 border-yellow-600 scale-110" : "bg-neutral-200 border-transparent"}`} onClick={() => setCount(n)}>
                <span className="text-2xl font-bold">{n}</span>
              </button>
            ))}
          </div>
      </div>

      <div className="space-y-4 mb-8">
        {range(count).map((i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full ${COLOR_CLASSES[COLORS[i]].bg}`} />
            <input
              className="w-full border-2 border-neutral-300 rounded-xl px-4 py-2 focus:border-yellow-500 focus:ring-yellow-500 transition"
              value={names[i]}
              onChange={(e) => {
                const v = e.target.value;
                setNames((prev) => prev.map((p, idx) => (idx === i ? v : p)));
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onStart(names.slice(0, count))}
        className="w-full py-4 rounded-2xl bg-black text-white text-xl font-bold shadow-lg hover:bg-neutral-800 transition transform hover:scale-105"
      >
        Start Game
      </button>
    </div>
  );
}