import { socket } from "../socket";
import { useStore } from "../store";

export const Room = () => {
  const { room, setReady } = useStore();
  const me = room?.players.find((p) => p.id === socket.id);

  if (!(room && me)) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Room ID: {room.id}</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3>Players ({room.players.length}/8)</h3>
          <ul>
            {room.players.map((player) => (
              <li
                key={player.id}
                style={{ color: player.isReady ? "green" : "red" }}
              >
                {player.name}
                {player.id === room.hostId && " (Host) 👑"}
                {player.id === socket.id && " (You)"}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setReady(!me.isReady)}
          style={{ alignSelf: "center", padding: "10px 20px" }}
          type="button"
        >
          {me.isReady ? "Set Not Ready" : "Set Ready"}
        </button>
      </div>
    </div>
  );
};
