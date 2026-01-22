
import React from 'react';

interface ChefieAvatarProps {
  emotion: 'happy' | 'thinking' | 'cheering' | 'relaxing';
}

const ChefieAvatar: React.FC<ChefieAvatarProps> = ({ emotion }) => {
  const getAvatarImage = () => {
    switch (emotion) {
      case 'happy': return 'https://picsum.photos/seed/happy/200/200';
      case 'thinking': return 'https://picsum.photos/seed/think/200/200';
      case 'cheering': return 'https://picsum.photos/seed/cheer/200/200';
      case 'relaxing': return 'https://picsum.photos/seed/chill/200/200';
      default: return 'https://picsum.photos/seed/chefie/200/200';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-40">
        {/* Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-sky-400/20 blur-xl animate-pulse"></div>
        {/* Character Image */}
        <img 
          src={getAvatarImage()} 
          alt="Chefie" 
          className="w-full h-full rounded-full border-4 border-sky-400 object-cover shadow-2xl float-animation"
        />
        {/* Emotion Indicator */}
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {emotion}
        </div>
      </div>
      <h3 className="mt-4 font-game text-xl text-sky-300 font-semibold">Chefie</h3>
    </div>
  );
};

export default ChefieAvatar;
