import React from 'react';
import Game from './components/Game';

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-green-500 mb-8">スペースインベーダー</h1>
      <Game />
    </div>
  );
}

export default App;