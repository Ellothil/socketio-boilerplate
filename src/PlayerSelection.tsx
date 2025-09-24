import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface PlayerSelectionProps {
  onPlayerSelected: (playerId: Id<"players">, sessionId: string) => void;
}

// Generate a unique session ID for this browser tab
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function PlayerSelection({ onPlayerSelected }: PlayerSelectionProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [sessionId] = useState(() => generateSessionId());
  const players = useQuery(api.players.listPlayers) || [];
  const createOrSelectPlayer = useMutation(api.players.createOrSelectPlayer);

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    try {
      const playerId = await createOrSelectPlayer({ 
        name: newPlayerName.trim(),
        sessionId 
      });
      onPlayerSelected(playerId, sessionId);
      toast.success(`Welcome, ${newPlayerName}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create player");
    }
  };

  const handleSelectPlayer = async (player: any) => {
    try {
      const playerId = await createOrSelectPlayer({ 
        name: player.name,
        sessionId 
      });
      onPlayerSelected(playerId, sessionId);
      toast.success(`Welcome back, ${player.name}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to select player");
    }
  };

  const getPlayerStatus = (player: any) => {
    if (player.isOnline && player.sessionId) {
      return { text: 'In Use', color: 'bg-red-100 text-red-800' };
    } else if (player.isOnline) {
      return { text: 'Online', color: 'bg-green-100 text-green-800' };
    } else {
      return { text: 'Available', color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Player</h1>
        <p className="text-lg text-gray-600">Select an available player or create a new one</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create New Player */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Player</h2>
          <form onSubmit={handleCreatePlayer} className="space-y-4">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Player
            </button>
          </form>
        </div>

        {/* Select Existing Player */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Existing Player</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No players yet</p>
            ) : (
              players.map((player) => {
                const status = getPlayerStatus(player);
                const isInUse = player.isOnline && player.sessionId;
                
                return (
                  <button
                    key={player._id}
                    onClick={() => handleSelectPlayer(player)}
                    disabled={!!isInUse}
                    className={`w-full text-left p-3 border border-gray-200 rounded-md transition-colors flex items-center justify-between ${
                      isInUse 
                        ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <span className="font-medium">{player.name}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
