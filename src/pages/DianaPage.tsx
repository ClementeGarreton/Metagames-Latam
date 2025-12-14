// src/components/PerfectTimingGame.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Target } from 'lucide-react';

interface PerfectTimingGameProps {
  onGameOver?: (score: number) => void;
}

const DianaPage: React.FC<PerfectTimingGameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lastHitAccuracy, setLastHitAccuracy] = useState<number | null>(null);

  const gameStateRef = useRef({
    position: 0,
    direction: 1,
    speed: 2,
    animationId: 0,
    targetCenter: 400,
    perfectZone: 20,
    goodZone: 40
  });

  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const { position, targetCenter, perfectZone, goodZone } = gameStateRef.current;

    // Limpiar canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar barra horizontal
    const barY = canvas.height / 2 - 5;
    const barHeight = 10;
    
    // Barra base
    ctx.fillStyle = '#374151';
    ctx.fillRect(50, barY, canvas.width - 100, barHeight);

    // Zona perfecta (verde)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.fillRect(targetCenter - perfectZone, barY - 10, perfectZone * 2, barHeight + 20);
    
    // Zona buena (amarillo)
    ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
    ctx.fillRect(targetCenter - goodZone, barY - 5, goodZone * 2, barHeight + 10);

    // Línea central
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetCenter, barY - 20);
    ctx.lineTo(targetCenter, barY + barHeight + 20);
    ctx.stroke();

    // Punto oscilante
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(position, canvas.height / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Borde del punto
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Indicadores en los extremos
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(45, barY - 5, 5, barHeight + 10);
    ctx.fillRect(canvas.width - 50, barY - 5, 5, barHeight + 10);

  }, []);

  const gameLoop = useCallback(() => {
    if (!canvasRef.current || !gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { position, direction, speed } = gameStateRef.current;

    // Actualizar posición
    let newPosition = position + (direction * speed);
    let newDirection = direction;

    // Rebotar en los bordes
    if (newPosition <= 50 || newPosition >= canvas.width - 50) {
      newDirection = -direction;
      newPosition = position + (newDirection * speed);
    }

    gameStateRef.current.position = newPosition;
    gameStateRef.current.direction = newDirection;

    drawGame(ctx);
    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [gameStarted, drawGame]);

  const checkAccuracy = useCallback(() => {
    const { position, targetCenter, perfectZone, goodZone } = gameStateRef.current;
    const distance = Math.abs(position - targetCenter);

    let points = 0;
    let accuracy = 0;

    if (distance <= perfectZone) {
      points = 10;
      accuracy = 100 - (distance / perfectZone) * 10;
    } else if (distance <= goodZone) {
      points = 5;
      accuracy = 90 - ((distance - perfectZone) / (goodZone - perfectZone)) * 40;
    } else {
      points = 0;
      accuracy = 0;
    }

    setLastHitAccuracy(Math.round(accuracy));
    setScore(prev => prev + points);
    setAttempts(prev => prev + 1);

    // Aumentar velocidad progresivamente
    if ((attempts + 1) % 5 === 0) {
      gameStateRef.current.speed = Math.min(gameStateRef.current.speed + 0.3, 6);
    }

    return points;
  }, [attempts]);

  const handleHit = useCallback(() => {
    if (!gameStarted) return;
    checkAccuracy();
  }, [gameStarted, checkAccuracy]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setAttempts(0);
    setLastHitAccuracy(null);
    
    gameStateRef.current = {
      position: 400,
      direction: 1,
      speed: 2,
      animationId: 0,
      targetCenter: 400,
      perfectZone: 20,
      goodZone: 40
    };

    gameLoop();
  }, [gameLoop]);

  const stopGame = useCallback(() => {
    if (gameStateRef.current.animationId) {
      cancelAnimationFrame(gameStateRef.current.animationId);
    }
    setGameStarted(false);
    
    if (score > bestScore) {
      setBestScore(score);
    }

    if (onGameOver) {
      onGameOver(score);
    }
  }, [score, bestScore, onGameOver]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (!gameStarted) {
          startGame();
        } else {
          handleHit();
        }
      }
    };

    const handleTouch = (event: TouchEvent) => {
      event.preventDefault();
      if (!gameStarted) {
        startGame();
      } else {
        handleHit();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('touchstart', handleTouch);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchstart', handleTouch);
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [gameStarted, startGame, handleHit]);

  useEffect(() => {
    if (gameStarted) gameLoop();
  }, [gameStarted, gameLoop]);

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return 'text-gray-400';
    if (accuracy >= 90) return 'text-green-500';
    if (accuracy >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyMessage = (accuracy: number | null) => {
    if (accuracy === null) return '';
    if (accuracy >= 95) return '¡PERFECTO! 🎯';
    if (accuracy >= 85) return '¡Excelente! ⭐';
    if (accuracy >= 70) return 'Muy bien 👍';
    if (accuracy >= 50) return 'Bien 👌';
    return 'Fallaste 😅';
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto">
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={150}
          className="border-2 border-purple-500/50 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Stats Display */}
        <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-purple-400 font-bold text-sm">Puntos: </span>
              <span className="text-white font-bold text-lg">{score}</span>
            </div>
            <div>
              <span className="text-blue-400 font-bold text-sm">Intentos: </span>
              <span className="text-white font-bold text-lg">{attempts}</span>
            </div>
          </div>
        </div>

        {/* Best Score */}
        {bestScore > 0 && (
          <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
            <span className="text-yellow-400 font-bold text-sm">Mejor: </span>
            <span className="text-white font-bold text-lg">{bestScore}</span>
          </div>
        )}

        {/* Last Hit Accuracy */}
        {lastHitAccuracy !== null && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg">
            <div className="text-center">
              <span className={`font-bold text-lg ${getAccuracyColor(lastHitAccuracy)}`}>
                {lastHitAccuracy}% 
              </span>
              <span className="ml-2 text-white text-sm">{getAccuracyMessage(lastHitAccuracy)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!gameStarted && (
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-lg p-4 text-center">
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-gray-300 text-sm">
            Presiona ESPACIO o toca la pantalla cuando el punto esté en el centro
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs">
            <span className="text-green-400">🎯 Perfecto = 10 pts</span>
            <span className="text-yellow-400">⭐ Bueno = 5 pts</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {!gameStarted ? (
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg flex items-center space-x-2 px-6 py-3 transition-all duration-300 font-semibold"
          >
            <Play className="w-5 h-5" />
            <span>Iniciar Juego</span>
          </button>
        ) : (
          <button
            onClick={stopGame}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-semibold"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Terminar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DianaPage;