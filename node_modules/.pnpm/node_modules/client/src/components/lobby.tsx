import { useState } from 'react';
import { useStore } from '../store';

export const Lobby = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const { createRoom, joinRoom } = useStore();

  const handleCreate = () => {
    if (name) createRoom(name);
  };

  const handleJoin = () => {
    if (name && roomId) joinRoom(roomId, name);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
      <h2>Multiplayer Starter</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <button onClick={handleCreate} disabled={!name}>
          Create Room
        </button>
      </div>
      <hr />
      <div>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoin} disabled={!name || !roomId}>
          Join Room
        </button>
      </div>
    </div>
  );
};