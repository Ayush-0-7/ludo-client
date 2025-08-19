import React from 'react';
import { COLOR_CLASSES } from '../config/constants';

export default function Lobby({ gameState, socket }) {
    const isHost = socket.id === gameState.hostId;

    const handleStartGame = () => {
        if (isHost && gameState.players.length >= 2) {
            socket.emit('startGame', { roomId: gameState.roomId });
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center">
            <h1 className="text-3xl font-bold mb-2">Lobby</h1>
            <p className="text-neutral-600 mb-4">Room Code:</p>
            <div className="bg-neutral-200 p-3 rounded-lg text-4xl font-mono tracking-widest mb-6">
                {gameState.roomId}
            </div>

            <h2 className="text-2xl font-semibold mb-4">Players ({gameState.players.length}/4)</h2>
            <div className="space-y-3 mb-8">
                {gameState.players.map(player => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-neutral-100 rounded-lg">
                        <span className={`w-6 h-6 rounded-full ${COLOR_CLASSES[player.color].bg}`}></span>
                        <span className="font-bold text-lg">{player.name}</span>
                        {player.id === gameState.hostId && <span className="text-sm font-semibold text-yellow-600 ml-auto">(Host)</span>}
                    </div>
                ))}
            </div>

            {isHost && (
                <button
                    onClick={handleStartGame}
                    disabled={gameState.players.length < 2}
                    className="w-full py-4 rounded-2xl bg-black text-white text-xl font-bold shadow-lg hover:bg-neutral-800 transition disabled:bg-neutral-400 disabled:cursor-not-allowed"
                >
                    {gameState.players.length < 2 ? 'Waiting for more players...' : 'Start Game'}
                </button>
            )}
            {!isHost && <p className="text-lg font-medium">Waiting for the host to start the game...</p>}
        </div>
    );
}