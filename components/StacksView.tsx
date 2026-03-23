import React, { useState, useRef, useMemo } from 'react';
import { Rocket, Moon, Zap, Shield, Brain, Crown, Check, ChevronRight, Clock, Activity, TrendingUp, Info, ArrowUpRight, Sparkles, Play, Pause, Lock, Power, Layers } from 'lucide-react';
import { soundService } from '../services/sound';
import { Supplement, getCategoryStyle } from '../types';
import SupplementDetailModal from './SupplementDetailModal';
import { STACKS_MANIFEST } from './Dashboard';

interface Props {
  supplements: Supplement[];
  activeSuppIds: string[];
  onToggleProtocol: (id: string) => void;
  onActivateStack: (ingredients: string[]) => void;
  onVote: (id: string, rating: number) => void;
  onRemoveVote: (id: string) => void;
  isPremium: boolean;
  onAttemptUpgrade: () => void;
  onStartOnboarding: () => void;
}

interface StackDetail {
  protocol: string;
  longDescription: string;
  warnings: string[];
  bestTime: string;
  synergyInfo: string;
  kinetics: {
    label: string;
    color: string;
    points: number[]; 
  }[];
}

const BioDynamicsChart: React.FC<{ kinetics: StackDetail['kinetics'] }> = ({ kinetics }) => {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = ((clientX - rect.left) / rect.width) * 23;
    setHoverX(Math.max(0, Math.min(23, Math.round(x))));
  };

  return (
    <div className="mt-6 bg-slate-100 dark:bg-[#0c0c0c] rounded-3xl border border-black/5 dark:border-white/5 p-5 overflow-hidden group/chart relative shadow-inner">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Activity size={14} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-[9px] font-black text-slate-800 dark:text-primary uppercase tracking-widest italic">Cinética de Absorción</span>
        </div>
        <div className="flex gap-3">
          {kinetics.map((k, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: k.color }} />
              <span className="text-[7px] font-bold text-slate-500 dark:text-secondary uppercase tracking-tighter">{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={() => setHoverX(null)}
        onTouchEnd={() => setHoverX(null)}
        className="relative h-32 sm:h-40 w-full cursor-crosshair touch-none select-none"
      >
        <div className="absolute inset-0 flex flex-col justify-between opacity-10 dark:opacity-20 pointer-events-none">
          {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-slate-400 dark:bg-white" />)}
        </div>
        
        {hoverX !== null && (
          <div 
            className="absolute top-0 bottom-0 w-px bg-indigo-500/40 z-0 transition-all duration-75"
            style={{ left: `${(hoverX / 23) * 100}%` }}
          >
            <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
          </div>
        )}

        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {kinetics.map((k, kIdx) => (
            <g key={kIdx}>
              <polyline
                points={k.points.map((p, i) => `${(i / 23) * 100},${100 - p}`).join(' ')}
                fill="none"
                stroke={k.color}
                strokeWidth="0.8"
                strokeOpacity="0.2"
              />
              {k.points.map((p, pIdx) => {
                const isActive = hoverX === pIdx;
                return (
                  <circle
                    key={pIdx}
                    cx={(pIdx / 23) * 100}
                    cy={100 - p}
                    r={isActive ? "1.5" : "0.7"}
                    fill={isActive ? k.color : k.color}
                    fillOpacity={isActive ? "1" : "0.5"}
                    className="transition-all duration-200"
                    style={{ filter: isActive ? `drop-shadow(0 0 4px ${k.color})` : 'none' }}
                  />
                );
              })}
            </g>
          ))}
        </svg>

        {hoverX !== null && (
          <div 
            className="absolute top-0 pointer-events-none bg-slate-900/95 dark:bg-black/90 border border-white/10 backdrop-blur-md p-2 rounded-xl shadow-2xl z-50 flex flex-col gap-1 min-w-[80px]"
            style={{ 
              left: hoverX > 18 ? 'auto' : `${(hoverX / 23) * 100 + 2}%`,
              right: hoverX > 18 ? `${100 - (hoverX / 23) * 100 + 2}%` : 'auto',
              transform: 'translateY(-20%)'
            }}
          >
            <div className="text-[7px] font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-1 mb-1">
              Hora {hoverX}:00
            </div>
            {kinetics.map((k, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="text-[6px] font-bold text-slate-300 dark:text-secondary uppercase">{k.label}</span>
                <span className="text-[8px] font-black text-white italic">{k.points[hoverX]}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4 text-[7px] font-black text-slate-400 dark:text-secondary/40 uppercase tracking-widest border-t border-black/5 dark:border-white/5 pt-3">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
    </div>
  );
};

const StackCard: React.FC<{ 
  stack: typeof STACKS_MANIFEST[0],
  onIngredientClick: (name: string) => void,
  onActivateStack: () => void,
  isActive: boolean,
  isSomeActive: boolean,
  isPremiumUser: boolean,
  details: StackDetail,
  onAttemptUpgrade: () => void,
  activeSuppIds: string[],
  allSupplements: Supplement[]
}> = ({ stack, onIngredientClick, onActivateStack, isActive, isSomeActive, isPremiumUser, details, onAttemptUpgrade, activeSuppIds, allSupplements }) => {
  const [showDetails, setShowDetails] = useState(false);
  const style = getCategoryStyle(stack.category);
  const isLocked = (stack.isPremium && !isPremiumUser);

  return (
    <div className="flex flex-col h-full relative">
      <div className={`
        group bg-white dark:bg-surface border rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 flex flex-col transition-all duration-700 relative overflow-hidden h-full
        ${isActive ? 'border-amber-500 shadow-amber-500/10' : isSomeActive ? 'border-indigo-500/40 shadow-indigo-500/5' : 'border-slate-200 dark:border-border/40 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-1'}
        ${isLocked ? 'opacity-80 grayscale-[0.5]' : ''}
      `}>
        {/* Header: Icon + Title */}
        <div className="flex items-start justify-between mb-6 relative">
          <div className={`
            relative w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl flex-shrink-0 
            border-2 border-white/40 ring-2 ring-indigo-500/5 dark:ring-white/10 group-hover:scale-110 group-hover:border-white/60 transition-all duration-500 z-20
            ${isActive ? 'border-amber-400' : isSomeActive ? 'border-indigo-400' : ''}
          `}>
            {React.cloneElement(stack.icon as React.ReactElement<any>, { size: 28, className: "text-white" })}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-black/40 border ${style.border}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${style.dot} shadow-[0_0_8px_currentColor]`} />
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${style.text} italic`}>{stack.label}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
             <h3 className={`text-xl sm:text-2xl font-black uppercase italic tracking-tighter leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isActive ? 'text-amber-500' : 'text-slate-900 dark:text-primary'}`}>
              {stack.name}
            </h3>
          </div>
          <p className="text-[12px] text-slate-600 dark:text-secondary font-medium italic leading-relaxed line-clamp-2">
            Protocolo de alta eficiencia optimizado para {stack.category.toLowerCase()}.
          </p>
        </div>

        {/* Ingredients Chips: Ahora se iluminan individualmente si están activos */}
        <div className="flex flex-wrap gap-2 mb-8">
          {stack.ingredients.map((ing, i) => {
            const supp = allSupplements.find(s => s.name.toLowerCase().includes(ing.toLowerCase()));
            const isIngActive = supp ? activeSuppIds.includes(supp.id) : false;
            
            return (
              <button
                key={i}
                onClick={() => onIngredientClick(ing)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-sm
                  ${isIngActive 
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                    : 'bg-slate-100 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-700 dark:text-primary/70 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }
                `}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isIngActive ? 'bg-indigo-500 animate-pulse shadow-[0_0_6px_currentColor]' : 'bg-slate-300 dark:bg-white/20'}`} />
                {ing}
              </button>
            );
          })}
        </div>

        {/* Action Button: Lógica Simplificada para evitar la etiqueta "Completar" */}
        <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
           <button 
            onClick={(e) => { e.stopPropagation(); if(!isLocked) onActivateStack(); else onAttemptUpgrade(); }}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] italic transition-all shadow-lg group/btn-act
              ${isLocked 
                ? 'bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-amber-500/20 text-slate-500 dark:text-amber-500/60 cursor-pointer hover:bg-amber-500/10' 
                : (isActive 
                  ? 'bg-amber-500 text-black border-amber-400 hover:bg-red-500 hover:text-white hover:border-red-400' 
                  : 'bg-slate-800 dark:bg-black/40 border border-slate-700 dark:border-white/10 text-white hover:bg-indigo-600 dark:hover:bg-white/10')
              }`}
          >
            {isLocked ? (
              <Lock size={14} className="text-amber-600 dark:text-amber-500" />
            ) : (
              isActive ? (
                <>
                  <Check size={14} className="group-hover/btn-act:hidden" />
                  <Power size={14} className="hidden group-hover/btn-act:block" />
                </>
              ) : (
                <Play size={14} fill="currentColor" />
              )
            )}
            
            {isLocked ? 'ACTIVACIÓN PREMIUM' : (
              isActive ? (
                <>
                  <span className="group-hover/btn-act:hidden">STACK ACTIVO</span>
                  <span className="hidden group-hover/btn-act:inline">APAGAR STACK</span>
                </>
              ) : 'ACTIVAR STACK'
            )}
          </button>
          
          <button 
            onClick={() => { soundService.playClick(); setShowDetails(!showDetails); }}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] italic transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3"
          >
            {showDetails ? 'CERRAR PROTOCOLO' : 'VER PROTOCOLO COMPLETO'}
            <ChevronRight size={14} className={`transition-transform duration-500 ${showDetails ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Collapsible Details */}
        {showDetails && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 animate-fade-in space-y-6">
            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <Info size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest italic">Análisis IA</span>
              </div>
              <p className="text-[12px] text-slate-700 dark:text-secondary font-medium leading-relaxed italic">{details.longDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Clock size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest italic">Toma</span>
                </div>
                <p className="text-[10px] text-slate-800 dark:text-secondary font-medium leading-tight italic">{details.protocol}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <TrendingUp size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest italic">Pico</span>
                </div>
                <p className="text-[10px] text-slate-800 dark:text-secondary font-medium leading-tight italic">{details.bestTime}</p>
              </div>
            </div>

            <BioDynamicsChart kinetics={details.kinetics} />
          </div>
        )}
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-[2.5rem] p-10 text-center animate-fade-in cursor-pointer group/lock" onClick={onAttemptUpgrade}>
          <Lock size={48} className="text-amber-500 mb-6 group-hover/lock:scale-110 transition-transform" />
          <h4 className="text-2xl font-black text-amber-500 uppercase italic tracking-tighter mb-2">Protocolo Élite</h4>
          <p className="text-xs text-primary/70 font-bold uppercase tracking-widest italic opacity-80 leading-relaxed max-w-[200px]">Este stack requiere una suscripción Biohacker PRO activa.</p>
          <span className="mt-4 px-6 py-2 bg-amber-500 text-black rounded-xl text-[8px] font-black uppercase">Click para Activar</span>
        </div>
      )}
    </div>
  );
};

const StacksView: React.FC<Props> = ({ supplements, activeSuppIds, onToggleProtocol, onActivateStack, onVote, onRemoveVote, isPremium, onAttemptUpgrade, onStartOnboarding }) => {
  const [selectedSupplementId, setSelectedSupplementId] = useState<string | null>(null);

  const handleIngredientClick = (name: string) => {
    soundService.playClick();
    const found = supplements.find(s => 
      s.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(s.name.toLowerCase())
    );
    if (found) {
      setSelectedSupplementId(found.id);
    }
  };

  const isStackActive = (ingredients: string[]) => {
    return ingredients.every(ingName => 
      supplements.some(s => s.name.toLowerCase().includes(ingName.toLowerCase()) && activeSuppIds.includes(s.id))
    );
  };

  const isStackSomeActive = (ingredients: string[]) => {
    return ingredients.some(ingName => 
      supplements.some(s => s.name.toLowerCase().includes(ingName.toLowerCase()) && activeSuppIds.includes(s.id))
    );
  };

  const STACK_DETAILS_MAP: Record<string, StackDetail> = {
    "Modo 'Deep Work' 🚀": {
      protocol: "Ingesta conjunta 45 min antes del bloque de trabajo.",
      longDescription: "Utiliza la sinergia cafeína-teanina para estabilizar las ondas alfa cerebrales mientras se bloquean los receptores de adenosina.",
      bestTime: "Mañana temprana (08:30 - 10:30).",
      synergyInfo: "La L-Teanina modula los efectos excitatorios de la cafeína, eliminando el nerviosismo periférico.",
      warnings: ["Ciclar cafeína", "Monitorizar hidratación", "Evitar tras las 16:00h"],
      kinetics: [
        { label: 'Cafeína', color: '#3B82F6', points: [0,0,0,0,0,0,0,0,85,98,80,60,45,30,20,10,5,2,0,0,0,0,0,0] },
        { label: 'Teanina', color: '#10B981', points: [0,0,0,0,0,0,0,0,65,88,95,92,80,65,50,35,25,12,6,2,0,0,0,0] },
        { label: 'Creatina', color: '#FF4D4F', points: [55,55,55,55,55,55,55,55,60,65,68,68,68,68,68,68,68,68,68,68,68,68,68,68] }
      ]
    },
    "Hibernación Profunda 💤": {
      protocol: "Toma única 60 min antes de la hora prevista de sueño.",
      longDescription: "Enfocado en facilitar la entrada en ondas delta mediante la inhibición del glutamato y el soporte al tono vagal.",
      bestTime: "Noche (22:15 - 23:00).",
      synergyInfo: "La Glicina induce vasodilatación periférica bajando la temperatura corporal basal.",
      warnings: ["Evitar con alcohol", "Puede causar sueños vívidos", "Ajustar dosis según peso"],
      kinetics: [
        { label: 'Magnesio', color: '#818CF8', points: [35,25,12,6,2,0,0,0,0,0,0,0,0,0,0,0,0,15,40,70,90,98,92,75] },
        { label: 'Vit D3', color: '#D946EF', points: [25,12,6,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,50,85,98,88,65] },
        { label: 'Ashwa', color: '#F97316', points: [65,65,60,55,50,45,40,35,30,30,30,30,30,30,30,35,45,60,80,90,95,98,98,92] }
      ]
    },
    "Pre-Workout 'Pump' 💪": {
      protocol: "Ingesta 20-30 min antes del calentamiento inicial.",
      longDescription: "Protocolo no estimulante centrado en la vía del óxido nítrico y la resíntesis de ATP intramuscular.",
      bestTime: "Tarde (17:30 - 19:30).",
      synergyInfo: "La Citrulina eleva la arginina sérica para el NO de forma más eficaz que la arginina oral.",
      warnings: ["Parestesia inofensiva", "Monitorizar tensión", "Asegurar hidratación"],
      kinetics: [
        { label: 'Citrulina', color: '#F87171', points: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,98,88,65,40,22,12,6,2] },
        { label: 'Beta-Ala', color: '#FBBF24', points: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,95,80,55,35,18,10,5,2] },
        { label: 'Creatina', color: '#FFFFFF', points: [52,52,52,52,52,52,52,52,52,52,52,52,52,52,52,65,70,70,70,70,70,70,70,70] }
      ]
    },
    "Escudo Inmune 🛡️": {
      protocol: "Ingesta con la comida principal del día.",
      longDescription: "Asegura los cofactores necesarios para la transcripción génica de citoquinas y el mantenimiento de membranas celulares.",
      bestTime: "Almuerzo (14:00 - 15:00).",
      synergyInfo: "La Vitamina D y el Zinc trabajan sinérgicamente en la maduración de linfocitos T.",
      warnings: ["Zinc en ayunas puede causar náuseas", "No exceder 50mg de Zinc"],
      kinetics: [
        { label: 'Vit D3', color: '#FBBF24', points: [20,20,20,20,20,20,20,20,20,20,20,20,20,20,50,85,98,92,80,70,60,50,45,40] },
        { label: 'Omega-3', color: '#10B981', points: [30,30,30,30,30,30,30,30,30,30,30,30,30,30,45,75,98,95,88,78,68,58,52,48] },
        { label: 'Zinc', color: '#3B82F6', points: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,90,98,75,55,35,20,10,5,0] }
      ]
    },
    "Neuroprotección 🧬": {
      protocol: "Protocolo de mantenimiento diario ininterrumpido.",
      longDescription: "Mitiga la neuroinflamación de bajo grado mientras potencia la resíntesis de ATP cerebral y el tono gabaérgica.",
      bestTime: "Mañana (09:00) o Noche (22:00).",
      synergyInfo: "El magnesio estabiliza la membrana neuronal facilitando la incorporación de DHA.",
      warnings: ["Resultados acumulativos (2-4 semanas)", "Asegurar pureza IFOS en Omega"],
      kinetics: [
        { label: 'Omega-3', color: '#FB7185', points: [50,50,50,50,50,50,50,50,85,98,95,95,95,95,95,95,95,95,95,95,95,95,95,95] },
        { label: 'Creatina', color: '#3B82F6', points: [40,40,40,40,40,40,40,40,70,90,95,95,95,95,95,95,95,95,95,95,95,95,95,95] },
        { label: 'Magnesio', color: '#A78BFA', points: [60,60,60,60,60,60,60,60,75,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85] }
      ]
    },
    "Focus Alpha 🧠": {
      protocol: "Ingesta matutina 30 min después de despertar.",
      longDescription: "Utiliza TeaCrine para una dopamina estable sin el crash de la cafeína, junto a Bacopa para la síntesis proteica neuronal.",
      bestTime: "Mañana (08:30 - 09:30).",
      synergyInfo: "La Uridina potencia la eficacia de la Bacopa al acelerar la reparación de membranas sinápticas.",
      warnings: ["Evitar tomas nocturnas", "Monitorizar irritabilidad", "Resultados en memoria tras 4 semanas"],
      kinetics: [
        { label: 'TeaCrine', color: '#3B82F6', points: [0,0,0,0,0,0,0,0,85,95,98,92,85,75,60,50,40,30,20,10,0,0,0,0] },
        { label: 'Bacopa', color: '#10B981', points: [40,40,40,40,40,40,40,40,50,65,70,75,80,80,80,80,80,80,80,80,80,80,80,80] },
        { label: 'Uridina', color: '#FF4D4F', points: [0,0,0,0,0,0,0,0,60,90,95,85,70,55,40,30,20,15,10,5,0,0,0,0] }
      ]
    }
  };

  const activeSupplement = useMemo(() => 
    selectedSupplementId ? supplements.find(s => s.id === selectedSupplementId) : null,
    [selectedSupplementId, supplements]
  );

  return (
    <div className="py-12 animate-fade-in space-y-16 max-w-[1440px] mx-auto px-4 sm:px-8">
      <div className="max-w-3xl">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-primary italic uppercase tracking-tighter mb-4 sm:6 leading-[0.9]">
          Sinergias <span className="text-indigo-600 dark:text-indigo-400">Moleculares</span>
        </h2>
        <p className="text-base sm:text-lg text-secondary font-medium leading-relaxed italic opacity-90 max-w-2xl">
          Protocolos diseñados para maximizar la biodisponibilidad y evitar antagonismos. Cada stack ha sido validado por nuestro motor de farmacocinética IA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
        {STACKS_MANIFEST.map((stack, idx) => (
          <StackCard 
            key={idx} 
            stack={stack} 
            onIngredientClick={handleIngredientClick}
            onActivateStack={() => onActivateStack(stack.ingredients)}
            isActive={isStackActive(stack.ingredients)}
            isSomeActive={isStackSomeActive(stack.ingredients)}
            isPremiumUser={isPremium}
            details={STACK_DETAILS_MAP[stack.name] || STACK_DETAILS_MAP["Modo 'Deep Work' 🚀"]}
            onAttemptUpgrade={onAttemptUpgrade}
            activeSuppIds={activeSuppIds}
            allSupplements={supplements}
          />
        ))}
      </div>

      {activeSupplement && (
        <SupplementDetailModal 
          supplement={activeSupplement} 
          onClose={() => setSelectedSupplementId(null)} 
          onVote={onVote}
          onRemoveVote={onRemoveVote}
          onToggleProtocol={onToggleProtocol}
          isActive={activeSuppIds.includes(activeSupplement.id)}
          isPremium={isPremium}
          isLoggedIn={true}
          onStartOnboarding={onStartOnboarding}
        />
      )}
    </div>
  );
};

export default StacksView;