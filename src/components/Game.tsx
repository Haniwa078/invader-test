import React, { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { Rocket, Alien2 } from 'lucide-react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 1;

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bullet extends GameObject {}

interface Enemy extends GameObject {
  direction: number;
}

function Game() {
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60, width: 50, height: 50 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  // キー入力の処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => new Set(prev).add(e.key));
    const handleKeyUp = (e: KeyboardEvent) => {
      const newKeys = new Set(keys);
      newKeys.delete(e.key);
      setKeys(newKeys);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 敵の初期配置
  useEffect(() => {
    const initialEnemies: Enemy[] = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        initialEnemies.push({
          x: 100 + i * 120,
          y: 50 + j * 80,
          width: 40,
          height: 40,
          direction: 1
        });
      }
    }
    setEnemies(initialEnemies);
  }, []);

  // 当たり判定のチェック
  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  // メインゲームループ
  useGameLoop(() => {
    if (gameOver) return;

    // プレイヤーの移動
    if (keys.has('ArrowLeft')) {
      setPlayer(prev => ({
        ...prev,
        x: Math.max(0, prev.x - PLAYER_SPEED)
      }));
    }
    if (keys.has('ArrowRight')) {
      setPlayer(prev => ({
        ...prev,
        x: Math.min(GAME_WIDTH - prev.width, prev.x + PLAYER_SPEED)
      }));
    }
    if (keys.has(' ')) {
      setBullets(prev => {
        if (prev.length < 3) {
          return [...prev, {
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10
          }];
        }
        return prev;
      });
      keys.delete(' ');
    }

    // 弾の移動
    setBullets(prev => 
      prev
        .map(bullet => ({ ...bullet, y: bullet.y - BULLET_SPEED }))
        .filter(bullet => bullet.y > 0)
    );

    // 敵の移動
    setEnemies(prev => {
      const newEnemies = prev.map(enemy => {
        let newX = enemy.x + ENEMY_SPEED * enemy.direction;
        let newDirection = enemy.direction;
        
        if (newX <= 0 || newX >= GAME_WIDTH - enemy.width) {
          newDirection *= -1;
          newX = enemy.x;
        }
        
        return {
          ...enemy,
          x: newX,
          direction: newDirection
        };
      });
      return newEnemies;
    });

    // 衝突判定
    bullets.forEach(bullet => {
      enemies.forEach(enemy => {
        if (checkCollision(bullet, enemy)) {
          setBullets(prev => prev.filter(b => b !== bullet));
          setEnemies(prev => prev.filter(e => e !== enemy));
          setScore(prev => prev + 100);
        }
      });
    });

    // ゲームオーバー判定
    enemies.forEach(enemy => {
      if (enemy.y + enemy.height >= player.y) {
        setGameOver(true);
      }
    });
  });

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    setBullets([]);
    setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60, width: 50, height: 50 });
    const initialEnemies: Enemy[] = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        initialEnemies.push({
          x: 100 + i * 120,
          y: 50 + j * 80,
          width: 40,
          height: 40,
          direction: 1
        });
      }
    }
    setEnemies(initialEnemies);
  };

  return (
    <div className="relative" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500 bg-black">
        {/* スコア表示 */}
        <div className="absolute top-4 left-4 text-green-500 text-xl">
          スコア: {score}
        </div>

        {/* プレイヤー */}
        <div className="absolute text-green-500" style={{ 
          left: player.x, 
          top: player.y,
          transform: 'translateX(-50%)'
        }}>
          <Rocket size={50} />
        </div>

        {/* 弾 */}
        {bullets.map((bullet, index) => (
          <div
            key={index}
            className="absolute bg-green-500"
            style={{
              left: bullet.x,
              top: bullet.y,
              width: bullet.width,
              height: bullet.height
            }}
          />
        ))}

        {/* 敵 */}
        {enemies.map((enemy, index) => (
          <div
            key={index}
            className="absolute text-red-500"
            style={{
              left: enemy.x,
              top: enemy.y,
              transform: 'translateX(-50%)'
            }}
          >
            <Alien2 size={40} />
          </div>
        ))}

        {/* ゲームオーバー画面 */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
            <h2 className="text-4xl text-red-500 mb-4">ゲームオーバー</h2>
            <p className="text-2xl text-green-500 mb-4">最終スコア: {score}</p>
            <button
              onClick={handleRestart}
              className="px-6 py-2 bg-green-500 text-black rounded hover:bg-green-400"
            >
              リトライ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;