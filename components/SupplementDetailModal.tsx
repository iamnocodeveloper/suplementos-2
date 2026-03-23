import React, { useEffect } from 'react';
import { Supplement, getCategoryStyle } from '../types';
import StarRating from './StarRating';
import { 
  X, AlertTriangle, Info, Sparkles, Microscope, Clock, ShieldAlert, BookOpen, 
  Leaf, WheatOff, FlaskConical, Sprout, Database, FileText, Users, Search,
  Activity, Zap, Target, ArrowDownCircle, ChevronRight, Play, Pause, Lock, ShieldX, Beaker, ExternalLink, ShoppingCart, Lightbulb
} from 'lucide-react';
import { soundService } from '../services/sound';
import { getEmoji } from './RankingView';

interface Props {
  supplement: Supplement;
  onClose: () => void;
  onVote: (id: string, rating: number) => void;
  onRemoveVote: (id: string) => void;
  onToggleProtocol?: (id: string) => void;
  isActive?: boolean;
  isPremium?: boolean;
  isLoggedIn?: boolean;
  onStartOnboarding?: () => void;
  onAttemptUpgrade?: () => void;
}

const SupplementDetailModal: React.FC<Props> = ({ 
  supplement, 
  onClose, 
  onVote, 
  onRemoveVote, 
  onToggleProtocol, 
  isActive, 
  isPremium,
  isLoggedIn,
  onStartOnboarding,
  onAttemptUpgrade
}) => {
  const style = getCategoryStyle(supplement.category);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleVote = (rating: number) => {
    if (!isPremium) {
      soundService.playClick();
      onAttemptUpgrade?.();
      return;
    }
    soundService.playClick();
    onVote(supplement.id, rating);
  };

  const handleToggle = () => {
    if (!isLoggedIn) {
      soundService.playClick();
      onStartOnboarding?.();
      return;
    }
    if (!isPremium) {
      soundService.playClick();
      onAttemptUpgrade?.();
      return;
    }
    if (onToggleProtocol) {
      onToggleProtocol(supplement.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
      <div 
        className="absolute inset-0 bg-black/70 dark:bg-black/95 backdrop-blur-2xl transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-background border border-slate-200 dark:border-border rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] dark:shadow-[0_0_100px_rgba(0,0,0,1)] animate-slide-up no-scrollbar transition-colors duration-500">
        
        {/* Header Inmersivo Optimizado */}
        <div className="relative h-80 overflow-hidden rounded-t-[2.5rem] border-b border-slate-100 dark:border-border">
          {/* Fondo dinámico según categoría */}
          <div className={`absolute inset-0 opacity-15 dark:opacity-25 ${style.bg} mix-blend-multiply dark:mix-blend-overlay`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 dark:via-black/40 to-white dark:to-background" />
          
          <div className="absolute top-6 right-6 z-30 flex gap-2">
            {onToggleProtocol && (
               <button 
                onClick={handleToggle}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-full border backdrop-blur-md transition-all font-black text-[10px] uppercase tracking-widest shadow-xl 
                  ${!isPremium 
                    ? 'bg-slate-100/80 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 cursor-pointer hover:bg-amber-500/10' 
                    : (isActive ? 'bg-amber-500 border-amber-400 text-black shadow-amber-500/40' : 'bg-white/90 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:scale-105 active:scale-95')
                  }`}
              >
                {!isPremium ? <Lock size={14} className="text-amber-500" /> : (isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />)}
                {isActive ? "Activo" : "Activar Protocolo"}
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-3 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 rounded-full text-slate-600 dark:text-secondary hover:text-indigo-600 dark:hover:text-white transition-all backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute bottom-8 left-8 right-8 z-20 flex items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-32 h-32 rounded-[2.5rem] ${style.bg} border-2 ${style.border} flex items-center justify-center text-7xl shadow-2xl group transition-transform duration-700 bg-white dark:bg-transparent ${isActive ? 'border-amber-500 shadow-amber-500/30 ring-4 ring-amber-500/10' : ''}`}>
                <span className="group-hover:scale-110 group-hover:rotate-3 transition-transform drop-shadow-lg">{getEmoji(supplement.name)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-[1.5px] rounded-full border-2 ${style.border} bg-black/10`}>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg bg-black ${style.text} ${style.border}`}>
                      {supplement.category}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {supplement.isVegan && <div className="p-1.5 rounded-lg bg-black text-emerald-500 border border-emerald-500/40 shadow-md" title="VEGANO"><Leaf size={14} /></div>}
                    {supplement.isGlutenFree && <div className="p-1.5 rounded-lg bg-black text-amber-500 border border-amber-500/40 shadow-md" title="SIN GLUTEN"><WheatOff size={14} /></div>}
                    <div className={`p-1.5 rounded-lg bg-black border border-white/10 shadow-md ${supplement.origin === 'Natural' ? 'text-indigo-400' : 'text-purple-400'}`} title={`ORIGEN ${supplement.origin.toUpperCase()}`}>
                      {supplement.origin === 'Natural' ? <Sprout size={14} /> : <FlaskConical size={14} />}
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <h2 className={`
                    text-6xl font-black uppercase italic tracking-tighter leading-[0.85] pr-8 mb-4 
                    bg-clip-text text-transparent bg-gradient-to-br 
                    from-slate-950 via-slate-800 to-slate-500 
                    dark:from-white dark:via-white dark:to-white/40 
                    drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_4px_12px_rgba(0,0,0,1)] 
                    ${isActive ? 'from-amber-400 via-amber-500 to-amber-700 dark:from-amber-300 dark:to-amber-600' : ''}
                  `}>
                    {supplement.name}
                  </h2>
                  <div className={`w-full h-1.5 rounded-full mb-3 ${isActive ? 'bg-amber-500 shadow-amber-500/20' : 'bg-slate-200 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-transparent'}`}></div>
                </div>

                <div className="flex items-center gap-5 text-[11px] text-slate-500 dark:text-secondary font-black uppercase tracking-widest italic">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-indigo-600 dark:text-indigo-500" />
                    <span>Score Clínico: {supplement.scientificScore}/100</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 dark:bg-border/40" />
                  <div className="flex items-center gap-2">
                    <StarRating rating={supplement.rating} size={14} />
                    <span className="text-[10px] text-slate-700 dark:text-white">{supplement.rating.toFixed(1)} Community</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cuerpo de la Ficha */}
        <div className="p-10 space-y-16">
          
          {/* Mecanismo e Insights - Ajuste de Altura y Alineación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            <section className="flex flex-col space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-600/20 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-500">
                  <Zap size={22} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-primary uppercase italic tracking-tighter leading-none">Mecanismo Bio-Celular</h3>
              </div>
              <div className="flex-1 p-8 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700">
                  <Beaker size={120} />
                </div>
                <p className="text-lg text-slate-700 dark:text-secondary font-semibold leading-relaxed italic relative z-10 mb-8">
                  {supplement.mechanism || "Analizando farmacocinética molecular... Este compuesto interactúa con las rutas metabólicas primarias para optimizar la síntesis de energía y regeneración celular."}
                </p>
                <div className="flex flex-wrap gap-2 relative z-10 mt-auto pt-6 border-t border-slate-200 dark:border-white/10">
                  {supplement.goalTags.map(tag => (
                    <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white dark:bg-black/60 border border-slate-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex flex-col space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-600/5 dark:bg-amber-500/10 rounded-xl border border-amber-600/20 dark:border-amber-500/20 text-amber-600 dark:text-amber-500">
                  <Sparkles size={22} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-primary uppercase italic tracking-tighter leading-none">Insights de Laboratorio</h3>
              </div>
              <div className="flex-1 p-8 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-inner group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-[0.03] -rotate-12 group-hover:scale-110 transition-transform duration-700">
                  <Lightbulb size={120} />
                </div>
                <ul className="space-y-5 relative z-10">
                  {(supplement.curiosities || [
                    "Considerado el 'Gold Standard' en su categoría biológica.",
                    "Sinergia documentada con protocolos de optimización mitocondrial.",
                    "Evidencia Grado A por el Instituto de Biohacking Global."
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-lg text-slate-700 dark:text-secondary font-bold italic leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Enlace de Afiliado Si existe - Spacing Garantizado */}
          {supplement.affiliateLink && (
            <div className="relative group/affiliate pt-4">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 blur-2xl opacity-50 group-hover/affiliate:opacity-100 transition-opacity" />
              <a 
                href={supplement.affiliateLink} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => soundService.playClick()}
                className="relative flex flex-col md:flex-row items-center justify-between p-10 bg-slate-900 border-2 border-amber-500/40 rounded-[3rem] shadow-2xl hover:border-amber-500 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-6 mb-6 md:mb-0">
                  <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                    <ShoppingCart size={32} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Adquirir Grado Médico</h3>
                    <p className="text-[11px] text-amber-500/80 font-black uppercase tracking-widest italic">Pureza garantizada y validada por protocolo S.I.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-amber-500 text-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] text-sm shadow-xl group-hover/affiliate:bg-amber-400">
                  VER EN AMAZON <ExternalLink size={18} />
                </div>
              </a>
            </div>
          )}

          {/* Riesgos e Interacciones */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600/5 dark:bg-red-500/10 rounded-xl border border-red-600/20 dark:border-red-500/20 text-red-600 dark:text-red-500">
                <ShieldX size={22} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-primary uppercase italic tracking-tighter leading-none">Riesgos e Interacciones</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-500 mb-6">
                  <AlertTriangle size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Contraindicaciones Críticas</span>
                </div>
                <div className="space-y-4">
                  {(supplement.contraindications || ["Ninguna interacción mayor documentada para individuos sanos."]).map((item, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-black/40 border border-red-100 dark:border-red-900/20 rounded-2xl text-sm font-bold text-slate-700 dark:text-red-200/70 italic shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 mb-6">
                  <ShieldAlert size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Precauciones de Uso</span>
                </div>
                <div className="space-y-4">
                  {(supplement.warnings || ["Mantener niveles de hidratación óptimos.", "Monitorizar respuesta sistémica la primera semana."]).map((item, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-black/40 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-sm font-bold text-slate-700 dark:text-amber-200/70 italic shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Análisis Clínico */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-600/20 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-500">
                <Microscope size={22} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-primary uppercase italic tracking-tighter leading-none">Rigor Bibliométrico</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Publicaciones', val: supplement.studiesCount.toLocaleString(), icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-500/20' },
                { label: 'Human Trials', val: (supplement.humanTrialsCount || 0).toLocaleString(), icon: Users, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20' },
                { label: 'Meta-Análisis', val: supplement.metaAnalysisCount || 0, icon: Search, color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-500/20' },
                { label: 'Bio-Score IA', val: `${supplement.scientificScore}%`, icon: Database, color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-500/20' }
              ].map((stat, i) => (
                <div key={i} className={`bg-slate-50 dark:bg-black/60 border-2 ${stat.border} p-6 rounded-[2.5rem] flex flex-col items-center text-center hover:bg-white dark:hover:bg-black transition-all group shadow-sm backdrop-blur-sm`}>
                  <stat.icon size={26} className={`${stat.color} mb-4 group-hover:scale-110 transition-transform`} />
                  <div className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 leading-none tabular-nums italic">{stat.val}</div>
                  <div className="text-[10px] font-black text-slate-500 dark:text-secondary/60 uppercase tracking-[0.2em] italic">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Dosificación y Comunidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500">
                <Clock size={22} />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Dosificación Óptima</h3>
              </div>
              <div className="p-8 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/40 rounded-[3rem] flex flex-col justify-center min-h-[180px] shadow-sm relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-[0.05] dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <Activity size={160} />
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 text-2xl font-black italic text-center leading-relaxed relative z-10">
                  "{supplement.recommendedDosage}"
                </div>
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-8 font-black opacity-60 relative z-10 italic">
                  * Basado en consenso de farmacología humana.
                </p>
              </div>
            </div>

            <section className={`p-8 rounded-[3rem] border-2 shadow-sm relative overflow-hidden text-center bg-black ${style.border} flex flex-col justify-center min-h-[180px]`}>
               <div className="relative z-10 flex flex-col items-center">
                 <div className="flex items-center gap-3 mb-8">
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Eficacia Comunidad PRO</h3>
                   {!isPremium && <Lock size={20} className="text-amber-500 animate-pulse" />}
                 </div>
                 <div className="mb-8 scale-[1.75] transform transition-transform">
                   <StarRating 
                      rating={supplement.userVote !== undefined ? supplement.userVote : supplement.rating}
                      interactive={isPremium}
                      onVote={handleVote}
                      size={32}
                   />
                 </div>
                 {isPremium ? (
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-60">
                      {supplement.votes} Evaluaciones Científico-Técnicas
                    </p>
                 ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] italic">Votación Reservada para Miembros PRO</span>
                      <p className="text-[9px] font-black text-slate-50 uppercase tracking-[0.1em] italic opacity-40">
                        {supplement.votes} Evaluaciones registradas
                      </p>
                    </div>
                 )}
               </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupplementDetailModal;