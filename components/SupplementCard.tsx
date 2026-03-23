import React from 'react';
import { Supplement, getCategoryStyle } from '../types';
import { Lock, Leaf, WheatOff, FlaskConical, Sprout, ChevronRight, Play, Pause } from 'lucide-react';
import { soundService } from '../services/sound';
import { getEmoji } from './RankingView';
import StarRating from './StarRating';

interface Props {
  data: Supplement;
  onClick: () => void;
  onVote: (id: string, rating: number) => void;
  onToggleProtocol?: (id: string) => void;
  isActive?: boolean;
  userIsPremium: boolean;
}

const SupplementCard: React.FC<Props> = ({ data, onClick, onVote, onToggleProtocol, isActive, userIsPremium }) => {
  const isLocked = data.isPremium && !userIsPremium;
  const style = getCategoryStyle(data.category);

  const handleMouseEnter = () => {
    soundService.playHover();
  };

  const handleClick = (e: React.MouseEvent) => {
    soundService.playClick();
    onClick();
  };

  const handleProtocolToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleProtocol && userIsPremium) {
      onToggleProtocol(data.id);
    } else {
      soundService.playClick();
    }
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={`
        group relative flex flex-col p-4 rounded-[1.5rem] border transition-all duration-500 cursor-pointer overflow-hidden min-h-[380px]
        ${isLocked 
          ? 'bg-surface/50 border-border opacity-80' 
          : `bg-surface border-border hover:border-indigo-500/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-1`
        }
        ${isActive ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : ''}
      `}
    >
      {/* Indicador de Categoría y Score */}
      <div className="flex justify-between items-start z-20 mb-4">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 border ${style.border} backdrop-blur-md shadow-sm`}>
          <div className={`w-1 h-1 rounded-full ${style.dot} ${style.glow} shadow-[0_0_4px_var(--tw-shadow-color)] animate-pulse`} />
          <span className={`text-[8px] font-black uppercase tracking-[0.05em] ${style.text} italic`}>
            {data.category}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onToggleProtocol && (
            <button 
              onClick={handleProtocolToggle}
              className={`
                flex items-center justify-center w-10 h-10 rounded-xl border backdrop-blur-md transition-all shadow-lg
                ${!userIsPremium 
                  ? 'bg-black/20 border-white/5 text-secondary/30 cursor-not-allowed' 
                  : (isActive 
                    ? 'bg-amber-500 border-amber-400 text-black shadow-amber-500/40' 
                    : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40')
                }
              `}
              title={!userIsPremium ? "Activación exclusiva PRO" : (isActive ? "Pausar Protocolo" : "Activar Protocolo")}
            >
              {!userIsPremium ? <Lock size={16} className="text-amber-500/40" /> : (isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />)}
            </button>
          )}

          <div className={`
            flex flex-col items-center justify-center w-10 h-10 rounded-lg border shadow-sm backdrop-blur-md
            ${isLocked ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700' : 'bg-background/60 border-indigo-500/20'}
          `}>
            <span className="text-[7px] font-black text-secondary uppercase leading-none mb-0.5 tracking-tighter">Impacto</span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400 italic leading-none">{data.scientificScore}</span>
          </div>
        </div>
      </div>

      {/* Main Visual Component */}
      <div className="flex flex-col items-center text-center relative z-10 flex-grow">
        <div className={`
          w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-3xl mb-3 border transition-all duration-500
          ${isLocked ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800' : `${style.bg} ${style.border} group-hover:scale-105 group-hover:rotate-3 shadow-lg`}
          ${isActive ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : ''}
        `}>
          {isLocked ? <Lock size={20} className="text-neutral-400 dark:text-neutral-700" /> : getEmoji(data.name)}
        </div>
        
        {/* Título Con Diseño "Crystal-Edge" Compacto */}
        <div className="relative mb-3 w-full px-1">
          <h3 className={`
            text-lg font-black uppercase italic tracking-tighter leading-tight 
            inline-block
            bg-clip-text text-transparent bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-500 dark:from-white dark:via-white dark:to-white/60
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]
            [-webkit-text-stroke:0.2px_rgba(0,0,0,0.05)] dark:[-webkit-text-stroke:0.2px_rgba(255,255,255,0.15)]
            group-hover:drop-shadow-[0_4px_8px_rgba(99,102,241,0.2)] dark:group-hover:drop-shadow-[0_4px_8px_rgba(99,102,241,0.4)]
            transition-all duration-500
            ${isActive ? 'from-amber-400 to-amber-600' : ''}
          `}>
            {data.name}
          </h3>
          <div className={`h-0.5 w-8 mx-auto mt-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-amber-500 w-16' : 'bg-indigo-500/40 group-hover:w-16 group-hover:bg-indigo-500'}`}></div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-[0.1em] border shadow-sm ${data.evidence === 'Alta' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-500 bg-emerald-500/10' : 'border-amber-500/30 text-amber-600 dark:text-amber-500 bg-amber-500/10'}`}>
            Evidencia {data.evidence}
          </div>
          <div className="flex gap-1.5">
            {data.isVegan && <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-sm"><Leaf size={12} /></div>}
            {data.isGlutenFree && <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-sm"><WheatOff size={12} /></div>}
            <div className={`p-1 rounded-md bg-black/5 dark:bg-black/60 border ${data.origin === 'Natural' ? 'border-indigo-500/20 text-indigo-500 dark:text-indigo-400' : 'border-purple-500/20 text-purple-500 dark:text-purple-400'} shadow-sm`}>
              {data.origin === 'Natural' ? <Sprout size={12} /> : <FlaskConical size={12} />}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Compacto */}
      <div className="mt-4 pt-3 border-t border-border/40 flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <StarRating rating={data.rating} size={12} interactive={true} onVote={(r) => onVote(data.id, r)} />
            <span className="text-[7px] font-black text-secondary uppercase tracking-tighter">{data.votes} VOTOS PRO</span>
          </div>
          
          <button className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-indigo-500/20 flex items-center gap-1 group/btn shadow-md">
            INFO <ChevronRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {data.userVote !== undefined && (
          <div className="bg-black border border-amber-500/30 px-2 py-1 rounded-md shadow-sm animate-pulse text-center">
            <span className="text-[7px] font-black text-amber-500 uppercase tracking-[0.15em]">TU VOTO: {data.userVote.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 dark:bg-black/70 backdrop-blur-sm p-4 text-center">
          <Lock size={20} className="text-amber-500 mb-2" />
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Premium</span>
          <p className="text-[7px] text-primary/70 font-medium leading-relaxed max-w-[100px]">Biohacker requerido.</p>
        </div>
      )}
    </div>
  );
};

export default SupplementCard;