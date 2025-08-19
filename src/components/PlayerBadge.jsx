import React from "react";
import { COLOR_CLASSES, TOKENS_PER_PLAYER } from "../config/constants";

export default function PlayerBadge({ p, active }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-md transition-all duration-300 ${active ? "ring-4 ring-yellow-400 scale-105 bg-white" : "bg-white/80"}`}>
      <span className={`inline-block w-5 h-5 rounded-full ${COLOR_CLASSES[p.color].bg} border-2 border-white/80 shadow-sm`} />
      <span className="font-bold text-lg">{p.name}</span>
      <span className="text-sm text-neutral-600 font-medium">({p.finished}/{TOKENS_PER_PLAYER})</span>
    </div>
  );
}