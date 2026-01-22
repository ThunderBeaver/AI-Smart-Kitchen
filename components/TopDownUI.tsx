
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, Ingredient, DifficultyLevel } from '../types';

interface Particle {
  id: number;
  x: number;
  y: number;
  cleaned: boolean;
}

interface IngredientWithProgress extends Ingredient {
  clickProgress: number; // 0 to 100
}

interface TopDownUIProps {
  mode: GameMode;
  difficulty: DifficultyLevel;
  ingredients: Ingredient[];
  progress: number;
  feedback: string;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (level: DifficultyLevel) => void;
  activeModule: string | null;
  emotion: 'happy' | 'thinking' | 'cheering' | 'relaxing';
}

const TopDownUI: React.FC<TopDownUIProps> = ({ 
  mode, 
  difficulty, 
  ingredients, 
  progress, 
  feedback, 
  onModeChange, 
  onDifficultyChange,
  activeModule, 
  emotion 
}) => {
  const [miniGameScore, setMiniGameScore] = useState(0);
  const [rhythmPulse, setRhythmPulse] = useState(false);
  const [hitFeedback, setHitFeedback] = useState<string | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [showComboAnim, setShowComboAnim] = useState(false);
  
  const [currentTemp, setCurrentTemp] = useState(50);
  const [targetTemp, setTargetTemp] = useState(70);

  const [isCleaningPhase, setIsCleaningPhase] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cleaningProgress, setCleaningProgress] = useState(0);

  // Local state for tracking ingredient preparation clicks
  const [localIngredients, setLocalIngredients] = useState<IngredientWithProgress[]>([]);

  // Sync props to local state when ingredients list changes
  useEffect(() => {
    setLocalIngredients(ingredients.map(ing => ({ ...ing, clickProgress: 0 })));
  }, [ingredients]);

  const handleIngredientClick = (index: number) => {
    setLocalIngredients(prev => prev.map((ing, i) => {
      if (i === index) {
        const nextProgress = Math.min(100, ing.clickProgress + 20);
        return { ...ing, clickProgress: nextProgress, detected: nextProgress >= 100 ? true : ing.detected };
      }
      return ing;
    }));
    setMiniGameScore(s => s + 10);
  };

  const emotionTheme = {
    happy: { color: 'sky-400', glow: 'rgba(56,189,248,0.4)', icon: '✨', tailwind: 'bg-sky-400' },
    thinking: { color: 'indigo-400', glow: 'rgba(129,140,248,0.4)', icon: '🤔', tailwind: 'bg-indigo-400' },
    cheering: { color: 'yellow-400', glow: 'rgba(250,204,21,0.4)', icon: '🎉', tailwind: 'bg-yellow-400' },
    relaxing: { color: 'emerald-400', glow: 'rgba(52,211,153,0.4)', icon: '🌿', tailwind: 'bg-emerald-400' }
  }[emotion];

  const getTempColor = (temp: number) => {
    if (temp < 30) return '#38bdf8'; 
    if (temp <= 60) return '#fb923c'; 
    return '#ef4444'; 
  };

  const tempColor = getTempColor(currentTemp);

  useEffect(() => {
    if (progress >= 99 && !isCleaningPhase) {
      setIsCleaningPhase(true);
      const count = difficulty === DifficultyLevel.HARD ? 20 : difficulty === DifficultyLevel.MEDIUM ? 12 : 6;
      setParticles(Array.from({ length: count }).map((_, i) => ({
        id: i, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, cleaned: false
      })));
      setCleaningProgress(0);
    } else if (progress < 10) {
      setIsCleaningPhase(false);
    }
  }, [progress, isCleaningPhase, difficulty]);

  const handleCleaningInteraction = (e: React.MouseEvent) => {
    if (!isCleaningPhase) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    const range = difficulty === DifficultyLevel.HARD ? 5 : 10;
    setParticles(prev => prev.map(p => (!p.cleaned && Math.abs(p.x - mouseX) < range && Math.abs(p.y - mouseY) < range ? { ...p, cleaned: true } : p)));
  };

  useEffect(() => {
    if (particles.length > 0) {
      setCleaningProgress((particles.filter(p => p.cleaned).length / particles.length) * 100);
    }
  }, [particles]);

  useEffect(() => {
    if (activeModule === 'knife') {
      const speed = difficulty === DifficultyLevel.HARD ? 400 : difficulty === DifficultyLevel.MEDIUM ? 600 : 900;
      const interval = setInterval(() => setRhythmPulse(p => !p), speed);
      return () => clearInterval(interval);
    }
    setComboCount(0);
  }, [activeModule, difficulty]);

  useEffect(() => {
    if (activeModule === 'induction') {
      const driftInterval = setInterval(() => {
        setCurrentTemp(prev => Math.max(0, prev - 0.2));
      }, 500);
      return () => clearInterval(driftInterval);
    }
  }, [activeModule]);

  const handleInductionInteraction = (e: React.MouseEvent) => {
    if (activeModule !== 'induction' || isCleaningPhase) return;
    if (e.button === 0) {
      setCurrentTemp(prev => Math.min(100, prev + 5));
    } else if (e.button === 2) {
      setCurrentTemp(prev => Math.max(0, prev - 5));
    }
  };

  const handleChopInteraction = useCallback(() => {
    if (activeModule === 'knife' && !isCleaningPhase) {
      const isPerfect = rhythmPulse;
      setHitFeedback(isPerfect ? 'PERFECT!' : 'GREAT!');
      if (isPerfect) {
        setComboCount(c => c + 1);
        setMiniGameScore(s => s + (100 * (comboCount + 1)));
        if (comboCount >= (difficulty === DifficultyLevel.HARD ? 5 : 3)) {
          setShowComboAnim(true);
          setTimeout(() => setShowComboAnim(false), 800);
        }
      } else {
        setComboCount(0);
        setMiniGameScore(s => s + 50);
      }
      setTimeout(() => setHitFeedback(null), 500);
    }
  }, [activeModule, rhythmPulse, isCleaningPhase, comboCount, difficulty]);

  const circleRadius = 140;
  const circumference = 2 * Math.PI * circleRadius;

  return (
    <div 
      className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-6 p-10 pointer-events-none transition-colors duration-1000" 
      style={{ boxShadow: `inset 0 0 150px ${emotionTheme.glow}` }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Bar */}
      <div className="col-start-1 col-end-13 row-start-1 flex justify-center items-center pointer-events-auto">
        <div className="bg-white/5 backdrop-blur-md rounded-full p-1.5 border border-white/10 flex gap-1 shadow-2xl">
          {Object.values(GameMode).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-8 py-2.5 rounded-full font-game text-xs tracking-wider transition-all duration-300 ${
                mode === m 
                ? `bg-${emotionTheme.color} text-white shadow-xl scale-105` 
                : 'text-gray-400 hover:text-white active:scale-95'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Vision Column */}
      <div className="col-start-1 col-end-4 row-start-2 row-end-6 bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 flex flex-col pointer-events-auto shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
            <h2 className="font-game text-2xl text-white flex items-center gap-2 tracking-widest uppercase">Vision</h2>
            <span className="text-xl animate-bounce">{emotionTheme.icon}</span>
        </div>
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {localIngredients.map((ing, i) => (
            <div 
              key={i} 
              onClick={() => handleIngredientClick(i)}
              className={`group relative flex flex-col justify-center p-4 rounded-2xl transition-all duration-300 border cursor-pointer select-none overflow-hidden ${
                ing.detected ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              {/* Progress Bar Background */}
              <div 
                className={`absolute left-0 top-0 bottom-0 transition-all duration-500 opacity-20 ${emotionTheme.tailwind}`}
                style={{ width: `${ing.clickProgress}%` }}
              ></div>

              <div className="relative flex justify-between items-center z-10">
                <div className="flex gap-3 items-center">
                  <div className={`w-3 h-3 rounded-full transition-colors ${ing.detected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gray-600'}`}></div>
                  <div>
                      <p className={`text-sm font-bold transition-colors ${ing.detected ? 'text-emerald-300' : 'text-white'}`}>{ing.name}</p>
                      <p className="text-[9px] text-gray-500 font-black uppercase">{ing.amount}</p>
                  </div>
                </div>
                {ing.detected && (
                  <div className="bg-emerald-400 text-emerald-900 rounded-full w-5 h-5 flex items-center justify-center animate-in fade-in zoom-in">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
              
              {/* Bottom Micro-progress line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-500 ${emotionTheme.tailwind}`} 
                    style={{ width: `${ing.clickProgress}%` }}
                 ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div 
        className="col-start-4 col-end-10 row-start-2 row-end-6 flex items-center justify-center relative pointer-events-auto"
        onMouseMove={isCleaningPhase ? handleCleaningInteraction : undefined}
        onMouseDown={(e) => {
          if (activeModule === 'induction') handleInductionInteraction(e);
          else handleChopInteraction();
        }}
      >
        {!isCleaningPhase && activeModule === 'knife' && (
          <div className="flex flex-col items-center">
             <div className={`w-72 h-72 border-4 rounded-full transition-all duration-200 ${rhythmPulse ? 'scale-110 border-sky-400 shadow-[0_0_40px_rgba(56,189,248,0.5)]' : 'scale-95 border-sky-400/20'}`}></div>
             {hitFeedback && <p className="absolute text-white font-game text-4xl animate-ping">{hitFeedback}</p>}
             {showComboAnim && <p className="absolute text-5xl text-sky-400 font-game animate-bounce">{comboCount}x COMBO!</p>}
          </div>
        )}

        {!isCleaningPhase && activeModule === 'induction' && (
          <div className="relative flex items-center justify-center w-[500px] h-[500px] group cursor-pointer select-none">
            <div 
              className="absolute w-[420px] h-[420px] rounded-full blur-[80px] opacity-30 transition-all duration-500"
              style={{ backgroundColor: tempColor, transform: `scale(${1 + (currentTemp / 100) * 0.2})` }}
            />
            <svg className="absolute w-full h-full -rotate-90 overflow-visible" viewBox="0 0 320 320">
              <circle cx="160" cy="160" r={circleRadius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="160" cy="160" r={circleRadius} fill="none" stroke={tempColor} strokeWidth="12"
                strokeDasharray={circumference} strokeDashoffset={circumference - (currentTemp / 100) * circumference}
                strokeLinecap="round" className="transition-all duration-300"
                style={{ filter: `drop-shadow(0 0 15px ${tempColor}cc)` }}
              />
              <line x1="160" y1="10" x2="160" y2="25" stroke="white" strokeWidth="4" strokeLinecap="round" transform={`rotate(${(targetTemp / 100) * 360} 160 160)`} />
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
              <p className="text-7xl font-game font-bold transition-all duration-300 text-white" style={{ color: currentTemp > 80 ? '#ef4444' : 'white' }}>
                {Math.round(currentTemp)}°
              </p>
              <p className="text-xs text-white/40 font-black tracking-[0.2em] uppercase mt-2">TARGET: {targetTemp}°</p>
            </div>
          </div>
        )}

        {isCleaningPhase && (
           <div className="relative w-full h-full flex items-center justify-center">
             {particles.map(p => (
               <div 
                 key={p.id} 
                 className={`absolute w-8 h-8 rounded-full blur-md transition-all duration-500 ${p.cleaned ? 'opacity-0 scale-0' : 'opacity-40 bg-white/50 animate-pulse'}`}
                 style={{ left: `${p.x}%`, top: `${p.y}%` }}
               />
             ))}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <h3 className="font-game text-3xl text-emerald-400 mb-2">Clean Up Time!</h3>
                <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-400 transition-all" style={{ width: `${cleaningProgress}%` }}></div>
                </div>
             </div>
           </div>
        )}

        <div className={`absolute top-0 max-w-sm px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/10 text-center transition-all duration-500 bg-black/20 ${isCleaningPhase ? 'translate-y-[-100px] opacity-0' : ''}`}>
           <p className="text-white italic font-medium leading-relaxed">"{feedback}"</p>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-start-10 col-end-13 row-start-2 row-end-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 flex flex-col pointer-events-auto p-8 shadow-inner">
          <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Momentum</span>
              <div className={`w-3 h-3 bg-${emotionTheme.color} rounded-full animate-pulse shadow-lg`}></div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Sync Score</p>
                <p className="text-2xl font-game text-white">{miniGameScore}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden relative">
                <div className="absolute bottom-0 left-0 h-1 bg-sky-400/40 transition-all duration-500" style={{width: `${progress}%`}}></div>
                <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Progress</p>
                <p className="text-2xl font-game text-white">
                  {Math.round(progress)}%
                </p>
              </div>
          </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="col-start-4 col-end-10 row-start-6 flex flex-col justify-end pb-4 pointer-events-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 flex gap-2 shadow-lg">
            {Object.values(DifficultyLevel).map((level) => (
              <button
                key={level}
                onClick={() => onDifficultyChange(level)}
                className={`px-6 py-2 rounded-xl text-[10px] font-game font-bold tracking-widest uppercase transition-all duration-300 ${
                  difficulty === level 
                  ? 'bg-sky-500 text-white shadow-md scale-105' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className={`h-full rounded-full transition-all duration-1000 ${isCleaningPhase ? 'bg-emerald-400' : `bg-${emotionTheme.color}`}`} style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-black tracking-widest uppercase">
              <span>Setup</span>
              <span className={`text-${emotionTheme.color} font-game`}>{isCleaningPhase ? 'CLEANING' : (activeModule ? activeModule.toUpperCase() : 'STANDBY')}</span>
              <span>Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDownUI;
