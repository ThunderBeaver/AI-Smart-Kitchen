
import React, { useState, useEffect, useCallback } from 'react';
import TopDownUI from './components/TopDownUI';
import NutritionPlanner from './components/NutritionPlanner';
import Cookbook from './components/Cookbook';
import { GameMode, Ingredient, DifficultyLevel } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const MOCK_INGREDIENTS: Ingredient[] = [
  { name: 'Red Bell Pepper', amount: '1pc', detected: true },
  { name: 'Onion', amount: '1/2pc', detected: false },
  { name: 'Chicken Breast', amount: '200g', detected: false },
  { name: 'Olive Oil', amount: '15ml', detected: true },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.FREE);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);
  const [ingredients, setIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS);
  const [progress, setProgress] = useState(35);
  const [feedback, setFeedback] = useState("Let's make some magic together! ✨");
  const [emotion, setEmotion] = useState<'happy' | 'thinking' | 'cheering' | 'relaxing'>('happy');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [lastGesture, setLastGesture] = useState<{name: string, timestamp: number} | null>(null);
  
  // Modals State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [isCookbookOpen, setIsCookbookOpen] = useState(false);
  const [recipeInput, setRecipeInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const triggerGesture = useCallback((name: string) => {
    setLastGesture({ name, timestamp: Date.now() });
    setTimeout(() => setLastGesture(null), 2000);
  }, []);

  const handleAIInteraction = useCallback(async (action: string, module?: string | null, currentDiff?: DifficultyLevel) => {
    setEmotion('thinking');
    const diff = currentDiff || difficulty;
    
    setTimeout(() => {
        let msg = "";
        if (module === 'knife') {
          msg = diff === DifficultyLevel.HARD 
            ? "Elite precision required! No room for errors. 🔪" 
            : "Smart Knife linked! I'm watching your precision. 🔪";
          setEmotion('cheering');
        } else if (module === 'induction') {
          msg = diff === DifficultyLevel.EASY
            ? "Safe and steady! Let's warm things up gently. 🔥"
            : "Induction module hot! Let's get that sizzle going. 🔥";
          setEmotion('happy');
        } else {
          const reactions: Record<string, string> = {
              'FREE': "Feel the flow! The kitchen is your canvas today. 🎨",
              'TASK': "Got a plan! Let's get those ingredients ready. 🧅",
              'CHALLENGE': diff === DifficultyLevel.HARD ? "HARDCORE MODE! Show me your speed! ⚡" : "Speed run? You've got this! ⏱️",
              'RELAX': "Breathe in... slice slow. It's just you and the aroma. 🌿"
          };
          msg = reactions[action] || "You're doing great!";
          setEmotion(action === 'CHALLENGE' ? 'cheering' : action === 'RELAX' ? 'relaxing' : 'happy');
        }
        setFeedback(msg);
    }, 800);
  }, [difficulty]);

  const saveToCookbook = (title: string, ings: Ingredient[]) => {
    const existing = localStorage.getItem('chefie_cookbook');
    const cookbook = existing ? JSON.parse(existing) : [];
    const newRecipe = {
      id: Math.random().toString(36).substr(2, 9),
      title: title || 'New Scanned Recipe',
      ingredients: ings,
      timestamp: Date.now(),
      isFavorite: false
    };
    localStorage.setItem('chefie_cookbook', JSON.stringify([newRecipe, ...cookbook]));
  };

  const handleRecipeImport = async () => {
    if (!recipeInput.trim()) return;
    setIsParsing(true);
    setEmotion('thinking');
    setFeedback("Let me read through this recipe real quick... 📖");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Extract the main ingredients from this recipe content: ${recipeInput}. Difficulty level is set to ${difficulty}. Provide a short title too.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING }
                  },
                  required: ["name", "amount"]
                }
              },
              chefieComment: { type: Type.STRING, description: "A friendly, emotional comment from Chefie about this recipe." }
            },
            required: ["title", "ingredients", "chefieComment"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.ingredients) {
        const newIngredients: Ingredient[] = data.ingredients.map((ing: any) => ({
          ...ing,
          detected: false
        }));
        setIngredients(newIngredients);
        setFeedback(data.chefieComment);
        setEmotion('happy');
        setProgress(0);
        setIsImportModalOpen(false);
        setRecipeInput("");
        saveToCookbook(data.title, newIngredients);
      }
    } catch (err) {
      console.error(err);
      setFeedback("Oops, that recipe looks a bit complex for me to scan! Can you try again?");
      setEmotion('thinking');
    } finally {
      setIsParsing(false);
    }
  };

  const loadFromCookbook = (ings: Ingredient[]) => {
    setIngredients(ings.map(i => ({ ...i, detected: false })));
    setProgress(0);
    setIsCookbookOpen(false);
    setFeedback("Loaded from library! Everything is ready for you. ✨");
    setEmotion('happy');
    triggerGesture("LIBRARY LOADED");
  };

  const toggleModule = (id: string) => {
    const newModule = activeModule === id ? null : id;
    setActiveModule(newModule);
    triggerGesture(newModule ? `LINKING ${id.toUpperCase()}` : `UNLINKING ${id.toUpperCase()}`);
    handleAIInteraction(mode, newModule);
  };

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    triggerGesture(`MODE: ${newMode}`);
  };

  const handleDifficultyChange = (newDiff: DifficultyLevel) => {
    setDifficulty(newDiff);
    triggerGesture(`DIFF: ${newDiff}`);
    handleAIInteraction(mode, activeModule, newDiff);
  };

  useEffect(() => {
    handleAIInteraction(mode, activeModule);
  }, [mode, handleAIInteraction]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => (p < 100 ? p + 0.1 : 0));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden projector-surface flex items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gesture Feedback Hud */}
      {lastGesture && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center">
            <div className="w-64 h-64 rounded-full border-4 border-sky-400/50 animate-[ping_1.5s_infinite] absolute"></div>
            <div className="bg-sky-500/80 backdrop-blur-xl px-8 py-3 rounded-full border border-white/20 shadow-[0_0_30px_rgba(56,189,248,0.4)] animate-bounce">
                <p className="text-white font-game text-xl tracking-widest">{lastGesture.name}</p>
            </div>
            <p className="mt-4 text-sky-300 text-[10px] font-bold tracking-[0.3em] animate-pulse">GESTURE RECOGNIZED</p>
        </div>
      )}

      {/* Modals */}
      {isNutritionModalOpen && (
        <NutritionPlanner onClose={() => setIsNutritionModalOpen(false)} />
      )}

      {isCookbookOpen && (
        <Cookbook onClose={() => setIsCookbookOpen(false)} onSelectRecipe={loadFromCookbook} />
      )}

      {isImportModalOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-10">
          <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setIsImportModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white text-2xl">✕</button>
            <h2 className="font-game text-3xl text-sky-300 mb-2">Import Recipe</h2>
            <p className="text-gray-400 mb-6 text-sm">Paste a URL or recipe instructions, and I'll prepare our workspace!</p>
            <textarea 
              className="w-full h-48 bg-black/20 rounded-2xl p-6 text-white border border-white/5 focus:border-sky-500/50 outline-none resize-none mb-6 font-medium"
              placeholder="Paste here..."
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              disabled={isParsing}
            />
            <button 
              onClick={handleRecipeImport}
              disabled={isParsing || !recipeInput.trim()}
              className={`w-full py-4 rounded-full font-game text-lg tracking-widest transition-all ${isParsing ? 'bg-gray-600 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]'}`}
            >
              {isParsing ? "CHEFIE IS SCANNING..." : "LOAD RECIPE"}
            </button>
          </div>
        </div>
      )}

      {/* Main UI */}
      <TopDownUI 
        mode={mode}
        difficulty={difficulty}
        ingredients={ingredients}
        progress={progress}
        feedback={feedback}
        onModeChange={handleModeChange}
        onDifficultyChange={handleDifficultyChange}
        activeModule={activeModule}
        emotion={emotion}
      />

      {/* Top Left Controls */}
      <div className="absolute top-10 left-10 flex gap-4 z-30 pointer-events-auto">
        <button 
          onClick={() => toggleModule('knife')}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border transition-all duration-300 ${activeModule === 'knife' ? 'bg-sky-500 border-sky-400 scale-110 shadow-[0_0_20px_rgba(56,189,248,0.5)]' : 'bg-white/5 border-white/10'}`}
        >
          🔪
        </button>
        <button 
          onClick={() => toggleModule('induction')}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border transition-all duration-300 ${activeModule === 'induction' ? 'bg-orange-500 border-orange-400 scale-110 shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 'bg-white/5 border-white/10'}`}
        >
          🍳
        </button>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-10 right-10 flex gap-4 z-30 pointer-events-auto">
        <button 
          onClick={() => setIsCookbookOpen(true)}
          title="Digital Cookbook"
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border bg-white/5 border-white/10 hover:bg-white/10 transition-all active:scale-90"
        >
          📚
        </button>
        <button 
          onClick={() => setIsImportModalOpen(true)}
          title="Recipe Import"
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border bg-white/5 border-white/10 hover:bg-white/10 transition-all active:scale-90"
        >
          📖
        </button>
        <button 
          onClick={() => setIsNutritionModalOpen(true)}
          title="AI Nutrition Planner"
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border bg-emerald-500/20 border-emerald-400/30 hover:bg-emerald-500/30 transition-all active:scale-90"
        >
          🥗
        </button>
      </div>

      {/* Listening Indicator */}
      <div className="absolute bottom-10 left-10 flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-lg">
        <div className="flex gap-1.5 items-end h-4">
          <div className="w-1 bg-sky-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
          <div className="w-1 bg-sky-400 rounded-full animate-[bounce_0.8s_infinite_0.2s]"></div>
          <div className="w-1 bg-sky-400 rounded-full animate-[bounce_0.8s_infinite_0.4s]"></div>
        </div>
        <p className="text-[10px] text-white font-bold tracking-[0.2em] uppercase">Hand Tracking Ready</p>
      </div>
    </div>
  );
};

export default App;
