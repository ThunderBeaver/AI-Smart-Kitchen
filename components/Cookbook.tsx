
import React, { useState, useEffect } from 'react';
import { Ingredient } from '../types';

interface SavedRecipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  timestamp: number;
  isFavorite: boolean;
}

interface PresetRecipe {
  id: string;
  title: string;
  image: string;
  description: string;
  ingredients: Ingredient[];
}

const PRESET_RECIPES: PresetRecipe[] = [
  {
    id: 'preset-1',
    title: 'Mediterranean Roast Chicken',
    image: '🍗',
    description: 'Rich in high-quality protein and olive oil, a balanced and healthy lunch choice.',
    ingredients: [
      { name: 'Chicken Breast', amount: '250g', detected: false },
      { name: 'Broccoli', amount: '100g', detected: false },
      { name: 'Olive Oil', amount: '15ml', detected: false },
      { name: 'Garlic', amount: '2 cloves', detected: false }
    ]
  },
  {
    id: 'preset-2',
    title: 'Classic Tomato Pasta',
    image: '🍝',
    description: 'Rich tomato sauce paired with fresh basil, simple Italian flair.',
    ingredients: [
      { name: 'Pasta', amount: '100g', detected: false },
      { name: 'Tomato', amount: '2pcs', detected: false },
      { name: 'Basil Leaves', amount: '5 leaves', detected: false },
      { name: 'Parmesan Cheese', amount: '10g', detected: false }
    ]
  },
  {
    id: 'preset-3',
    title: 'Avocado Energy Salad',
    image: '🥑',
    description: 'The supermodel-style low-carb diet, refreshing and full of vitality.',
    ingredients: [
      { name: 'Avocado', amount: '1pc', detected: false },
      { name: 'Quinoa', amount: '50g', detected: false },
      { name: 'Cherry Tomatoes', amount: '6pcs', detected: false },
      { name: 'Lemon Juice', amount: '10ml', detected: false }
    ]
  }
];

interface CookbookProps {
  onClose: () => void;
  onSelectRecipe: (ingredients: Ingredient[]) => void;
}

const Cookbook: React.FC<CookbookProps> = ({ onClose, onSelectRecipe }) => {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'presets'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<PresetRecipe | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chefie_cookbook');
    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  }, []);

  const saveToDisk = (updated: SavedRecipe[]) => {
    setRecipes(updated);
    localStorage.setItem('chefie_cookbook', JSON.stringify(updated));
  };

  const toggleFavorite = (id: string) => {
    const updated = recipes.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    saveToDisk(updated);
  };

  const deleteRecipe = (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    saveToDisk(updated);
  };

  const displayedRecipes = recipes.filter(r => filter === 'all' || (filter === 'favorites' && r.isFavorite));

  return (
    <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
      <div className="bg-[#0f172a] border border-sky-500/30 rounded-[2.5rem] p-8 w-full max-w-5xl max-h-[90vh] shadow-[0_0_50px_rgba(56,189,248,0.2)] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="font-game text-4xl text-sky-300">
              {selectedPreset ? "Recipe Details" : "Digital Cookbook"}
            </h2>
            <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
              {selectedPreset ? selectedPreset.title : "Your Curated Culinary Library"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {!selectedPreset && (
              <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex">
                <button 
                  onClick={() => setFilter('presets')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${filter === 'presets' ? 'bg-sky-500 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Presets
                </button>
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${filter === 'all' ? 'bg-sky-500 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  My Recipes
                </button>
                <button 
                  onClick={() => setFilter('favorites')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${filter === 'favorites' ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Favorites
                </button>
              </div>
            )}
            <button 
              onClick={selectedPreset ? () => setSelectedPreset(null) : onClose} 
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              {selectedPreset ? "←" : "✕"}
            </button>
          </div>
        </div>

        {/* Selected Preset Details View */}
        {selectedPreset ? (
          <div className="flex-1 flex gap-10 overflow-hidden">
            <div className="w-1/3 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/10 p-8">
              <div className="text-9xl mb-6 float-animation">{selectedPreset.image}</div>
              <h3 className="font-game text-3xl text-white text-center mb-4">{selectedPreset.title}</h3>
              <p className="text-sm text-gray-400 text-center leading-relaxed mb-8">{selectedPreset.description}</p>
              <button 
                onClick={() => onSelectRecipe(selectedPreset.ingredients)}
                className="w-full bg-sky-500 hover:bg-sky-400 text-white py-4 rounded-2xl font-game tracking-[0.2em] shadow-lg shadow-sky-500/20 transition-all active:scale-95"
              >
                COOK THIS NOW
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <h4 className="text-sky-300 font-game text-xl mb-6 flex items-center gap-2">
                <span>📋</span> Required Ingredients & Ratios
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {selectedPreset.ingredients.map((ing, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:border-sky-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></div>
                      <span className="text-white font-medium text-lg">{ing.name}</span>
                    </div>
                    <span className="bg-sky-500/10 text-sky-400 px-4 py-1 rounded-full text-xs font-black tracking-widest border border-sky-500/20">
                      {ing.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {filter === 'presets' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                {PRESET_RECIPES.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    onClick={() => setSelectedPreset(recipe)}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer group hover:bg-sky-500/5 hover:border-sky-500/40 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-sky-500 text-[10px] font-black px-4 py-1 rounded-bl-xl tracking-tighter uppercase">Chef Choice</div>
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500">{recipe.image}</div>
                    <h3 className="text-white font-game text-xl mb-2">{recipe.title}</h3>
                    <p className="text-xs text-gray-500 leading-tight line-clamp-2">{recipe.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-sky-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* User Saved/Favorite Recipes */
              displayedRecipes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                  <span className="text-6xl">📖</span>
                  <p className="font-game text-xl">Empty section...</p>
                  <p className="text-sm max-w-xs text-center">Import new recipes or mark favorites to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                  {displayedRecipes.sort((a,b) => b.timestamp - a.timestamp).map((recipe) => (
                    <div key={recipe.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative group hover:border-sky-500/40 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                        className={`absolute top-4 right-4 text-xl transition-transform hover:scale-125 ${recipe.isFavorite ? 'text-pink-500' : 'text-white/20'}`}
                      >
                        {recipe.isFavorite ? '❤️' : '🤍'}
                      </button>
                      
                      <h3 className="text-white font-game text-xl mb-2 pr-8">{recipe.title}</h3>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">
                        {recipe.ingredients.length} Ingredients
                      </p>
                      
                      <div className="flex-1 space-y-1 mb-6">
                        {recipe.ingredients.slice(0, 3).map((ing, i) => (
                          <div key={i} className="text-xs text-white/60 truncate flex justify-between">
                            <span>• {ing.name}</span>
                            <span className="text-[9px] opacity-40">{ing.amount}</span>
                          </div>
                        ))}
                        {recipe.ingredients.length > 3 && <p className="text-[10px] text-sky-400 mt-2">+{recipe.ingredients.length - 3} more...</p>}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => onSelectRecipe(recipe.ingredients)}
                          className="flex-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white py-3 rounded-2xl font-game text-xs tracking-widest uppercase transition-all"
                        >
                          LOAD WORKSPACE
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                          className="w-12 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-2xl flex items-center justify-center transition-all"
                          title="Remove from library"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cookbook;
