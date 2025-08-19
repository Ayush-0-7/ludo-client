import React, { useState, useEffect } from "react";

// 🎲 Symmetric Dice Face
const DiceFace = ({ number }) => {
  // 3x3 matrix grid for perfect symmetry
  const dotGrid = {
    1: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    2: [[1, 0, 0], [0, 0, 0], [0, 0, 1]],
    3: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    4: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
    5: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
    6: [[1, 0, 1], [1, 0, 1], [1, 0, 1]],
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-3">
      {dotGrid[number].flat().map((dot, i) => (
        <div key={i} className="flex justify-center items-center">
          {dot ? (
            <span className="w-4 h-4 bg-black rounded-full shadow-sm" />
          ) : null}
        </div>
      ))}
    </div>
  );
};

// 🎲 Dice Component
export default function Dice({ value, rolling, onRoll, disabled }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (rolling) {
      // While rolling: spin randomly
      setRotation({
        x: Math.floor(Math.random() * 12 + 6) * 90,
        y: Math.floor(Math.random() * 12 + 6) * 90,
      });
    } else if (value) {
      // Final orientation: synced with rolled value
      const valueToRotation = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: -90 },
        3: { x: -90, y: 0 },
        4: { x: 90, y: 0 },
        5: { x: 0, y: 90 },
        6: { x: 0, y: 180 },
      };
      setRotation(valueToRotation[value]);
    }
  }, [rolling, value]);

  const sceneStyle = { perspective: "1200px" };
  const cubeStyle = {
    transformStyle: "preserve-3d",
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: rolling
      ? "transform 1.2s cubic-bezier(.36,.07,.19,.97)"
      : "transform 0.8s ease-out",
  };

  // 🎨 3D realistic styles for dice faces
  const faceBase =
    "absolute w-full h-full flex justify-center items-center rounded-2xl shadow-md " +
    "bg-gradient-to-br from-white via-neutral-100 to-neutral-300 border border-neutral-400";

  const faces = {
    front: { transform: "rotateY(0deg) translateZ(50px)" },
    back: { transform: "rotateY(180deg) translateZ(50px)" },
    right: { transform: "rotateY(90deg) translateZ(50px)" },
    left: { transform: "rotateY(-90deg) translateZ(50px)" },
    top: { transform: "rotateX(90deg) translateZ(50px)" },
    bottom: { transform: "rotateX(-90deg) translateZ(50px)" },
  };

  return (
    <button
      onClick={onRoll}
      disabled={rolling || disabled}
      style={sceneStyle}
      className="w-24 h-24 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div style={cubeStyle} className="relative w-full h-full">
        <div style={faces.front} className={faceBase}><DiceFace number={1} /></div>
        <div style={faces.right} className={faceBase}><DiceFace number={2} /></div>
        <div style={faces.top} className={faceBase}><DiceFace number={3} /></div>
        <div style={faces.bottom} className={faceBase}><DiceFace number={4} /></div>
        <div style={faces.left} className={faceBase}><DiceFace number={5} /></div>
        <div style={faces.back} className={faceBase}><DiceFace number={6} /></div>
      </div>
    </button>
  );
}
