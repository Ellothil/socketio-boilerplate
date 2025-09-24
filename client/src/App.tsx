import { Lobby } from "./components/lobby";
import { Room } from "./components/room";
import { useStore } from "./store";

function App() {
  const { room } = useStore();

  return <div className="App">{room ? <Room /> : <Lobby />}</div>;
}

export default App;
