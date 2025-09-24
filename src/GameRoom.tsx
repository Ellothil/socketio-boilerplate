import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface GameRoomProps {
  roomId: Id<"rooms">;
  playerId: Id<"players">;
  sessionId: string;
  onLeaveRoom: () => void;
}

export function GameRoom({ roomId, playerId, sessionId, onLeaveRoom }: GameRoomProps) {
  const roomDetails = useQuery(api.rooms.getRoomDetails, { roomId });
  const toggleReady = useMutation(api.rooms.toggleReady);
  const startGame = useMutation(api.rooms.startGame);
  const leaveRoom = useMutation(api.rooms.leaveRoom);

  if (!roomDetails) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentPlayer = roomDetails.players.find(p => p._id === playerId);
  const allPlayersReady = roomDetails.players.length > 0 && roomDetails.players.every(p => p.isReady);

  const handleToggleReady = async () => {
    try {
      await toggleReady({ roomId, playerId });
      toast.success(currentPlayer?.isReady ? "Marked as not ready" : "Marked as ready");
    } catch (error: any) {
      toast.error(error.message || "Failed to update ready status");
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame({ roomId });
      toast.success("Game started!");
    } catch (error: any) {
      toast.error(error.message || "Failed to start game");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom({ roomId, playerId });
      onLeaveRoom();
      toast.success("Left room");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave room");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{roomDetails.name}</h1>
          <p className="text-lg text-gray-600">
            Created by {roomDetails.creatorName} • {roomDetails.players.length} player{roomDetails.players.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
        >
          Leave Room
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Players List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Players in Room</h2>
          <div className="space-y-3">
            {roomDetails.players.map((player) => (
              <div
                key={player._id}
                className={`bg-white rounded-lg shadow-md p-4 flex items-center justify-between ${
                  player._id === playerId ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    player.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium">{player.name}</span>
                  {player._id === playerId && (
                    <span className="text-sm text-blue-600">(You)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    player.isReady 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Game Controls</h3>
            
            <button
              onClick={handleToggleReady}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors mb-4 ${
                currentPlayer?.isReady
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {currentPlayer?.isReady ? 'Mark Not Ready' : 'Mark Ready'}
            </button>

            <button
              onClick={handleStartGame}
              disabled={!allPlayersReady}
              className="w-full py-3 px-4 rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Start Game
            </button>

            {!allPlayersReady && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                All players must be ready to start the game
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Room Status</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Players: {roomDetails.players.length}</p>
              <p>Ready: {roomDetails.players.filter(p => p.isReady).length}</p>
              <p>Status: {allPlayersReady ? 'Ready to start' : 'Waiting for players'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
