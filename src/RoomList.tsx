import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface RoomListProps {
  playerId: Id<"players">;
  sessionId: string;
  onJoinRoom: (roomId: Id<"rooms">) => void;
  onBackToPlayerSelection: () => void;
}

export function RoomList({ playerId, sessionId, onJoinRoom, onBackToPlayerSelection }: RoomListProps) {
  const [newRoomName, setNewRoomName] = useState("");
  const rooms = useQuery(api.rooms.listRooms) || [];
  const createRoom = useMutation(api.rooms.createRoom);
  const joinRoom = useMutation(api.rooms.joinRoom);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const roomId = await createRoom({ 
        name: newRoomName.trim(), 
        createdBy: playerId 
      });
      onJoinRoom(roomId);
      toast.success(`Room "${newRoomName}" created!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create room");
    }
  };

  const handleJoinRoom = async (roomId: Id<"rooms">) => {
    try {
      await joinRoom({ roomId, playerId });
      onJoinRoom(roomId);
      toast.success("Joined room!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join room");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Game Rooms</h1>
          <p className="text-lg text-gray-600">Join an existing room or create a new one</p>
        </div>
        <button
          onClick={onBackToPlayerSelection}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Player Selection
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create New Room */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Create Room
            </button>
          </form>
        </div>

        {/* Available Rooms */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
          <div className="space-y-3">
            {rooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No rooms available. Create the first one!</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <p className="text-gray-600">
                      Created by {room.creatorName} • {room.playerCount} player{room.playerCount !== 1 ? 's' : ''}
                    </p>
                    {room.isGameStarted && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                        Game in progress
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room._id)}
                    disabled={room.isGameStarted}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {room.isGameStarted ? 'In Progress' : 'Join'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
