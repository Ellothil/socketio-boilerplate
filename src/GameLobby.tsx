import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { PlayerSelection } from "./PlayerSelection";
import { RoomList } from "./RoomList";
import { GameRoom } from "./GameRoom";
import { GameSuccess } from "./GameSuccess";

export function GameLobby() {
  const [currentPlayerId, setCurrentPlayerId] = useState<Id<"players"> | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<Id<"rooms"> | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const releasePlayer = useMutation(api.players.releasePlayer);
  const heartbeat = useMutation(api.players.heartbeat);

  const roomDetails = useQuery(
    api.rooms.getRoomDetails,
    currentRoomId ? { roomId: currentRoomId } : "skip"
  );

  // Send heartbeat every 30 seconds to keep player active
  useEffect(() => {
    if (!currentPlayerId || !sessionId) return;

    const interval = setInterval(() => {
      heartbeat({ playerId: currentPlayerId, sessionId });
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPlayerId, sessionId, heartbeat]);

  // Release player when component unmounts or page is closed
  useEffect(() => {
    if (!currentPlayerId || !sessionId) return;

    const handleBeforeUnload = () => {
      releasePlayer({ playerId: currentPlayerId, sessionId });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      releasePlayer({ playerId: currentPlayerId, sessionId });
    };
  }, [currentPlayerId, sessionId, releasePlayer]);

  // Check if game has started
  useEffect(() => {
    if (roomDetails?.isGameStarted) {
      setGameStarted(true);
    }
  }, [roomDetails?.isGameStarted]);

  const handlePlayerSelected = (playerId: Id<"players">, newSessionId: string) => {
    setCurrentPlayerId(playerId);
    setSessionId(newSessionId);
  };

  const handleBackToPlayerSelection = () => {
    if (currentPlayerId && sessionId) {
      releasePlayer({ playerId: currentPlayerId, sessionId });
    }
    setCurrentPlayerId(null);
    setSessionId(null);
  };

  if (gameStarted) {
    return <GameSuccess onBackToLobby={() => {
      setGameStarted(false);
      setCurrentRoomId(null);
    }} />;
  }

  if (currentRoomId && roomDetails) {
    return (
      <GameRoom
        roomId={currentRoomId}
        playerId={currentPlayerId!}
        sessionId={sessionId!}
        onLeaveRoom={() => setCurrentRoomId(null)}
      />
    );
  }

  if (!currentPlayerId || !sessionId) {
    return <PlayerSelection onPlayerSelected={handlePlayerSelected} />;
  }

  return (
    <RoomList
      playerId={currentPlayerId}
      sessionId={sessionId}
      onJoinRoom={setCurrentRoomId}
      onBackToPlayerSelection={handleBackToPlayerSelection}
    />
  );
}
