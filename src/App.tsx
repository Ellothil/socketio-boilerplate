import { Toaster } from "sonner";
import { GameLobby } from "./GameLobby";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-gray-900">Game Lobby</h2>
      </header>
      <main className="flex-1 p-8">
        <GameLobby />
      </main>
      <Toaster />
    </div>
  );
}
