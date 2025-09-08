import React, { useState } from "react";

// Receive userId as a prop
export default function OnlineSetup({ socket, userId }) {
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleCreateGame = () => {
    if (playerName.trim()) {
      // Include userId in the payload
      socket.emit("createGame", { playerName, userId });
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && roomId.trim()) {
      // Include userId in the payload
      socket.emit("joinGame", {
        roomId: roomId.toUpperCase(),
        playerName,
        userId,
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center">
      <h1 className="text-4xl font-bold mb-2">Ludo Online</h1>
      <p className="text-neutral-600 mb-6">
        Create a game or join with a room code.
      </p>

      <div className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Enter Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full border-2 border-neutral-300 rounded-xl px-4 py-3 text-lg focus:border-yellow-500 focus:ring-yellow-500 transition"
        />
        <button
          onClick={handleCreateGame}
          disabled={!playerName.trim()}
          className="w-full py-3 rounded-xl bg-black text-white text-xl font-bold shadow-lg hover:bg-neutral-800 transition disabled:bg-neutral-400"
        >
          Create New Game
        </button>
      </div>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-400"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-400"></div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full border-2 border-neutral-300 rounded-xl px-4 py-3 text-lg focus:border-yellow-500 focus:ring-yellow-500 transition"
          maxLength="6"
          autoCapitalize="characters"
        />
        <button
          onClick={handleJoinGame}
          disabled={!playerName.trim() || !roomId.trim()}
          className="w-full py-3 rounded-xl bg-yellow-400 text-black text-xl font-bold shadow-lg hover:bg-yellow-500 transition disabled:bg-yellow-200"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}
