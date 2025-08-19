import React from 'react';
import {
    BOARD_SIZE, CELL_SIZE, COLORS, COLOR_CLASSES, TRACK_PATH, HOME_LANE_PATHS, HOME_LEN,
    ENTRY_INDEX, BASE_PADS, SAFE_INDICES, range
} from '../config/constants';

export default function LudoBoard() {
    return (
        <svg viewBox={`-10 -10 ${BOARD_SIZE + 20} ${BOARD_SIZE + 20}`} className="w-full h-auto drop-shadow-2xl">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
                </filter>
            </defs>
            <rect x="0" y="0" width={BOARD_SIZE} height={BOARD_SIZE} rx="20" className="fill-neutral-200" filter="url(#shadow)" />

            {/* Player Base Areas */}
            {COLORS.map(color => (
                <rect key={color}
                    x={color === 'red' || color === 'blue' ? 0 : 9 * CELL_SIZE}
                    y={color === 'red' || color === 'green' ? 0 : 9 * CELL_SIZE}
                    width={6 * CELL_SIZE} height={6 * CELL_SIZE}
                    className={`${COLOR_CLASSES[color].fill}`}
                />
            ))}

            {/* Main Track Path */}
            {TRACK_PATH.map((pos, i) => (
                <rect key={`track-${i}`}
                    x={pos.c * CELL_SIZE} y={pos.r * CELL_SIZE}
                    width={CELL_SIZE} height={CELL_SIZE}
                    className="fill-white"
                />
            ))}

            {/* Home Lanes */}
            {COLORS.map(color => (
                HOME_LANE_PATHS[color].slice(0, HOME_LEN).map((pos, i) => (
                    <rect key={`${color}-home-${i}`}
                        x={pos.c * CELL_SIZE} y={pos.r * CELL_SIZE}
                        width={CELL_SIZE} height={CELL_SIZE}
                        className={`${COLOR_CLASSES[color].fill}`}
                    />
                ))
            ))}

            {/* Entry Squares */}
            {COLORS.map(color => {
                const pos = TRACK_PATH[ENTRY_INDEX[color]];
                return <rect key={`${color}-entry`} x={pos.c * CELL_SIZE} y={pos.r * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} className={COLOR_CLASSES[color].fill} />
            })}

            {/* Grid lines */}
            {range(16).map(i => <line key={`v-${i}`} x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={BOARD_SIZE} className="stroke-black/10" strokeWidth="1" />)}
            {range(16).map(i => <line key={`h-${i}`} x1={0} y1={i * CELL_SIZE} x2={BOARD_SIZE} y2={i * CELL_SIZE} className="stroke-black/10" strokeWidth="1" />)}

            {/* Inner Base Squares */}
            {COLORS.map(color => (
                <rect key={`${color}-base-inner`}
                    x={(color === 'red' || color === 'blue' ? 1 : 10) * CELL_SIZE}
                    y={(color === 'red' || color === 'green' ? 1 : 10) * CELL_SIZE}
                    width={4 * CELL_SIZE} height={4 * CELL_SIZE}
                    rx="10"
                    className="fill-white/90"
                />
            ))}

            {/* Home Base Token Placeholders */}
            {COLORS.map(color =>
                BASE_PADS[color].map((pad, i) => (
                    <g key={`${color}-pad-${i}`} className="opacity-70">
                        <circle
                            cx={(pad.c + 0.5) * CELL_SIZE}
                            cy={(pad.r + 0.5) * CELL_SIZE}
                            r={CELL_SIZE * 0.4}
                            className="fill-white"
                            stroke={COLOR_CLASSES[color].fill}
                            strokeWidth="2"
                        />
                        <circle
                            cx={(pad.c + 0.5) * CELL_SIZE}
                            cy={(pad.r + 0.5) * CELL_SIZE}
                            r={CELL_SIZE * 0.25}
                            className={`${COLOR_CLASSES[color].fill}`}
                            fillOpacity="0.4"
                        />
                    </g>
                ))
            )}

            {/* Home Triangle */}
            <polygon points={`${6 * CELL_SIZE},${6 * CELL_SIZE} ${9 * CELL_SIZE},${6 * CELL_SIZE} ${7.5 * CELL_SIZE},${7.5 * CELL_SIZE}`} className={COLOR_CLASSES.green.fill} />
            <polygon points={`${9 * CELL_SIZE},${6 * CELL_SIZE} ${9 * CELL_SIZE},${9 * CELL_SIZE} ${7.5 * CELL_SIZE},${7.5 * CELL_SIZE}`} className={COLOR_CLASSES.yellow.fill} />
            <polygon points={`${9 * CELL_SIZE},${9 * CELL_SIZE} ${6 * CELL_SIZE},${9 * CELL_SIZE} ${7.5 * CELL_SIZE},${7.5 * CELL_SIZE}`} className={COLOR_CLASSES.blue.fill} />
            <polygon points={`${6 * CELL_SIZE},${9 * CELL_SIZE} ${6 * CELL_SIZE},${6 * CELL_SIZE} ${7.5 * CELL_SIZE},${7.5 * CELL_SIZE}`} className={COLOR_CLASSES.red.fill} />

            {/* Safe Spot Stars */}
            {Array.from(SAFE_INDICES).map(i => {
                const pos = TRACK_PATH[i];
                return <text key={`safe-${i}`} x={(pos.c + 0.5) * CELL_SIZE} y={(pos.r + 0.7) * CELL_SIZE} fontSize="28" textAnchor="middle" className="fill-gray-400">★</text>
            })}
        </svg>
    );
};