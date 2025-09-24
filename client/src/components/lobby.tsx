import { useState } from "react";
import { useStore } from "../store";

export const Lobby = () => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const { createRoom, joinRoom } = useStore();

  const handleCreate = () => {
    if (name) {
      createRoom(name);
    }
  };

  const handleJoin = () => {
    if (name && roomId) {
      joinRoom(roomId, name);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "300px",
        margin: "auto",
      }}
    >
      <h2>Multiplayer Starter</h2>
      <input
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        type="text"
        value={name}
      />
      <div>
        <button disabled={!name} onClick={handleCreate} type="button">
          Create Room
        </button>
      </div>
      <hr />
      <div>
        <input
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          type="text"
          value={roomId}
        />
        <button disabled={!(name && roomId)} onClick={handleJoin} type="button">
          Join Room
        </button>
      </div>
    </div>
  );
};
