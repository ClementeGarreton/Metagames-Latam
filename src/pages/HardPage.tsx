import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExternalLink, X, Play, RotateCcw, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HardPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Modals
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showFreeLifeModal, setShowFreeLifeModal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [finalScore, setFinalScore] = useState(0);

  const gameStateRef = useRef({
    dino: { x: 50, y: 150, radius: 15, dy: 0, gravity: 0.3, jump: -12 },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number }>,
    speed: 3,
    lastObstacleTime: 0,
    nextObstacleDelay: 2000,
    animationId: 0,
    gameStartTime: 0,
    lastSpeedIncreaseTime: 0,
    lastBonusCheck: 0
  });

  // Check for bonus tokens from backend
  useEffect(() => {
    const checkBonusToken = async () => {
      const now = Date.now();
      // Only check once every 10 seconds minimum
      if (now - gameStateRef.current.lastBonusCheck < 10000) return;
      
      try {
        const response = await fetch('https://clementeurzua.pythonanywhere.com/api/check_bonus_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        
        if (response.ok) {
          const data = await response.json();
          gameStateRef.current.lastBonusCheck = now;
          
          if (data.token_type === 'free_life') {
            setShowFreeLifeModal(true);
            setIsPaused(true);
          }
        }
      } catch (error) {
        console.error('Error checking bonus token:', error);
      }
    };

    if (gameStarted && !gameOver && email && score > 0 && score % 50 === 0) {
      checkBonusToken();
    }
  }, [score, gameStarted, gameOver, email]);

  const handleFreeLifeClaim = () => {
    setLives(prev => prev + 1);
    setShowFreeLifeModal(false);
    setIsPaused(false);
  };

  // Anti-cheat
  useEffect(() => {
    const checkAccess = () => {
      const wasAlreadyLoaded = sessionStorage.getItem('hardmode-loaded');
      const refreshFlag = sessionStorage.getItem('hardmode-refresh');
      
      if (refreshFlag === 'true') {
        sessionStorage.removeItem('hardmode-refresh');
        sessionStorage.removeItem('hardmode-loaded');
        navigate('/');
        return;
      }
      
      sessionStorage.setItem('hardmode-loaded', 'true');
      setTimeout(() => {
        sessionStorage.removeItem('hardmode-refresh');
      }, 1000);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (event.type === 'beforeunload') {
        sessionStorage.setItem('hardmode-refresh', 'true');
      }
    };

    window.history.replaceState(null, '', '/');
    checkAccess();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  const handleEmailSubmit = () => {
    if (email.trim()) {
      setShowEmailModal(false);
    } else {
      alert('Por favor, ingresa un email válido.');
    }
  };

  const drawDino = useCallback((ctx: CanvasRenderingContext2D) => {
    const { dino } = gameStateRef.current;
    ctx.fillStyle = '#ef4444';
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
  }, []);

  const createObstacle = useCallback(() => {
    const { obstacles } = gameStateRef.current;
    const currentTime = Date.now();
    const timeSinceLast = currentTime - gameStateRef.current.lastObstacleTime;

    if (timeSinceLast >= gameStateRef.current.nextObstacleDelay) {
      const lastObstacle = obstacles[obstacles.length - 1];
      const hasDistance = !lastObstacle || 800 - lastObstacle.x > 180;

      if (hasDistance) {
        const height = Math.random() * 40 + 30;
        obstacles.push({ x: 800, y: 160 - height, width: 25, height });
        gameStateRef.current.lastObstacleTime = currentTime;
        
        // Random delay between 2, 3, and 4 seconds
        const delays = [2000, 3000, 4000];
        gameStateRef.current.nextObstacleDelay = delays[Math.floor(Math.random() * delays.length)];
      }
    }
  }, []);

  const updateSpeed = useCallback(() => {
    const currentTime = Date.now();
    const maxSpeed = 10;

    if (currentTime - gameStateRef.current.lastSpeedIncreaseTime >= 5000 && gameStateRef.current.speed < maxSpeed) {
      gameStateRef.current.speed += 0.1;
      gameStateRef.current.lastSpeedIncreaseTime = currentTime;
      if (gameStateRef.current.speed > maxSpeed) gameStateRef.current.speed = maxSpeed;
    }
  }, []);

  const updateObstacles = useCallback((ctx: CanvasRenderingContext2D) => {
    const { obstacles, speed } = gameStateRef.current;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.x -= speed;

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      if (obstacle.x < -obstacle.width) {
        obstacles.splice(i, 1);
        setScore(prev => prev + 1);
      }
    }
  }, []);

  const detectCollision = useCallback(() => {
    const { dino, obstacles } = gameStateRef.current;

    for (const obstacle of obstacles) {
      if (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.radius * 2 > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.radius * 2 > obstacle.y
      ) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setFinalScore(score);
            setShowGameOverModal(true);
            
            if (email) {
              fetch('https://clementeurzua.pythonanywhere.com/add_email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, score: score, mode: 'hard' })
              }).catch(error => console.error('Error sending score:', error));
            }
          }
          return newLives;
        });
        
        // Remove the obstacle that caused collision
        const index = obstacles.indexOf(obstacle);
        if (index > -1) obstacles.splice(index, 1);
        return true;
      }
    }
    return false;
  }, [score, email]);

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
    detectCollision();

    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, drawDino, createObstacle, updateObstacles, detectCollision, updateSpeed]);

  const startGame = useCallback(() => {
    const currentTime = Date.now();
    setGameStarted(true);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setLives(1);

    gameStateRef.current = {
      dino: { x: 50, y: 150, radius: 15, dy: 0, gravity: 0.3, jump: -12 },
      obstacles: [],
      speed: 3,
      lastObstacleTime: currentTime,
      nextObstacleDelay: 2000,
      animationId: 0,
      gameStartTime: currentTime,
      lastSpeedIncreaseTime: currentTime,
      lastBonusCheck: 0
    };

    gameLoop();
  }, [gameLoop]);

  const resetGame = useCallback(() => {
    if (gameStateRef.current.animationId) cancelAnimationFrame(gameStateRef.current.animationId);
    setGameStarted(false);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setLives(1);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Dino Run - Modo Difícil
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-4">
              Obstáculos impredecibles • Velocidad máxima 10x
            </p>
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-red-400 font-semibold mb-2">🔥 Modo Difícil:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• 1 vida inicial</li>
                <li>• Velocidad máxima: 10x</li>
                <li>• Obstáculos aparecen de forma impredecible</li>
                <li>• Compra vidas extra con power-ups</li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="border-2 border-red-500/50 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />

                <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-lg">
                  <span className="font-bold text-lg text-red-500">
                    Score: {score}
                  </span>
                </div>

                <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
                  <span className="font-bold text-sm text-orange-400">
                    ❤️ Vidas: {lives} | Velocidad: {gameStateRef.current.speed.toFixed(1)}x
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!gameStarted ? (
                  <button onClick={startGame} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg flex items-center space-x-2 px-6 py-3 transition-all duration-300">
                    <Play className="w-5 h-5" />
                    <span>Iniciar Juego</span>
                  </button>
                ) : (
                  <>
                    <button onClick={pauseGame} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg flex items-center space-x-2 px-6 py-3 transition-all duration-300" disabled={gameOver}>
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

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              Ingresa tu Email
            </h3>
            <p className="text-gray-300 mb-6">
              Para recibir tu premio en caso de ganar
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none mb-6"
            />
            <button
              onClick={handleEmailSubmit}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg w-full py-3 transition-all duration-300"
            >
              Guardar y Jugar
            </button>
          </div>
        </div>
      )}

      {/* Free Life Modal */}
      {showFreeLifeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-900 to-black border border-green-500/50 rounded-2xl p-8 max-w-md w-full text-center">
            <h3 className="text-3xl font-bold text-green-400 mb-6">
              🎁 ¡Vida Extra Gratis!
            </h3>
            <p className="text-gray-300 mb-6 text-lg">
              ¡Eres afortunado! Has ganado una vida extra sin costo
            </p>
            <button
              onClick={handleFreeLifeClaim}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg w-full py-3 transition-all duration-300 font-bold"
            >
              ¡Reclamar Vida! ❤️
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center relative">
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
              href="https://mpago.la/1nHWMxc"
              className="block mb-6 group"
            >
              <img
                src="/game6.jpg"
                alt="Power-up"
                className="w-full rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            </a>
            
            <p className="text-xl text-white mb-4">
              Tu puntuación: <span className="text-red-500 font-bold">{finalScore}</span>
            </p>
            
            <p className="text-gray-300 mb-4">
              ¡Gran esfuerzo en el modo difícil!
            </p>
            
            <p className="text-gray-300 mb-6">
              Compra una vida extra para continuar (Click en la imagen)
            </p>
            
            <a
              href="https://mpago.la/1nHWMxc"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg inline-flex items-center space-x-2 px-6 py-3 transition-all duration-300"
            >
              <span>Comprar Vida Extra</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default HardPage;
