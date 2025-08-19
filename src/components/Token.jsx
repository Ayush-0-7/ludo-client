import React from "react";
import { motion } from "framer-motion";
import { COLOR_CLASSES } from "../config/constants";

export default function Token({ x, y, color, size = 18, highlight = false, onClick }) {
  return (
    <g onClick={onClick} className="cursor-pointer transition-transform duration-300 hover:scale-110">
      <circle cx={x} cy={y} r={size} className={`${COLOR_CLASSES[color].fill} drop-shadow-lg`} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
      <circle cx={x} cy={y} r={size * 0.65} className="fill-white/70" />
      <circle cx={x} cy={y} r={size * 0.4} className={`${COLOR_CLASSES[color].fill}`} />
      {highlight && (
        <motion.circle
          cx={x} cy={y} r={size + 6}
          className="fill-transparent stroke-yellow-300"
          strokeWidth="4"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </g>
  );
}