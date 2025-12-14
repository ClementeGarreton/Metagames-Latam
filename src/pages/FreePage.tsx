import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExternalLink, X, Play, RotateCcw, Pause, Settings } from 'lucide-react';

const FreePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard');
  
  // Modals
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const gameStateRef = useRef({
    dino: { x: 50, y: 150, radius: 15, dy: 0, gravity: 0.3, jump: -12 },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number }>,
    speed: 3,
    lastObstacleTime: 0,
    nextObstacleDelay: 2000,
    animationId: 0,
    gameStartTime: 0,
    lastSpeedIncreaseTime: 0
  });

  const drawDino = useCallback((ctx: CanvasRenderingContext2D) => {
    const { dino } = gameStateRef.current;
    const color = difficulty === 'easy' ? '#22c55e' : '#ef4444';
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(dino.x + dino.radius, dino.y + dino.radius, dino.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(dino.x + dino.radius + 5, dino.y + dino.radius - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(dino.x + dino.radius + 6, dino.y + dino.radius - 5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }, [difficulty]);

  const createObstacle = useCallback(() => {
    const { obstacles } = gameStateRef.current;
    const currentTime = Date.now();

    if (difficulty === 'easy') {
      // Spawn every 3 seconds exactly
      const timeSinceLast = currentTime - gameStateRef.current.lastObstacleTime;
      if (timeSinceLast >= 3000) {
        const lastObstacle = obstacles[obstacles.length - 1];
        const hasDistance = !lastObstacle || 800 - lastObstacle.x > 180;

        if (hasDistance) {
          const height = Math.random() * 40 + 30;
          obstacles.push({ x: 800, y: 160 - height, width: 25, height });
          gameStateRef.current.lastObstacleTime = currentTime;
        }
      }
    } else {
      // Random delays between 2, 3, and 4 seconds
      const timeSinceLast = currentTime - gameStateRef.current.lastObstacleTime;
      if (timeSinceLast >= gameStateRef.current.nextObstacleDelay) {
        const lastObstacle = obstacles[obstacles.length - 1];
        const hasDistance = !lastObstacle || 800 - lastObstacle.x > 180;

        if (hasDistance) {
          const height = Math.random() * 40 + 30;
          obstacles.push({ x: 800, y: 160 - height, width: 25, height });
          gameStateRef.current.lastObstacleTime = currentTime;
          
          // Set next random delay
          const delays = [2000, 3000, 4000];
          gameStateRef.current.nextObstacleDelay = delays[Math.floor(Math.random() * delays.length)];
        }
      }
    }
  }, [difficulty]);

  const updateSpeed = useCallback(() => {
    const currentTime = Date.now();
    const maxSpeed = difficulty === 'easy' ? 20 : 10;

    if (currentTime - gameStateRef.current.lastSpeedIncreaseTime >= 5000 && gameStateRef.current.speed < maxSpeed) {
      gameStateRef.current.speed += 0.1;
      gameStateRef.current.lastSpeedIncreaseTime = currentTime;
      if (gameStateRef.current.speed > maxSpeed) gameStateRef.current.speed = maxSpeed;
    }
  }, [difficulty]);

  const updateObstacles = useCallback((ctx: CanvasRenderingContext2D) => {
    const { obstacles, speed } = gameStateRef.current;
    const color = difficulty === 'easy' ? '#10b981' : '#f59e0b';

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.x -= speed;

      ctx.fillStyle = color;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      if (obstacle.x < -obstacle.width) {
        obstacles.splice(i, 1);
        setScore(prev => prev + 1);
      }
    }
  }, [difficulty]);

  const detectCollision = useCallback(() => {
    const { dino, obstacles } = gameStateRef.current;

    for (const obstacle of obstacles) {
      if (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.radius * 2 > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.radius * 2 > obstacle.y
      ) {
        setGameOver(true);
        setFinalScore(score);
        setShowGameOverModal(true);
        return true;
      }
    }
    return false;
  }, [score]);

  const jump = useCallback(() => {
    const { dino } = gameStateRef.current;
    if (dino.y === 150) dino.dy = dino.jump;
  }, []);

  const gameLoop = useCallback(() => {
    if (!canvasRef.current || gameOver || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { dino } = gameStateRef.current;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    dino.dy += dino.gravity;
    dino.y += dino.dy;
    if (dino.y > 150) {
      dino.y = 150;
      dino.dy = 0;
    }

    updateSpeed();
    drawDino(ctx);
    createObstacle();
    updateObstacles(ctx);

    if (!detectCollision()) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }
  }, [gameOver, isPaused, drawDino, createObstacle, updateObstacles, detectCollision, updateSpeed]);

  const startGame = useCallback(() => {
    const currentTime = Date.now();
    setGameStarted(true);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);

    gameStateRef.current = {
      dino: { x: 50, y: 150, radius: 15, dy: 0, gravity: 0.3, jump: -12 },
      obstacles: [],
      speed: 3,
      lastObstacleTime: currentTime,
      nextObstacleDelay: 2000,
      animationId: 0,
      gameStartTime: currentTime,
      lastSpeedIncreaseTime: currentTime
    };

    gameLoop();
  }, [gameLoop]);

  const resetGame = useCallback(() => {
    if (gameStateRef.current.animationId) cancelAnimationFrame(gameStateRef.current.animationId);
    setGameStarted(false);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const pauseGame = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (!gameStarted) {
          startGame();
        } else if (!gameOver) {
          jump();
        }
      }
    };

    const handleTouch = (event: TouchEvent) => {
      event.preventDefault();
      if (!gameStarted) startGame();
      else if (!gameOver) jump();
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('touchstart', handleTouch);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchstart', handleTouch);
      if (gameStateRef.current.animationId) cancelAnimationFrame(gameStateRef.current.animationId);
    };
  }, [gameStarted, gameOver, startGame, jump]);

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) gameLoop();
  }, [isPaused, gameLoop, gameStarted, gameOver]);

  const borderColor = difficulty === 'easy' ? 'border-green-500/50' : 'border-orange-500/50';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Dino Run - Modo Práctica
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-4">
              Practica gratis y elige tu dificultad
            </p>
            
            {/* Difficulty Selector */}
            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 font-semibold">Dificultad:</span>
              </div>
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    difficulty === 'easy'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Fácil (20x max)
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    difficulty === 'hard'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Difícil (10x max)
                </button>
              </div>
            </div>
            
            {/* Difficulty Description */}
            <div className="mt-4 max-w-2xl mx-auto">
              {difficulty === 'easy' ? (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-400 font-semibold mb-2">🎯 Modo Fácil:</p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Velocidad máxima: 20x</li>
                    <li>• Obstáculos cada 3 segundos (predecible)</li>
                    <li>• Perfecto para conseguir puntajes altos</li>
                    <li>• Botón de pausa disponible</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-lg p-4">
                  <p className="text-orange-400 font-semibold mb-2">🔥 Modo Difícil:</p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Velocidad máxima: 10x</li>
                    <li>• Obstáculos aleatorios (impredecible)</li>
                    <li>• Más técnico y desafiante</li>
                    <li>• Botón de pausa disponible</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className={`border-2 ${borderColor} rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl`}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />

                <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-lg">
                  <span className={`font-bold text-lg ${difficulty === 'easy' ? 'text-green-500' : 'text-orange-500'}`}>
                    Score: {score}
                  </span>
                </div>

                <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
                  <span className={`font-bold text-sm ${difficulty === 'easy' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {difficulty === 'easy' ? 'FÁCIL' : 'DIFÍCIL'} - Velocidad: {gameStateRef.current.speed.toFixed(1)}x
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!gameStarted ? (
                  <button onClick={startGame} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center space-x-2 px-6 py-3 transition-all duration-300">
                    <Play className="w-5 h-5" />
                    <span>Iniciar Juego</span>
                  </button>
                ) : (
                  <>
                    <button onClick={pauseGame} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center space-x-2 px-6 py-3 transition-all duration-300" disabled={gameOver}>
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                    </button>
                    <button onClick={resetGame} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                      <RotateCcw className="w-5 h-5" />
                      <span>Reiniciar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/50 rounded-2xl p-8 max-w-md w-full text-center relative">
            <button
              onClick={() => {
                setShowGameOverModal(false);
                window.location.href = '/';
              }}
              className="absolute top-4 right-4 text-red-500 hover:text-red-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-3xl font-bold text-red-500 mb-6">
              ¡Game Over!
            </h3>
            
            <a
              href="https://mpago.la/19BPFvn"
              className="block mb-6 group"
            >
              <img
                src="/game1.png"
                alt="Premium Mode"
                className="w-full rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            </a>
            
            <p className="text-xl text-white mb-4">
              Tu puntuación: <span className="text-purple-500 font-bold">{finalScore}</span>
            </p>
            
            <p className="text-gray-300 mb-4">
              ¿Listo para ganar como un campeón?
            </p>
            
            <p className="text-gray-300 mb-6">
              Juega en modo Premium para obtener premios reales
            </p>
            
            <a
              href="https://mpago.la/2kMbM58"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg inline-flex items-center space-x-2 px-6 py-3 transition-all duration-300"
            >
              <span>Ir a Premium</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreePage;