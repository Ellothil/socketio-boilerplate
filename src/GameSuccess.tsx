interface GameSuccessProps {
  onBackToLobby: () => void;
}

export function GameSuccess({ onBackToLobby }: GameSuccessProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-6xl font-bold text-green-600 mb-4">SUCCESS</h1>
          <p className="text-xl text-gray-600">
            The game has started successfully!
          </p>
        </div>
        
        <button
          onClick={onBackToLobby}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}
