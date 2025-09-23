import { useStore } from './store';
import { Lobby } from './components/lobby';
import { Room } from './components/room';
import './App.css';

function App() {
  const { room } = useStore();

  return (
    <div className="App">
      {room ? <Room /> : <Lobby />}
    </div>
  );
}

export default App;