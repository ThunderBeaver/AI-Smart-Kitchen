
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

interface MealPlan {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  nutritionTip: string;
}

interface NutritionPlannerProps {
  onClose: () => void;
}

const NutritionPlanner: React.FC<NutritionPlannerProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlan[] | null>(null);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a healthy 7-day nutritional chef's menu for me. Include breakfast, lunch, and dinner, along with one daily nutrition tip. Please provide the response in English.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                dinner: { type: Type.STRING },
                nutritionTip: { type: Type.STRING }
              },
              required: ["day", "breakfast", "lunch", "dinner", "nutritionTip"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      setPlan(data);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
      <div className="bg-[#0f172a] border border-sky-500/30 rounded-[2.5rem] p-8 w-full max-w-5xl max-h-[90vh] shadow-[0_0_50px_rgba(56,189,248,0.2)] flex flex-col relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="font-game text-4xl text-sky-300">AI Nutrition Assistant</h2>
            <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-bold">Personalized Weekly Fuel Plan</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">✕</button>
        </div>

        {!plan && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center text-4xl animate-pulse">🥗</div>
            <p className="text-white/60 text-center max-w-md">Let Chefie analyze your nutritional needs and craft a perfectly balanced 7-day culinary journey.</p>
            <button 
              onClick={generatePlan}
              className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-4 rounded-full font-game tracking-[0.2em] shadow-lg shadow-sky-500/20 transition-all active:scale-95"
            >
              GENERATE SMART MENU
            </button>
          </div>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            </div>
            <p className="font-game text-sky-300 animate-pulse tracking-widest">SCANNING NUTRITION DATA...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            {plan?.map((day, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-sky-500/50 transition-colors group">
                <h3 className="text-sky-400 font-game text-xl mb-4 border-b border-white/10 pb-2">{day.day}</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Breakfast</span>
                    <p className="text-sm text-white/90 leading-tight mt-1">{day.breakfast}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Lunch</span>
                    <p className="text-sm text-white/90 leading-tight mt-1">{day.lunch}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Dinner</span>
                    <p className="text-sm text-white/90 leading-tight mt-1">{day.dinner}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-[10px] italic text-emerald-400/80 leading-snug">
                    <span className="font-bold">💡 Tip:</span> {day.nutritionTip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionPlanner;
