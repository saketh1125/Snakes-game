import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Starfield Background ---
const StarfieldBackground = () => {
  const generateStars = (count: number) => {
    let shadow = '';
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      shadow += `${x}px ${y}px #FFF${i < count - 1 ? ', ' : ''}`;
    }
    return shadow;
  };

  const stars1 = useMemo(() => generateStars(700), []);
  const stars2 = useMemo(() => generateStars(200), []);
  const stars3 = useMemo(() => generateStars(100), []);

  return (
    <div className="stars-container">
      <div className="stars1" style={{ boxShadow: stars1 }}></div>
      <div className="stars2" style={{ boxShadow: stars2 }}></div>
      <div className="stars3" style={{ boxShadow: stars3 }}></div>
    </div>
  );
};

// --- Hero Section ---
const HeroSection = () => {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 overflow-hidden z-10 mt-8">
      <div className="relative w-full max-w-2xl flex justify-center items-center h-48">
        {/* Central Shape */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="absolute w-24 h-24 bg-[#16213E] neu-extruded rounded-3xl z-20 flex items-center justify-center border-glow-cyan"
        >
           <div className="w-16 h-16 rounded-full bg-[#1A1A2E] neu-inset"></div>
        </motion.div>

        {/* Orbiting Shapes & Lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 360) / 5;
          const radius = 120;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, x, y }}
                transition={{ duration: 1.5, delay: 0.5 + i * 0.1, type: "spring" }}
                className="absolute w-10 h-10 bg-[#16213E] neu-extruded rounded-full z-20 border-glow-pink"
                style={{
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`
                }}
              />
              <svg className="absolute w-full h-full top-0 left-0 z-10 pointer-events-none">
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${x}px)`}
                  y2={`calc(50% + ${y}px)`}
                  stroke="#00F5FF"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 1 + i * 0.1 }}
                />
              </svg>
            </React.Fragment>
          );
        })}
      </div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="font-display text-5xl md:text-7xl font-black text-[#E0E0E0] mt-8 tracking-wider text-glow-cyan text-center"
      >
        NEON ARCADE
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.7 }}
        className="text-[#8892A0] mt-4 text-lg md:text-xl tracking-widest uppercase"
      >
        Play. Listen. Vibe.
      </motion.p>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

// --- Snake Game ---
type Point = { x: number; y: number };
type GameState = 'start' | 'playing' | 'gameover';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [scoreScale, setScoreScale] = useState(1);
  const [isFlashing, setIsFlashing] = useState(false);

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const lastRenderTimeRef = useRef(0);
  const SNAKE_SPEED = 10;

  const generateFood = useCallback((snake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood(snakeRef.current);
    setScore(0);
    setGameState('playing');
    setIsFlashing(false);
  };

  const gameOver = () => {
    setGameState('gameover');
    if (score > highScore) setHighScore(score);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 900);
  };

  const updateGame = () => {
    const snake = [...snakeRef.current];
    directionRef.current = nextDirectionRef.current;
    const head = { ...snake[0] };

    head.x += directionRef.current.x;
    head.y += directionRef.current.y;

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver();
      return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => {
        const newScore = s + 10;
        setScoreScale(1.2);
        setTimeout(() => setScoreScale(1), 300);
        return newScore;
      });
      foodRef.current = generateFood(snake);
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
  };

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    ctx.fillStyle = '#FF006E';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF006E';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    snakeRef.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#39FF14';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#39FF14';
      
      const padding = 2;
      ctx.fillRect(
        segment.x * CELL_SIZE + padding,
        segment.y * CELL_SIZE + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2
      );
    });
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      if (gameState !== 'playing') return;

      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
      if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

      lastRenderTimeRef.current = currentTime;

      updateGame();
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawGame(ctx);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'start' || gameState === 'gameover') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawGame(ctx);
      }
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameState !== 'playing') {
        startGame();
        return;
      }

      if (gameState !== 'playing') return;

      const { x, y } = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleDPad = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing') {
      startGame();
      return;
    }
    const { x, y } = directionRef.current;
    switch (dir) {
      case 'up':
        if (y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
        break;
      case 'down':
        if (y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
        break;
      case 'left':
        if (x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
        break;
      case 'right':
        if (x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
        break;
    }
  };

  return (
    <div className="flex flex-col items-center z-10 w-full max-w-4xl mx-auto px-4 pb-48">
      {/* Score Board */}
      <div className="flex justify-between w-full max-w-[400px] mb-8 gap-4">
        <div className="flex-1 bg-[#16213E] neu-inset rounded-2xl p-4 flex flex-col items-center justify-center">
          <span className="text-[#8892A0] text-xs uppercase tracking-widest font-bold mb-1">Score</span>
          <motion.span 
            animate={{ scale: scoreScale }}
            className="font-display text-3xl md:text-4xl text-[#39FF14] text-glow-green"
          >
            {score.toString().padStart(3, '0')}
          </motion.span>
        </div>
        <div className="flex-1 bg-[#16213E] neu-inset rounded-2xl p-4 flex flex-col items-center justify-center">
          <span className="text-[#8892A0] text-xs uppercase tracking-widest font-bold mb-1">High Score</span>
          <span className="font-display text-3xl md:text-4xl text-[#00F5FF] text-glow-cyan">
            {highScore.toString().padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Game Canvas */}
      <div 
        className={cn(
          "relative bg-[#16213E] neu-inset-deep rounded-2xl p-2 md:p-4 overflow-hidden transition-all duration-300",
          isFlashing ? "border-glow-pink" : "border-glow-cyan"
        )}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-[#0D0D0D] rounded-xl w-full max-w-[400px] aspect-square block cursor-pointer"
          onClick={() => gameState !== 'playing' && startGame()}
        />

        {/* Overlays */}
        {gameState === 'start' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl pointer-events-none">
            <div className="text-center">
              <p className="font-display text-[#00F5FF] text-glow-cyan text-xl md:text-2xl mb-2 animate-pulse">PRESS SPACE</p>
              <p className="text-[#8892A0] text-sm">or tap to start</p>
            </div>
          </div>
        )}
        
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl pointer-events-none">
            <div className="text-center">
              <p className="font-display text-[#FF006E] text-glow-pink text-3xl md:text-4xl mb-4">GAME OVER</p>
              <p className="font-display text-[#39FF14] text-glow-green text-xl mb-4">SCORE: {score}</p>
              <p className="text-[#8892A0] text-sm animate-pulse">Tap or press Space to restart</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile D-Pad */}
      <div className="mt-8 grid grid-cols-3 gap-2 md:hidden w-48">
        <div />
        <button onClick={() => handleDPad('up')} className="bg-[#16213E] neu-extruded rounded-2xl p-4 flex items-center justify-center text-[#00F5FF] active:text-[#FF006E]"><ArrowUp size={24} /></button>
        <div />
        <button onClick={() => handleDPad('left')} className="bg-[#16213E] neu-extruded rounded-2xl p-4 flex items-center justify-center text-[#00F5FF] active:text-[#FF006E]"><ArrowLeft size={24} /></button>
        <button onClick={() => handleDPad('down')} className="bg-[#16213E] neu-extruded rounded-2xl p-4 flex items-center justify-center text-[#00F5FF] active:text-[#FF006E]"><ArrowDown size={24} /></button>
        <button onClick={() => handleDPad('right')} className="bg-[#16213E] neu-extruded rounded-2xl p-4 flex items-center justify-center text-[#00F5FF] active:text-[#FF006E]"><ArrowRight size={24} /></button>
      </div>
    </div>
  );
};

// --- Music Player (Procedural Audio) ---
const TRACKS = [
  { id: 0, name: "Neon Dreams", artist: "SynthWave AI", color: "bg-[#00F5FF]", glow: "border-glow-cyan" },
  { id: 1, name: "Pixel Chase", artist: "ChipBot", color: "bg-[#FF006E]", glow: "border-glow-pink" },
  { id: 2, name: "Void Walker", artist: "DeepVoid", color: "bg-[#BF00FF]", glow: "border-glow-purple" },
];

class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  oscillators: OscillatorNode[] = [];
  lfo: OscillatorNode | null = null;
  filter: BiquadFilterNode | null = null;
  isPlaying = false;
  currentTrack = 0;
  intervalId: number | null = null;

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;
    }
  }

  setVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = val;
    }
  }

  stop() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.oscillators = [];
    if (this.lfo) {
      try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) {}
      this.lfo = null;
    }
    if (this.filter) {
      try { this.filter.disconnect(); } catch (e) {}
      this.filter = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
  }

  playTrack(index: number) {
    this.init();
    this.stop();
    this.currentTrack = index;
    this.isPlaying = true;
    
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx!.currentTime;

    if (index === 0) {
      // Track 1: Neon Dreams (Ambient Pad)
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(220, t); // A3
      osc2.frequency.setValueAtTime(222, t); // Slightly detuned
      
      this.lfo = this.ctx!.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.value = 0.2; // Slow modulation
      
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 10;
      this.lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      osc1.connect(this.masterGain!);
      osc2.connect(this.masterGain!);
      
      osc1.start();
      osc2.start();
      this.lfo.start();
      this.oscillators.push(osc1, osc2);

    } else if (index === 1) {
      // Track 2: Pixel Chase (Arpeggio)
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      
      const gainNode = this.ctx!.createGain();
      gainNode.gain.value = 0.3;
      osc.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      osc.start();
      this.oscillators.push(osc);

      const notes = [220, 277.18, 329.63, 440]; // A major arp
      let noteIdx = 0;
      
      this.intervalId = window.setInterval(() => {
        if (this.ctx) {
          osc.frequency.setValueAtTime(notes[noteIdx], this.ctx.currentTime);
          noteIdx = (noteIdx + 1) % notes.length;
        }
      }, 150);

    } else if (index === 2) {
      // Track 3: Void Walker (Drone)
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, t); // A2

      this.filter = this.ctx!.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 400;

      this.lfo = this.ctx!.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.value = 0.5;
      
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 300;
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);

      osc.connect(this.filter);
      this.filter.connect(this.masterGain!);

      osc.start();
      this.lfo.start();
      this.oscillators.push(osc);
    }
  }
}

const engine = new AudioEngine();

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const track = TRACKS[currentTrackIdx];

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress(p => {
          if (p >= 100) return 0;
          return p + (100 / (30 * 10)); // 100ms updates for 30s
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrackIdx]);

  const togglePlay = () => {
    if (!isPlaying) {
      engine.playTrack(currentTrackIdx);
      engine.setVolume(volume);
      setIsPlaying(true);
    } else {
      engine.stop();
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIdx + 1) % TRACKS.length;
    setCurrentTrackIdx(nextIdx);
    setProgress(0);
    if (isPlaying) {
      engine.playTrack(nextIdx);
    }
  };

  const prevTrack = () => {
    const prevIdx = (currentTrackIdx - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIdx(prevIdx);
    setProgress(0);
    if (isPlaying) {
      engine.playTrack(prevIdx);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    engine.setVolume(val);
  };

  useEffect(() => {
    const handleInteraction = () => {
      if (!engine.ctx) {
        engine.init();
      }
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#1A1A2E]/90 backdrop-blur-md border-t border-white/5 z-50 px-4 py-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Track Info */}
        <div className="flex items-center w-full md:w-1/3 gap-4 overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-[#16213E] neu-inset flex items-center justify-center shrink-0">
            <div className={cn("w-6 h-6 rounded-full animate-pulse", track.color, track.glow)}></div>
          </div>
          <div className="flex flex-col min-w-0">
            <motion.span 
              key={track.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="font-display text-[#E0E0E0] font-bold truncate"
            >
              {track.name}
            </motion.span>
            <span className="text-[#8892A0] text-xs truncate">{track.artist}</span>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex flex-col items-center w-full md:w-1/3 gap-3">
          <div className="flex items-center gap-6">
            <button onClick={prevTrack} className="text-[#8892A0] hover:text-[#00F5FF] transition-colors">
              <SkipBack size={20} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 bg-[#16213E] neu-extruded rounded-full flex items-center justify-center text-[#00F5FF] hover:text-[#FF006E] transition-colors"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={nextTrack} className="text-[#8892A0] hover:text-[#00F5FF] transition-colors">
              <SkipForward size={20} />
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-xs font-mono text-[#8892A0]">0:{(progress * 0.3).toFixed(0).padStart(2, '0')}</span>
            <div className="flex-1 h-2 bg-[#16213E] neu-inset rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-100 ease-linear", track.color)}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-[#8892A0]">0:30</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center justify-end w-1/3 gap-3">
          <Volume2 size={18} className="text-[#8892A0]" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolume}
            className="w-24 h-2 bg-[#16213E] neu-inset rounded-full appearance-none cursor-pointer accent-[#00F5FF]"
          />
        </div>

      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  return (
    <div className="min-h-screen w-full relative selection:bg-[#FF006E]/30">
      <StarfieldBackground />
      <div className="relative z-10">
        <HeroSection />
        <SnakeGame />
      </div>
      <MusicPlayer />
    </div>
  );
}
