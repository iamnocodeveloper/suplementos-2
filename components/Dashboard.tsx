import React, { useState, useMemo, useEffect } from 'react';
import { UserPreferences, Supplement, getCategoryStyle, PremiumTag } from '../types';
import { 
  Zap, Activity, Calendar, CheckCircle2, 
  Circle, Play, Pause, TrendingUp, 
  ShieldCheck, Flame, Brain,
  Sparkles, Clock, LayoutGrid,
  Layers, Rocket, Moon, Shield,
  TriangleAlert, RefreshCw, ShieldAlert, AlertOctagon, Timer,
  Check, Bell, Target, Award, ListFilter, Gauge, Power, Save, Trash2,
  Square, CheckSquare, PowerOff, XCircle, PlusCircle, ChevronRight, Settings,
  History, ArrowLeft, ArrowUpRight, TrendingDown, Eraser, CalendarDays, Info, HeartPulse, Droplets, FlaskConical, Wind
} from 'lucide-react';
import { soundService } from '../services/sound';
import { getEmoji } from './RankingView';
import SupplementDetailModal from './SupplementDetailModal';

interface Props {
  preferences: UserPreferences;
  supplements: Supplement[];
  activeSuppIds: string[];
  onToggleActivity: (id: string) => void;
  onSyncProtocols?: (ids: string[]) => void;
  onVote: (id: string, rating: number) => void;
  onRemoveVote: (id: string) => void;
  onActivateStack: (ingredients: string[]) => void;
  onStartOnboarding: () => void;
}

export const STACKS_MANIFEST = [
  // --- PUBLIC STACKS ---
  { 
    name: "Modo 'Deep Work' 🚀", 
    ingredients: ['Cafeína Anhidra', 'L-Teanina', 'Creatina Monohidrato'], 
    time: "08:30 AM", 
    icon: <Rocket />, 
    color: "#3B82F6", 
    category: "Salud mental y cognitiva",
    label: "FOCO",
    isPremium: false
  },
  { 
    name: "Hibernación Profunda 💤", 
    ingredients: ['Magnesio (Glicinato)', 'Vitamina D3', 'Ashwagandha'], 
    time: "22:00 PM", 
    icon: <Moon />, 
    color: "#3B82F6", 
    category: "Salud mental y cognitiva",
    label: "SUEÑO",
    isPremium: false
  },
  { 
    name: "Pre-Workout 'Pump' 💪", 
    ingredients: ['Malato de Citrulina', 'Creatina Monohidrato', 'Beta-Alanina'], 
    time: "18:00 PM", 
    icon: <Zap />, 
    color: "#FF4D4F", 
    category: "Rendimiento físico y deportivo",
    label: "POTENCIA",
    isPremium: false
  },
  { 
    name: "Escudo Inmune 🛡️", 
    // SELECCIÓN ESPECÍFICA: Zinc picolinato por su mejor perfil para inmunidad general vs carnosina
    ingredients: ['Vitamina D3', 'Omega-3 (EPA/DHA)', 'Zinc picolinato'], 
    time: "14:30 PM", 
    icon: <Shield />, 
    color: "#10B981", 
    category: "Salud general",
    label: "INMUNIDAD",
    isPremium: false
  },
  { 
    name: "Neuroprotección 🧬", 
    ingredients: ['Omega-3 (EPA/DHA)', 'Creatina Monohidrato', 'Magnesio (Glicinato)'], 
    time: "09:00 AM", 
    icon: <Brain />, 
    color: "#3B82F6", 
    category: "Salud mental y cognitiva",
    label: "LONGEVIDAD",
    isPremium: false
  },

  // --- PREMIUM STACKS ---
  { 
    name: "Focus Alpha 🧠", 
    ingredients: ['Theacrine (TeaCrine®)', 'Uridina monofosfato', 'Bacopa Monnieri'], 
    time: "08:00 AM", 
    icon: <Target />, 
    color: "#3B82F6", 
    category: "Salud mental y cognitiva",
    label: "FOCO",
    isPremium: true
  },
  { 
    name: "Inflamación Cero 🛡", 
    ingredients: ['Astaxantina liposomal', 'HydroCurc®', 'Omega-3 (EPA/DHA)'], 
    time: "14:00 PM", 
    icon: <ShieldAlert />, 
    color: "#10B981", 
    category: "Salud general",
    label: "INMUNIDAD",
    isPremium: true
  },
  { 
    name: "Testo BioMax 💪", 
    ingredients: ['Tongkat Ali (Longjack)', 'Zinc picolinato', 'Shilajit (estandarizado)'], 
    time: "09:00 AM", 
    icon: <Activity />, 
    color: "#D946EF", 
    category: "Salud hormonal y sexual",
    label: "HORMONAL",
    isPremium: true
  },
  { 
    name: "Reset Circadiano 🌙", 
    ingredients: ['Melatonina sublingual liposomal', 'Magnesio (Glicinato)', 'L-Teanina'], 
    time: "22:30 PM", 
    icon: <Moon />, 
    color: "#3B82F6", 
    category: "Salud mental y cognitiva",
    label: "SUEÑO",
    isPremium: true
  },
  { 
    name: "Antiaging Mito Boost ♻️", 
    ingredients: ['Urolitina A', 'PQQ', 'Nicotinamida ribósido'], 
    time: "08:30 AM", 
    icon: <RefreshCw />, 
    color: "#06B6D4", 
    category: "Longevidad y biohacking",
    label: "MITO-GEN",
    isPremium: true
  },
  { 
    name: "Metabolic Engine 🔥", 
    ingredients: ['Berberina', 'Extracto de té verde (EGCG)', 'Capsaicina microencapsulada'], 
    time: "13:30 PM", 
    icon: <Flame />, 
    color: "#F97316", 
    category: "Digestión y metabolismo",
    label: "METABOLISMO",
    isPremium: true
  },
  { 
    name: "Skin Radiance Pro 💊", 
    ingredients: ['Ácido hialurónico oral', 'MSM (metilsulfonilmetano)', 'Astaxantina liposomal'], 
    time: "10:00 AM", 
    icon: <Sparkles />, 
    color: "#FF6F91", 
    category: "Belleza y estética",
    label: "BELLEZA",
    isPremium: true
  },
  { 
    name: "CardioShield 🫀", 
    ingredients: ['Extracto de corteza de pino (Picnogenol)', 'Beetroot nitrato cristalizado', 'Coenzima Q10'], 
    time: "09:30 AM", 
    icon: <HeartPulse />, 
    color: "#10B981", 
    category: "Salud general",
    label: "VASCULAR",
    isPremium: true
  },
  { 
    name: "Cerebro Flex 🧬", 
    ingredients: ['7,8-DHF (Dihidroxiflavona)', 'Alpha-GPC', 'Rhodiola Rosea'], 
    time: "08:45 AM", 
    icon: <Brain />, 
    color: "#3B82F6", 
    category: "Salud mental y cognitiva",
    label: "AGILIDAD",
    isPremium: true
  },
  { 
    name: "Hormonal Balance 🛠", 
    ingredients: ['Mio-Inositol', 'Vitex Agnus Castus', 'Calcio D Glucarato'], 
    time: "11:00 AM", 
    icon: <Wind />, 
    color: "#D946EF", 
    category: "Salud hormonal y sexual",
    label: "MUJER",
    isPremium: true
  }
];

const SHORT_NAMES: Record<PremiumTag, string> = {
  'Rendimiento físico y deportivo': 'Rendimiento',
  'Salud mental y cognitiva': 'Mental',
  'Salud general': 'General',
  'Salud hormonal y sexual': 'Hormonal',
  'Belleza y estética': 'Belleza',
  'Digestión y metabolismo': 'Digestión',
  'Longevidad y biohacking': 'Longevidad'
};

const BIO_INCOMPATIBILITIES = [
  { ids: ['5', '8'], label: 'Cafeína + Melatonina', reason: 'Antagonismo funcional: El estímulo de la cafeína anula el inicio del ciclo de sueño inducido por la melatonina.', severity: 'high' },
  { ids: ['13', '11'], label: 'Zinc + Magnesio', reason: 'Competencia Mineral: Dosis elevadas de Zinc compiten por los mismos transportadores intestinales que el Magnesio.', severity: 'medium' },
  { ids: ['22', '23'], label: 'Berberina + NMN', reason: 'Activación AMPK Extrema: Posible sinergia hipoglucémica excesiva. Monitorear niveles de glucosa.', severity: 'medium' },
  { ids: ['15', '8'], label: 'Ashwagandha + Melatonina', reason: 'Sinergia Gabaérgica: Puede provocar una sedación excesiva o letargo residual al despertar.', severity: 'medium' },
  { ids: ['5', '15'], label: 'Cafeína + Ashwagandha', reason: 'Choque de Cortisol: Efectos contrapuestos sobre la respuesta al estrés que pueden reducir el foco cognitivo.', severity: 'low' }
];

const getLocalDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSaturationColor = (score: number): string => {
  if (score >= 80) return 'bg-emerald-600';
  if (score >= 50) return 'bg-amber-600';
  return 'bg-[#E63946]';
};

const Dashboard: React.FC<Props> = ({ 
  preferences,
  supplements, 
  activeSuppIds, 
  onSyncProtocols,
  onToggleActivity,
  onVote,
  onRemoveVote,
  onActivateStack,
  onStartOnboarding
}) => {
  const today = new Date();
  const todayStr = getLocalDateStr(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const selectedDateStr = getLocalDateStr(selectedDate);
  const isViewingToday = selectedDateStr === todayStr;
  const [showYearlyCalendar, setShowYearlyCalendar] = useState(false);
  const [selectedSupId, setSelectedSupId] = useState<string | null>(null);

  const [stagedIds, setStagedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('SI_DASHBOARD_STAGED');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('SI_DASHBOARD_STAGED', JSON.stringify(stagedIds));
  }, [stagedIds]);

  const weeklyDates = useMemo(() => {
    const dates = [];
    const current = new Date();
    const day = current.getDay() || 7;
    if (day !== 1) current.setDate(current.getDate() - (day - 1));
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  const [dailyLogs, setDailyLogs] = useState<Record<string, { takenIds: string[], takenStackNames: string[], activeSnapshot: string[] }>>(() => {
    const saved = localStorage.getItem('SI_SUPPLEMENT_LOGS');
    return saved ? JSON.parse(saved) : {};
  });

  const currentLog = useMemo(() => {
    return dailyLogs[selectedDateStr] || { takenIds: [], takenStackNames: [], activeSnapshot: isViewingToday ? activeSuppIds : [] };
  }, [dailyLogs, selectedDateStr, isViewingToday, activeSuppIds]);

  useEffect(() => {
    if (isViewingToday) {
      setDailyLogs(prev => {
        const existing = prev[todayStr] || { takenIds: [], takenStackNames: [], activeSnapshot: [] };
        if (JSON.stringify(existing.activeSnapshot) === JSON.stringify(activeSuppIds)) return prev;
        
        return {
          ...prev,
          [todayStr]: {
            ...existing,
            activeSnapshot: activeSuppIds
          }
        };
      });
    }
  }, [activeSuppIds, isViewingToday, todayStr]);

  useEffect(() => {
    localStorage.setItem('SI_SUPPLEMENT_LOGS', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  const calculateEfficiency = (targetIds: string[]) => {
    if (targetIds.length === 0) return 0;
    
    const targetSupps = supplements.filter(s => targetIds.includes(s.id));
    const avgScore = targetSupps.reduce((sum, s) => sum + s.scientificScore, 0) / targetSupps.length;
    
    const fullStacksCount = STACKS_MANIFEST.filter(stack => {
      const stackSuppIds = supplements
        .filter(s => stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase())))
        .map(s => s.id);
      return stackSuppIds.length > 0 && stackSuppIds.every(id => targetIds.includes(id));
    }).length;

    const conflicts = BIO_INCOMPATIBILITIES.filter(conflict => 
      conflict.ids.every(id => targetIds.includes(id))
    ).length;

    const synergyBonus = fullStacksCount * 5;
    const conflictPenalty = conflicts * 12;

    return Math.max(0, Math.min(100, Math.round(avgScore + synergyBonus - conflictPenalty)));
  };

  // IDs Requeridos por stacks que van a permanecer activos (Protección inteligente)
  const requiredIds = useMemo(() => {
    if (!isViewingToday) return new Set<string>();
    
    // Suplementos que el usuario ha marcado para apagar
    const idsToTryDeactivate = stagedIds.filter(id => activeSuppIds.includes(id));
    
    // Identificamos stacks que sobreviven (los que estaban activos y no se están apagando por completo)
    const remainingActiveStacks = STACKS_MANIFEST.filter(stack => {
      const stackSupps = supplements.filter(s => 
        stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase()))
      );
      const stackIds = stackSupps.map(s => s.id);
      const wasActive = stackIds.length > 0 && stackIds.every(id => activeSuppIds.includes(id));
      
      // Un stack sobrevive si NO se ha seleccionado el apagado de TODOS sus componentes
      const isBeingTurnedOffCompletely = stackIds.length > 0 && stackIds.every(id => idsToTryDeactivate.includes(id));
      
      return wasActive && !isBeingTurnedOffCompletely;
    });

    // Extraemos todos los suplementos vitales para esos stacks supervivientes
    return new Set(remainingActiveStacks.flatMap(stack => {
      const stackSupps = supplements.filter(s => 
        stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase()))
      );
      return stackSupps.map(s => s.id);
    }));
  }, [stagedIds, activeSuppIds, supplements, isViewingToday]);

  const currentTargetIds = useMemo(() => {
    if (!isViewingToday) return currentLog.activeSnapshot || [];
    
    const stagedAdditions = stagedIds.filter(id => !activeSuppIds.includes(id));
    const idsToTryDeactivate = stagedIds.filter(id => activeSuppIds.includes(id));
    
    // Solo permitimos desactivar lo que no esté protegido por otro stack remanente
    const trulyDeactivated = idsToTryDeactivate.filter(id => !requiredIds.has(id));
    
    return activeSuppIds
      .filter(id => !trulyDeactivated.includes(id))
      .concat(stagedAdditions);
  }, [activeSuppIds, stagedIds, isViewingToday, currentLog.activeSnapshot, requiredIds]);

  const efficiencyMetrics = useMemo(() => {
    const activeButNotOff = isViewingToday 
      ? activeSuppIds.filter(id => !stagedIds.includes(id) || requiredIds.has(id))
      : currentLog.activeSnapshot || [];

    const currentScore = calculateEfficiency(activeButNotOff);
    const projectedScore = calculateEfficiency(currentTargetIds);

    return {
      current: currentScore,
      projected: projectedScore,
      diff: projectedScore - currentScore
    };
  }, [supplements, activeSuppIds, stagedIds, isViewingToday, currentLog.activeSnapshot, currentTargetIds, requiredIds]);

  const activeConflicts = useMemo(() => {
    const conflictsFound: typeof BIO_INCOMPATIBILITIES = [];
    BIO_INCOMPATIBILITIES.forEach(conflict => {
      const match = conflict.ids.every(id => currentTargetIds.includes(id));
      if (match) conflictsFound.push(conflict);
    });
    return conflictsFound;
  }, [currentTargetIds]);

  const visibleSupplementsInTable = useMemo(() => {
    const idsToShow = isViewingToday 
      ? Array.from(new Set([...activeSuppIds, ...stagedIds]))
      : currentLog.activeSnapshot || [];
    return supplements.filter(s => idsToShow.includes(s.id));
  }, [supplements, activeSuppIds, stagedIds, isViewingToday, currentLog.activeSnapshot]);

  const visibleStacksInTable = useMemo(() => {
    const idsToShow = isViewingToday 
      ? Array.from(new Set([...activeSuppIds, ...stagedIds]))
      : currentLog.activeSnapshot || [];

    return STACKS_MANIFEST.filter(stack => {
      const stackSuppIds = supplements
        .filter(s => stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase())))
        .map(s => s.id);
      if (stackSuppIds.length === 0) return false;
      return stackSuppIds.every(id => idsToShow.includes(id));
    });
  }, [supplements, activeSuppIds, stagedIds, isViewingToday, currentLog.activeSnapshot]);

  const toggleIntake = (id: string) => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    soundService.playClick();
    setDailyLogs(prev => {
      const dayLog = prev[selectedDateStr] || { takenIds: [], takenStackNames: [], activeSnapshot: activeSuppIds };
      const isMarkingAsTaken = !dayLog.takenIds.includes(id);
      const newTaken = isMarkingAsTaken
        ? [...dayLog.takenIds, id] 
        : dayLog.takenIds.filter(i => i !== id);
      
      let newTakenStacks = [...dayLog.takenStackNames];
      if (!isMarkingAsTaken) {
        newTakenStacks = newTakenStacks.filter(stackName => {
          const stack = STACKS_MANIFEST.find(sm => sm.name === stackName);
          if (!stack) return true;
          const stackIds = supplements
            .filter(s => stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase())))
            .map(s => s.id);
          return !stackIds.includes(id);
        });
      } else {
        visibleStacksInTable.forEach(stack => {
          const stackIds = supplements
            .filter(s => stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase())))
            .map(s => s.id);
          const allTaken = stackIds.every(sid => sid === id || newTaken.includes(sid));
          const isTrulyActive = stackIds.every(sid => activeSuppIds.includes(sid) && (!stagedIds.includes(sid) || requiredIds.has(sid)));
          if (allTaken && isTrulyActive && !newTakenStacks.includes(stack.name)) {
            newTakenStacks.push(stack.name);
          }
        });
      }

      return {
        ...prev,
        [selectedDateStr]: { ...dayLog, takenIds: newTaken, takenStackNames: newTakenStacks }
      };
    });
  };

  const toggleStackIntake = (name: string) => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    
    const stack = STACKS_MANIFEST.find(s => s.name === name);
    if (!stack) return;

    const stackSupps = supplements.filter(s => stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase())));
    const isTrulyActive = stackSupps.every(s => activeSuppIds.includes(s.id) && (!stagedIds.includes(s.id) || requiredIds.has(s.id)));
    
    if (!isTrulyActive) return;

    soundService.playClick();
    const stackSuppIds = stackSupps.map(s => s.id);

    setDailyLogs(prev => {
      const dayLog = prev[selectedDateStr] || { takenIds: [], takenStackNames: [], activeSnapshot: activeSuppIds };
      const isMarkingAsTaken = !dayLog.takenStackNames.includes(name);
      
      const newTakenStacks = isMarkingAsTaken
        ? [...dayLog.takenStackNames, name]
        : dayLog.takenStackNames.filter(n => n !== name);

      let newTakenIds = [...dayLog.takenIds];
      if (isMarkingAsTaken) {
        stackSuppIds.forEach(id => {
          if (!newTakenIds.includes(id)) newTakenIds.push(id);
        });
      } else {
        newTakenIds = newTakenIds.filter(id => !stackSuppIds.includes(id));
      }

      return {
        ...prev,
        [selectedDateStr]: { ...dayLog, takenIds: newTakenIds, takenStackNames: newTakenStacks }
      };
    });
  };

  const toggleStaged = (id: string) => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    soundService.playClick();
    setStagedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleIndividualNow = (id: string) => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    const isActive = activeSuppIds.includes(id);
    const isStaged = stagedIds.includes(id);
    
    if (!isActive) {
      soundService.playClick();
      onToggleActivity(id);
      setStagedIds(prev => prev.filter(i => i !== id));
    } else if (isStaged) {
      soundService.playClick();
      setStagedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleToggleStackNow = (ingredients: string[]) => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    
    const stackIds = supplements
      .filter(s => ingredients.some(name => s.name.toLowerCase().includes(name.toLowerCase())))
      .map(s => s.id);
    
    const allActive = stackIds.every(id => activeSuppIds.includes(id));
    const anyStagedToRemove = stackIds.some(id => stagedIds.includes(id) && activeSuppIds.includes(id));
    
    if (!allActive) {
      soundService.playClick();
      onActivateStack(ingredients);
      setStagedIds(prev => prev.filter(id => !stackIds.includes(id)));
    } else if (anyStagedToRemove) {
      soundService.playClick();
      setStagedIds(prev => prev.filter(id => !stackIds.includes(id)));
    } else {
      // Si está todo activo y no hay nada en stage, lo apagamos con la lógica inteligente de App.tsx
      onActivateStack(ingredients);
    }
  };

  const clearStaged = () => {
    if (!isViewingToday || stagedIds.length === 0) return;
    soundService.playClick();
    setStagedIds([]);
  };

  const toggleStagedStack = (ingredients: string[]) => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    soundService.playClick();
    const stackIds = supplements
      .filter(s => ingredients.some(name => s.name.toLowerCase().includes(name.toLowerCase())))
      .map(s => s.id);
    
    setStagedIds(prev => {
      const allIn = stackIds.every(id => prev.includes(id));
      const next = new Set(prev);
      if (allIn) stackIds.forEach(id => next.delete(id));
      else stackIds.forEach(id => next.add(id));
      return Array.from(next);
    });
  };

  const commitActivation = () => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    soundService.playClick();
    const toActivate = stagedIds.filter(id => !activeSuppIds.includes(id));
    if (toActivate.length === 0) return;

    const nextActive = [...new Set([...activeSuppIds, ...toActivate])];
    if (onSyncProtocols) {
      onSyncProtocols(nextActive);
      setStagedIds(prev => prev.filter(id => !toActivate.includes(id)));
    }
  };

  const handleApagarProtocolo = () => {
    if (!isViewingToday) return;
    if (!preferences.isLoggedIn) {
       onStartOnboarding();
       return;
    }
    soundService.playClick();
    
    const idsToTryDeactivate = stagedIds.filter(id => activeSuppIds.includes(id));
    if (idsToTryDeactivate.length === 0) return;

    // Lógica inteligente: Solo apagamos lo que no esté marcado como requerido por otro stack remanente
    const trulyDeactivated = idsToTryDeactivate.filter(id => !requiredIds.has(id));
    const nextActive = activeSuppIds.filter(id => !trulyDeactivated.includes(id));

    if (onSyncProtocols) {
      onSyncProtocols(nextActive);
      // Limpiamos de la mesa de carga todos los que intentamos apagar
      setStagedIds(prev => prev.filter(id => !idsToTryDeactivate.includes(id)));
    }
  };

  const handleIngredientClick = (name: string) => {
    soundService.playClick();
    const found = supplements.find(s => 
      s.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(s.name.toLowerCase())
    );
    if (found) {
      setSelectedSupId(found.id);
    }
  };

  const structuralHealthScore = useMemo(() => {
    const totalPresent = currentTargetIds.length;
    if (totalPresent === 0) return 0;
    let score = 100;
    if (totalPresent > 6) score -= (totalPresent - 6) * 5;
    score -= activeConflicts.length * 15;
    return Math.max(0, Math.min(100, score));
  }, [currentTargetIds, activeConflicts]);

  const adherencePercent = useMemo(() => {
    const totalItems = currentTargetIds.length + visibleStacksInTable.filter(s => {
       const stackSuppIds = supplements
        .filter(sup => s.ingredients.some(ing => sup.name.toLowerCase().includes(ing.toLowerCase())))
        .map(sup => sup.id);
       return stackSuppIds.every(id => currentTargetIds.includes(id));
    }).length;

    if (totalItems === 0) return 0;

    const loggedSupps = currentLog.takenIds.filter(id => currentTargetIds.includes(id)).length;
    const loggedStacks = currentLog.takenStackNames.filter(name => {
        const stack = STACKS_MANIFEST.find(sm => sm.name === name);
        if (!stack) return false;
        const stackSuppIds = supplements
          .filter(sup => stack.ingredients.some(ing => sup.name.toLowerCase().includes(ing.toLowerCase())))
          .map(sup => sup.id);
        return stackSuppIds.every(id => currentTargetIds.includes(id));
    }).length;

    return Math.min(100, Math.round(((loggedSupps + loggedStacks) / totalItems) * 100));
  }, [currentLog, currentTargetIds, visibleStacksInTable, supplements]);

  const yearlyData = useMemo(() => {
    const months = [];
    const year = today.getFullYear();
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const monthDays = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, m, d);
        const dateStr = getLocalDateStr(date);
        monthDays.push({ date, dateStr, log: dailyLogs[dateStr] });
      }
      months.push({ name: new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(year, m)), days: monthDays });
    }
    return months;
  }, [dailyLogs, today]);

  const activeSupDetail = useMemo(() => 
    selectedSupId ? supplements.find(s => s.id === selectedSupId) : null,
    [selectedSupId, supplements]
  );

  return (
    <div className="py-12 animate-fade-in space-y-12 pb-32 max-w-[1440px] mx-auto px-4 sm:px-8 transition-colors duration-500">
      
      {/* BARRA SEMANAL HISTÓRICA / ANUAL */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <History className="text-amber-600 dark:text-amber-500" size={20} />
                <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">Bio-Cronología</h3>
              </div>
              <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl border border-slate-300 dark:border-white/5 shadow-inner">
                 <button 
                  onClick={() => { soundService.playClick(); setShowYearlyCalendar(false); }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!showYearlyCalendar ? 'bg-amber-500 text-black shadow-lg' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}
                 >
                   Semanal
                 </button>
                 <button 
                  onClick={() => { soundService.playClick(); setShowYearlyCalendar(true); }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showYearlyCalendar ? 'bg-amber-500 text-black shadow-lg' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}
                 >
                   Anual
                 </button>
              </div>
           </div>
           {!isViewingToday && (
              <button 
                onClick={() => { soundService.playClick(); setSelectedDate(today); }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all shadow-sm"
              >
                <ArrowLeft size={14} /> Volver a Tiempo Real
              </button>
           )}
        </div>

        {showYearlyCalendar ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {yearlyData.map((month, mIdx) => (
              <div key={mIdx} className="bg-surface border-2 border-border/80 rounded-[1.5rem] p-4 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-4 italic text-center border-b border-border pb-2">{month.name}</h4>
                <div className="grid grid-cols-7 gap-1">
                  {month.days.map((day, dIdx) => {
                    const isSelected = day.dateStr === selectedDateStr;
                    const isFuture = day.date > today;
                    const log = day.log;
                    const hasActivity = log && log.activeSnapshot && log.activeSnapshot.length > 0;
                    const dayAdherence = log ? (log.activeSnapshot.length === 0 ? 0 : Math.round((log.takenIds.length / log.activeSnapshot.length) * 100)) : 0;
                    
                    return (
                      <button
                        key={dIdx}
                        disabled={isFuture}
                        onClick={() => { soundService.playClick(); setSelectedDate(day.date); }}
                        className={`
                          aspect-square rounded-md text-[8px] font-black flex items-center justify-center transition-all relative border
                          ${isSelected ? 'ring-2 ring-amber-500 z-10 border-amber-500' : 'border-transparent'}
                          ${isFuture ? 'opacity-5 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-500/10'}
                          ${!hasActivity && !isFuture ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-secondary/40' : ''}
                          ${hasActivity && dayAdherence === 100 ? 'bg-emerald-600/60 border-emerald-600/80 text-white' : ''}
                          ${hasActivity && dayAdherence < 100 && dayAdherence > 0 ? 'bg-amber-600/60 border-amber-600/80 text-white' : ''}
                          ${hasActivity && dayAdherence === 0 ? 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-amber-500/20 text-slate-800 dark:text-white' : ''}
                        `}
                        title={`${day.dateStr} - Adherencia: ${dayAdherence}%`}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3 animate-fade-in">
            {weeklyDates.map((date, i) => {
              const dateStr = getLocalDateStr(date);
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === todayStr;
              const log = dailyLogs[dateStr];
              const hasActivity = log && log.activeSnapshot && log.activeSnapshot.length > 0;
              const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
              const dayNum = date.getDate();

              const dayAdherence = log ? (log.activeSnapshot.length === 0 ? 0 : Math.round((log.takenIds.length / log.activeSnapshot.length) * 100)) : 0;

              return (
                <button 
                  key={i}
                  onClick={() => { soundService.playClick(); setSelectedDate(new Date(date)); }}
                  className={`
                    relative p-4 rounded-[1.5rem] border-2 flex flex-col items-center justify-center gap-2 transition-all duration-500 overflow-hidden
                    ${isSelected ? 'bg-amber-500/15 border-amber-600 shadow-lg' : 'bg-surface border-border/80 hover:border-amber-500/40'}
                    ${!hasActivity && !isToday ? 'opacity-50 grayscale shadow-inner' : 'opacity-100 shadow-sm'}
                  `}
                >
                  <span className={`text-[10px] font-black tracking-widest ${isSelected ? 'text-amber-700 dark:text-amber-500' : 'text-secondary'}`}>{dayName}</span>
                  <span className={`text-3xl font-black italic tracking-tighter ${isSelected ? 'text-primary' : 'text-primary/70'}`}>{dayNum}</span>
                  {hasActivity && (
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden shadow-inner border border-black/5">
                      <div className={`h-full bg-amber-600 dark:bg-amber-500 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.6)]`} style={{ width: `${dayAdherence}%` }} />
                    </div>
                  )}
                  {isToday && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-600 animate-pulse shadow-[0_0_10px_#D97706]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* BIO-HUD CUMPLIMIENTO CIRCULAR */}
      <div className={`p-6 md:p-10 rounded-[3rem] border-2 backdrop-blur-2xl transition-all duration-1000 relative flex flex-col md:flex-row items-center gap-12 shadow-xl ${adherencePercent === 100 ? 'bg-emerald-600/[0.05] border-emerald-600/50 shadow-emerald-600/10' : 'bg-amber-600/[0.05] border-amber-600/50 shadow-amber-600/10'}`}>
         
         <div className={`
            relative w-44 h-44 flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-[2.5s] ease-in-out shadow-inner
            ${adherencePercent === 100 
              ? 'bg-emerald-600/10 border-emerald-600/30' 
              : 'bg-amber-600/10 border-amber-600/30'}
         `}>
            
            <svg className="absolute w-[90%] h-[90%] transform -rotate-90 z-10" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-300/40 dark:text-white/[0.03]" />
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="6.5" 
                strokeLinecap="round"
                className={`transition-all duration-[2.5s] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${adherencePercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}
                style={{ 
                  strokeDasharray: '276.46',
                  strokeDashoffset: 276.46 - (276.46 * adherencePercent) / 100
                }}
              />
            </svg>
            
            <div className="relative z-20 flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-0.5">
                <span className={`
                  text-6xl font-black italic tracking-tighter leading-none transition-all duration-[2.5s]
                  ${adherencePercent === 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-500'}
                `}>
                  {adherencePercent}
                </span>
                <span className={`
                  text-2xl font-black italic transition-all duration-[2.5s]
                  ${adherencePercent === 100 ? 'text-emerald-700/50' : 'text-amber-700/50'}
                `}>%</span>
              </div>
              <div className={`h-1 w-12 my-2.5 transition-all duration-[2.5s] ${adherencePercent === 100 ? 'bg-emerald-600/30' : 'bg-amber-600/30'}`} />
              <span className="text-[8px] font-black uppercase tracking-[0.5em] italic text-slate-600 dark:text-white/40 leading-none">
                {isViewingToday ? 'ESTADO ACTUAL' : 'REGISTRO DIARIO'}
              </span>
            </div>
            
            <div className="absolute inset-0 rounded-full bg-white/[0.02] pointer-events-none" />
         </div>

         <div className="flex-grow text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
               <div className={`p-4 rounded-2xl border-2 transition-all duration-1000 shadow-lg ${adherencePercent === 100 ? 'bg-emerald-600/20 border-emerald-600/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-600/20 border-amber-600/40 text-amber-700 dark:text-amber-500'}`}>
                  <Activity size={28} className={adherencePercent < 100 && isViewingToday ? "animate-pulse" : ""} />
               </div>
               <div>
                 <h3 className={`text-4xl font-black uppercase italic tracking-tighter leading-none transition-all duration-1000 drop-shadow-sm ${adherencePercent === 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-500'}`}>
                   {adherencePercent === 100 ? 'SINCRONÍA MAESTRA' : (isViewingToday ? 'PANEL BIOMÉTRICO' : `REPORTE: ${selectedDate.toLocaleDateString('es-ES')}`)}
                 </h3>
                 <p className="text-[12px] text-slate-600 dark:text-white/50 font-black uppercase tracking-[0.3em] mt-2 italic">Optimización de Homeostasis Celular</p>
               </div>
            </div>
            <p className="text-lg text-slate-700 dark:text-secondary font-semibold italic max-w-3xl leading-relaxed">
              {isViewingToday 
                ? 'Análisis en tiempo real de la adherencia sistémica. El marcador recalibra los parámetros estructurales cada vez que registras una ingesta, ajustando el modelo de eficiencia metabólica.'
                : `Analizando métricas históricas de eficiencia sistémica del ${selectedDate.toLocaleDateString('es-ES')}. Los datos reflejan el cumplimiento del protocolo original.`}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-surface border-2 border-border/80 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group transition-all hover:border-emerald-500/40">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-600" size={20} />
                <span className="text-[11px] font-black text-secondary uppercase tracking-[0.25em] italic">Eficacia Sistémica</span>
              </div>
            </div>
            <div className={`text-6xl font-black italic tracking-tighter mb-2 transition-all duration-500 ${efficiencyMetrics.projected >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {efficiencyMetrics.projected}%
            </div>
            <div className="flex items-center gap-5 mt-6 border-t border-border pt-4">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-secondary/70 uppercase tracking-widest leading-none mb-1 italic">Vigente</span>
                  <span className="text-sm font-black text-primary italic leading-none">{efficiencyMetrics.current}%</span>
               </div>
               <div className="w-px h-8 bg-slate-300 dark:bg-white/10" />
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-secondary/70 uppercase tracking-widest leading-none mb-1 italic">Proyectado</span>
                  <span className={`text-sm font-black italic leading-none ${stagedIds.length > 0 ? 'text-amber-600 animate-pulse' : 'text-primary'}`}>
                    {efficiencyMetrics.projected}%
                  </span>
               </div>
            </div>
          </div>
          <Flame className="absolute top-0 right-0 p-8 opacity-[0.05] text-emerald-600" size={140} />
        </div>
        <div className="bg-surface border-2 border-border/80 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group transition-all hover:border-amber-500/40">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-amber-600" size={20} />
              <span className="text-[11px] font-black text-secondary uppercase tracking-[0.25em] italic">Tomas Completadas</span>
            </div>
            <div className="text-6xl font-black text-primary italic tracking-tighter mb-2">
              {currentLog.takenIds.filter(id => currentTargetIds.includes(id)).length || 0}<span className="text-2xl text-secondary ml-1.5 opacity-60">/{currentTargetIds.length}</span>
            </div>
            <p className="text-[11px] text-secondary font-bold uppercase italic mt-4 border-t border-border pt-3 opacity-80">Cumplimiento del Plan Diario</p>
          </div>
          <CheckCircle2 className="absolute top-0 right-0 p-8 opacity-[0.05] text-amber-600" size={140} />
        </div>
        <div className="bg-surface border-2 border-border/80 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group transition-all hover:border-[#3B82F6]/40">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#3B82F6]" size={20} />
                <span className="text-[11px] font-black text-secondary uppercase tracking-[0.25em] italic">Salud Estructural</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className={`text-6xl font-black italic tracking-tighter ${structuralHealthScore < 75 ? 'text-amber-600' : 'text-[#3B82F6]'}`}>
                {structuralHealthScore}%
              </div>
            </div>
            <div className="space-y-3 mt-6 border-t border-border pt-4">
               <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex border border-slate-300 dark:border-white/5 p-[1px] shadow-inner">
                  <div className={`h-full transition-all duration-1000 ${getSaturationColor(structuralHealthScore)} shadow-[0_0_12px_currentColor]`} style={{ width: `${structuralHealthScore}%` }} />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-12">
          
          <div className="bg-white dark:bg-surface border-2 border-border/80 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden transition-all">
            <div className="flex items-center justify-between mb-14 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-[#3B82F6]/15 rounded-2xl border-2 border-[#3B82F6]/30 shadow-md">
                   <Activity className="text-[#3B82F6]" size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">Chronos Individual</h3>
                  <p className="text-[11px] text-secondary font-black uppercase tracking-widest mt-2 italic border-l-2 border-indigo-500/30 pl-3">{isViewingToday ? 'Protocolos Activos + Mesa de Carga' : 'Historial de Bio-Datos'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              {visibleSupplementsInTable.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] text-center opacity-40 italic bg-slate-50/50">
                   <Target size={52} className="mx-auto mb-6 opacity-20 text-indigo-500" />
                   <p className="text-lg font-black uppercase tracking-widest text-slate-700 dark:text-white">Sin Registro de Actividad</p>
                </div>
              ) : (
                visibleSupplementsInTable.map((s, i) => {
                  const isTaken = currentLog.takenIds.includes(s.id);
                  const isActiveReal = activeSuppIds.includes(s.id);
                  const isStaged = stagedIds.includes(s.id) && isViewingToday;
                  const isProtected = isStaged && isActiveReal && requiredIds.has(s.id);
                  const isTrulyActive = isViewingToday ? (isActiveReal && (!isStaged || isProtected)) : (currentLog.activeSnapshot || []).includes(s.id);
                  const style = getCategoryStyle(s.category);

                  return (
                    <div 
                      key={i} 
                      onClick={() => isViewingToday && toggleStaged(s.id)}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden group cursor-pointer
                      ${isProtected 
                        ? 'bg-indigo-600/5 border-indigo-500/40 shadow-indigo-600/5' 
                        : isStaged && isActiveReal 
                          ? 'bg-red-600/10 border-red-600 shadow-red-600/10' 
                          : isStaged && !isActiveReal 
                            ? 'bg-amber-600/10 border-amber-600 shadow-amber-600/10' 
                            : 'bg-[#3B82F6]/5 border-[#3B82F6]/30 shadow-lg hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                          <div 
                            onClick={(e) => { e.stopPropagation(); setSelectedSupId(s.id); }}
                            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl transition-all relative overflow-hidden border-2 shadow-2xl hover:scale-110 active:scale-95 group/icon ${isProtected ? 'bg-slate-950 border-indigo-500 text-indigo-500' : isStaged && isActiveReal ? 'bg-slate-950 border-red-600 text-red-600' : isStaged ? 'bg-slate-950 border-amber-600 text-amber-600' : 'bg-slate-950 border-[#3B82F6]/50 text-[#3B82F6]'}`}
                          >
                            {getEmoji(s.name)}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                              <Info size={24} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-4 mb-2.5">
                              <h4 className={`text-2xl font-black uppercase italic tracking-tighter leading-tight border-l-4 pl-4 pr-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-950 to-slate-600 dark:from-white dark:to-white/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] ${isProtected ? 'from-indigo-600 border-indigo-500' : isStaged && isActiveReal ? 'from-[#E63946] border-[#E63946]' : isStaged ? 'from-amber-700 border-amber-600' : 'from-[#3B82F6] border-[#3B82F6]'}`}>
                                {s.name}
                              </h4>
                              <div className="flex gap-2">
                                {isProtected ? (
                                   <span className="text-[8px] font-black bg-indigo-600 text-white px-3 py-1 rounded-lg italic uppercase border border-indigo-400 shadow-sm animate-pulse">PROTEGIDO (Sinergia Activa)</span>
                                ) : isStaged && isActiveReal ? (
                                   <span className="text-[8px] font-black bg-[#E63946] text-white px-3 py-1 rounded-lg italic uppercase border border-[#E63946]/40 shadow-sm animate-pulse">SELECCIONADO PARA APAGAR</span>
                                ) : isStaged && !isActiveReal ? (
                                   <span className="text-[8px] font-black bg-amber-600 text-black px-3 py-1 rounded-lg italic uppercase border border-amber-400 shadow-sm animate-pulse">STAGED</span>
                                ) : null}
                                {isActiveReal && !isStaged && <span className={`text-[8px] font-black px-3 py-1 rounded-lg italic uppercase border shadow-sm ${isViewingToday ? 'bg-[#3B82F6] text-white border-[#3B82F6]/40' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-secondary border-slate-300 dark:border-white/10'}`}>ACTIVO</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className={`px-3 py-1 rounded-lg border-2 bg-slate-900 dark:bg-black/60 ${style.border} shadow-xl inline-flex items-center gap-2`}>
                                  <div className={`w-2 h-2 rounded-full ${style.dot} animate-pulse shadow-[0_0_8px_currentColor]`} />
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${style.text} italic`}>{s.category}</span>
                               </div>
                               <span className="text-[11px] text-slate-600 dark:text-secondary font-black uppercase tracking-widest leading-none italic opacity-80">{s.recommendedDosage}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                           <button 
                              onClick={() => handleToggleIndividualNow(s.id)}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-xl ${isProtected ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-500' : isActiveReal && !isStaged ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-500 cursor-default' : (isStaged && isActiveReal ? 'bg-black/20 border-white/5 text-red-500 hover:text-emerald-500' : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40')}`}
                              title={isProtected ? "Protegido por otro stack activo" : isActiveReal && !isStaged ? "Activo (Apagar seleccionando tarjeta)" : (isStaged && isActiveReal ? "Cancelar retiro pendiente" : "Activar Protocolo")}
                            >
                              {isProtected ? <ShieldCheck size={20} /> : isActiveReal && !isStaged ? <Check size={20} /> : <Play size={20} fill="currentColor" />}
                            </button>

                           <div className="flex items-center gap-4 border-l border-border/40 pl-6">
                              <span className="text-[11px] font-black text-slate-500 dark:text-secondary uppercase tracking-widest italic opacity-70">{isTaken ? 'LOGRADO' : 'PENDIENTE'}</span>
                              <button 
                                onClick={() => toggleIntake(s.id)}
                                disabled={!isViewingToday || !isTrulyActive}
                                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shadow-xl ${isTaken ? 'bg-emerald-600 border-emerald-400 text-black shadow-[0_0_25px_rgba(5,150,105,0.5)]' : 'bg-slate-50 dark:bg-black/60 border-slate-300 dark:border-white/10 text-slate-500 dark:text-secondary hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-600/50 hover:shadow-emerald-600/10'} ${(!isViewingToday || !isTrulyActive) ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                              >
                                {isTaken ? <CheckSquare size={30} strokeWidth={3} /> : <Square size={30} strokeWidth={2} />}
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SYNERGY AGENDA */}
          <div className="bg-white dark:bg-[#0a0a0a] border-2 border-border/80 dark:border-amber-500/20 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.05),transparent_70%)] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-14 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-amber-600/15 rounded-2xl border-2 border-amber-600/30 shadow-md transition-transform hover:scale-105">
                   <Layers className="text-amber-600" size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">Synergy Agenda</h3>
                  <p className="text-[11px] text-secondary font-black uppercase tracking-widest mt-2 italic border-l-2 border-amber-600/40 pl-3">Sincronización Maestra PRO</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              {visibleStacksInTable.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3.5rem] text-center italic text-slate-400 bg-slate-50/50 dark:bg-white/[0.02] shadow-inner transition-all">
                  <Sparkles size={48} className="mx-auto mb-6 opacity-30 text-amber-500 animate-pulse" />
                  <p className="text-lg font-black uppercase tracking-[0.2em] opacity-60">Sin Sinergias Detectadas</p>
                </div>
              ) : (
                visibleStacksInTable.map((stack, i) => {
                  const isTaken = currentLog.takenStackNames.includes(stack.name);
                  const stackSupps = supplements.filter(s => stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase())));
                  const stackActiveIds = stackSupps.map(s => s.id);
                  
                  // Un stack es verdaderamente activo SOLO si todos sus componentes ya están en activeSuppIds y NO están marcados para apagar (o están protegidos)
                  const isTrulyActiveStack = stackActiveIds.every(id => activeSuppIds.includes(id) && (!stagedIds.includes(id) || requiredIds.has(id)));
                  const isFullStagedRemoval = isViewingToday && stackActiveIds.every(id => activeSuppIds.includes(id) && stagedIds.includes(id) && !requiredIds.has(id));
                  const isFullStagedAddition = isViewingToday && !stackActiveIds.some(id => activeSuppIds.includes(id)) && stackActiveIds.every(id => stagedIds.includes(id));
                  
                  const style = getCategoryStyle(stack.category);

                  return (
                    <div 
                      key={i} 
                      onClick={() => isViewingToday && toggleStagedStack(stack.ingredients)}
                      className={`p-8 rounded-[3rem] border-2 flex items-center justify-between group relative overflow-hidden transition-all duration-500 cursor-pointer
                      ${isFullStagedRemoval 
                        ? 'bg-red-600/10 border-red-600 shadow-red-600/10' 
                        : isFullStagedAddition
                          ? 'bg-amber-600/10 border-amber-600 shadow-amber-600/10' 
                          : 'bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/10 shadow-lg hover:bg-slate-100 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-8">
                        <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center border-2 transition-all shadow-xl ${isFullStagedRemoval ? 'bg-slate-950 border-[#E63946] text-[#E63946]' : isTrulyActiveStack ? 'bg-slate-950 border-indigo-500 text-indigo-500' : 'bg-slate-950 border-amber-600 text-amber-600'}`}>
                          {React.cloneElement(stack.icon as React.ReactElement<any>, { size: 30 })}
                        </div>
                        <div>
                          <div className="flex items-center gap-5 mb-3.5">
                             <h4 className={`text-2xl font-black uppercase italic tracking-tighter leading-none transition-colors pr-6 ${isFullStagedRemoval ? 'text-[#E63946]' : isTrulyActiveStack ? 'text-primary' : 'text-amber-600'}`}>{stack.name}</h4>
                             <div className="flex gap-2">
                               {isFullStagedRemoval && <span className="text-[7.5px] font-black bg-[#E63946] text-white px-2 py-0.5 rounded-lg italic uppercase border border-[#E63946]/40 shadow-sm animate-pulse leading-none">SELECCIONADO PARA APAGAR</span>}
                               {isFullStagedAddition && <span className="text-[9px] font-black bg-amber-600 text-black px-3 py-1 rounded-lg italic uppercase border border-amber-400 shadow-sm animate-pulse">STAGED</span>}
                               {isTrulyActiveStack && <span className={`text-[9px] font-black bg-[#3B82F6] text-white px-3 py-1 rounded-lg italic uppercase border border-[#3B82F6]/50 shadow-blue-600/30`}>ACTIVO</span>}
                             </div>
                             <div className={`px-3 py-1 rounded-lg border-[3px] bg-slate-900 dark:bg-black/60 ring-1 ring-white/10 backdrop-blur-md inline-flex items-center gap-2 ml-2 shadow-lg ${style.border}`}>
                                <div className={`w-2 h-2 rounded-full ${style.dot} animate-pulse shadow-[0_0_10px_currentColor]`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${style.text} italic`}>{stack.label || stack.category.split(' ')[0]}</span>
                             </div>
                          </div>
                          <div className="flex gap-3">
                            {stack.ingredients.map((ing, idx) => {
                               const ingSupp = supplements.find(s => s.name.toLowerCase().includes(ing.toLowerCase()));
                               const isIngActive = ingSupp && activeSuppIds.includes(ingSupp.id) && (!stagedIds.includes(ingSupp.id) || requiredIds.has(ingSupp.id));
                               const isIngStagedOff = isViewingToday && ingSupp && activeSuppIds.includes(ingSupp.id) && stagedIds.includes(ingSupp.id) && !requiredIds.has(ingSupp.id);
                               const isIngStagedOn = isViewingToday && ingSupp && !activeSuppIds.includes(ingSupp.id) && stagedIds.includes(ingSupp.id);
                               
                               return (
                                <button 
                                  key={idx} 
                                  onClick={(e) => { e.stopPropagation(); handleIngredientClick(ing); }}
                                  className={`p-[1.5px] rounded-xl transition-transform hover:scale-105 active:scale-95 ${isIngStagedOff ? 'bg-red-600/40' : isIngActive ? 'bg-[#3B82F6]/40' : isIngStagedOn ? 'bg-amber-600/40' : 'bg-slate-300/40'}`}
                                >
                                  <span className={`text-[10px] font-black border-2 bg-slate-950 px-3 py-1 rounded-[0.8rem] italic block shadow-sm ${isIngStagedOff ? 'border-red-600/40 text-red-400' : isIngActive ? 'border-[#3B82F6]/40 text-[#3B82F6]' : isIngStagedOn ? 'border-amber-600/40 text-amber-600' : 'border-slate-300/40 text-slate-400'}`}>{ing}</span>
                                </button>
                               );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-6">
                           <button 
                              onClick={() => handleToggleStackNow(stack.ingredients)}
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-xl ${isTrulyActiveStack ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-500 cursor-pointer hover:bg-red-500 hover:text-white hover:border-red-400' : (isFullStagedRemoval ? 'bg-black/20 border-white/5 text-red-500 hover:text-emerald-500' : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40')}`}
                              title={isTrulyActiveStack ? "Activo (Click para apagar)" : (isFullStagedRemoval ? "Cancelar retiro del stack" : "Activar Protocolo")}
                            >
                              {isTrulyActiveStack ? <Power size={24} /> : (isFullStagedRemoval ? <Play size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />)}
                            </button>

                           <div className="flex items-center gap-4 border-l border-border/40 pl-6">
                              <button 
                                  onClick={() => toggleStackIntake(stack.name)}
                                  disabled={!isViewingToday || !isTrulyActiveStack}
                                  className={`w-16 h-16 rounded-[1.5rem] border-2 transition-all flex items-center justify-center shadow-2xl ${isTaken ? 'bg-emerald-600 border-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.7)]' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-secondary hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-600/50 hover:shadow-emerald-600/10'} ${(!isViewingToday || !isTrulyActiveStack) ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                              >
                                  {isTaken ? <CheckSquare size={34} strokeWidth={3.5} /> : <Square size={34} strokeWidth={2.5} />}
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CATALOGO DE SINERGIAS CON SELECCIÓN MÚLTIPLE */}
          <div className="space-y-8 pt-16 border-t-2 border-slate-200 dark:border-white/10 transition-all">
            <div className="flex items-center gap-6 px-4">
              <div className="p-4 bg-indigo-600/15 rounded-2xl border-2 border-indigo-600/40 shadow-xl">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">Catálogo de Sinergias</h3>
                <p className="text-[12px] text-secondary font-black uppercase tracking-[0.3em] mt-2 italic border-l-2 border-indigo-600/40 pl-4">Operativa Bio-Analítica</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {STACKS_MANIFEST.map((stack, i) => {
                const stackSupps = supplements.filter(s => stack.ingredients.some(ing => s.name.toLowerCase().includes(ing.toLowerCase())));
                const stackActiveIds = stackSupps.map(s => s.id);
                
                // UN stack solo muestra 'ACTIVO' si ya está en activeSuppIds y no está staged para apagar
                const isTrulyActiveStack = stackActiveIds.every(id => activeSuppIds.includes(id) && (!stagedIds.includes(id) || requiredIds.has(id)));
                const isFullStagedRemoval = isViewingToday && stackActiveIds.every(id => activeSuppIds.includes(id) && stagedIds.includes(id) && !requiredIds.has(id));
                const isFullStagedAddition = isViewingToday && !isTrulyActiveStack && !isFullStagedRemoval && stackActiveIds.every(id => activeSuppIds.includes(id) || stagedIds.includes(id)) && stackActiveIds.some(id => stagedIds.includes(id));
                
                const style = getCategoryStyle(stack.category);

                return (
                  <div 
                    key={i} 
                    onClick={() => isViewingToday && toggleStagedStack(stack.ingredients)}
                    className={`
                      group relative p-7 rounded-[2.5rem] border-[2.5px] transition-all duration-500 cursor-pointer overflow-hidden shadow-xl
                      ${isTrulyActiveStack 
                        ? 'bg-[#3B82F6]/5 border-[#3B82F6] shadow-blue-600/10' 
                        : isFullStagedRemoval
                          ? 'bg-red-600/10 border-red-600 shadow-red-600/10'
                          : isFullStagedAddition
                            ? 'bg-amber-600/5 border-amber-600 shadow-amber-600/10'
                            : 'bg-white dark:bg-surface border-slate-200 dark:border-border/80 hover:border-indigo-500/50 shadow-md'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div 
                        onClick={(e) => { e.stopPropagation(); soundService.playClick(); }}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border-[3px] shadow-2xl transition-transform group-hover:scale-110 ${isTrulyActiveStack ? 'bg-slate-950 border-[#3B82F6] text-[#3B82F6]' : isFullStagedRemoval ? 'bg-slate-950 border-[#E63946] text-[#E63946]' : isFullStagedAddition ? 'bg-slate-950 border-amber-600 text-amber-600' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-indigo-600 dark:text-secondary shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'}`}
                      >
                        {React.cloneElement(stack.icon as React.ReactElement<any>, { size: 28 })}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleStackNow(stack.ingredients); }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-lg ${isTrulyActiveStack ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-500 hover:bg-red-500 hover:text-white hover:border-red-400' : (isFullStagedRemoval ? 'bg-black/20 border-white/5 text-red-500 hover:text-emerald-500' : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40')}`}
                          title={isTrulyActiveStack ? "Activo (Click para apagar)" : (isFullStagedRemoval ? "Cancelar retiro" : "Encender Protocolo")}
                        >
                          {isTrulyActiveStack ? <Power size={18} /> : (isFullStagedRemoval ? <Play size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />)}
                        </button>
                         <div className={`px-3 py-1 rounded-lg border-[3px] bg-slate-900 dark:bg-black/60 ring-1 ring-white/10 backdrop-blur-md shadow-lg ${style.border}`}>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${style.text} italic`}>{SHORT_NAMES[stack.category as PremiumTag] || stack.category.split(' ')[0]}</span>
                         </div>
                      </div>
                    </div>

                    <h4 className={`text-xl font-black uppercase italic tracking-tighter leading-tight mb-4 transition-colors drop-shadow-sm pr-6 ${isTrulyActiveStack ? 'text-[#3B82F6]' : isFullStagedRemoval ? 'text-[#E63946]' : isFullStagedAddition ? 'text-amber-600' : 'text-primary'}`}>
                      {stack.name}
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {stack.ingredients.map((ing, idx) => {
                         const ingSupp = supplements.find(s => s.name.toLowerCase().includes(ing.toLowerCase()));
                         const isActuallyActiveIng = ingSupp && activeSuppIds.includes(ingSupp.id) && (!stagedIds.includes(ingSupp.id) || requiredIds.has(ingSupp.id));
                         const isIngStagedOff = isViewingToday && ingSupp && activeSuppIds.includes(ingSupp.id) && stagedIds.includes(ingSupp.id) && !requiredIds.has(ingSupp.id);
                         const ingStagedOn = isViewingToday && ingSupp && !activeSuppIds.includes(ingSupp.id) && stagedIds.includes(ingSupp.id);

                         return (
                          <button 
                            key={idx} 
                            onClick={(e) => { e.stopPropagation(); handleIngredientClick(ing); }}
                            className={`text-[9px] font-black px-3 py-1 rounded-lg border-2 italic transition-all shadow-sm hover:scale-105 active:scale-95 ${isIngStagedOff ? 'bg-red-600/15 border-red-600/40 text-red-400' : isActuallyActiveIng ? 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6]' : ingStagedOn ? 'bg-amber-600/15 border-amber-600/40 text-amber-600' : 'text-slate-700 dark:text-secondary bg-slate-100 dark:bg-black/40 border-slate-300 dark:border-white/5'}`}>
                            {ing}
                          </button>
                         );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
                      <span className="text-[10px] font-black text-slate-500 dark:text-secondary uppercase tracking-[0.2em] italic">{stack.time}</span>
                      <div className="flex items-center gap-3">
                         {isTrulyActiveStack ? (
                           <span className="text-[9px] font-black text-[#3B82F6] uppercase tracking-widest italic animate-pulse">ACTIVO</span>
                         ) : isFullStagedRemoval ? (
                           <span className="text-[7.5px] font-black text-[#E63946] uppercase tracking-widest italic animate-pulse leading-none">SELECCIONADO PARA APAGAR</span>
                         ) : isFullStagedAddition ? (
                           <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic animate-pulse">STAGED</span>
                         ) : (
                           <ArrowUpRight size={18} className="text-slate-400 dark:text-secondary/40 group-hover:text-indigo-600 transition-colors" />
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BIO-CONTROLLER */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white dark:bg-[#0c0c0c] border-2 border-border/80 dark:border-white/20 rounded-[3rem] p-10 shadow-2xl h-[850px] flex flex-col relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.03),transparent_70%)] pointer-events-none" />
            
            <div className="flex-grow overflow-y-auto space-y-12 pr-4 custom-scrollbar relative z-10">
              
              <div className="border-2 border-slate-100 dark:border-white/10 p-6 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.04] shadow-inner relative">
                <section className="space-y-6">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-400 transition-transform hover:scale-110 active:scale-95 shadow-amber-500/30"><Zap className="text-black" size={30} fill="currentColor" /></div>
                      <div>
                        <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter leading-none">Bio-Controller</h3>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 font-black uppercase tracking-widest mt-2 italic border-l-2 border-amber-600/40 pl-3">Central de Comando</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {supplements.map(s => {
                      const isActiveReal = activeSuppIds.includes(s.id);
                      const isStaged = stagedIds.includes(s.id) && isViewingToday;
                      const isProtected = isStaged && isActiveReal && requiredIds.has(s.id);
                      const style = getCategoryStyle(s.category);
                      
                      return (
                        <div 
                          key={s.id} 
                          onClick={() => isViewingToday && toggleStaged(s.id)}
                          className={`p-5 rounded-[1.8rem] border-2 flex items-center justify-between transition-all relative overflow-hidden shadow-sm ${isViewingToday ? 'cursor-pointer' : 'cursor-default'}
                          ${isProtected 
                            ? 'bg-indigo-600/5 border-indigo-500/40' 
                            : isStaged && isActiveReal 
                              ? 'bg-red-600/5 border-[#E63946]'
                              : isStaged && !isActiveReal 
                                ? 'bg-amber-600/5 border-amber-600' 
                                : isActiveReal 
                                  ? 'bg-[#3B82F6]/5 border-[#3B82F6] shadow-blue-600/5' 
                                  : 'bg-white dark:bg-black/20 border-slate-200 dark:border-white/40 opacity-80 hover:opacity-100 hover:border-slate-400 dark:hover:border-white/60'}
                          `}
                        >
                          <div className="flex items-center gap-5">
                            <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); setSelectedSupId(s.id); }}>{getEmoji(s.name)}</span>
                            <div>
                              <div className="flex items-center gap-2.5">
                                 <h4 onClick={(e) => { e.stopPropagation(); setSelectedSupId(s.id); }} className={`text-xs font-black uppercase italic tracking-[0.1em] leading-none pr-4 hover:underline ${isProtected ? 'text-indigo-600' : isStaged && isActiveReal ? 'text-[#E63946]' : isStaged && !isActiveReal ? 'text-amber-600' : isActiveReal ? 'text-[#3B82F6]' : 'text-primary'}`}>{s.name}</h4>
                              </div>
                              <div className="flex items-center gap-3 mt-3">
                                 <div className={`p-[1.5px] bg-slate-900 dark:bg-black/60 rounded-lg border-2 ring-1 ring-white/5 ${style.border} shadow-lg`}>
                                    <span className={`text-[6px] font-black uppercase px-2 py-1 rounded-md border border-black ${style.bg} ${style.text} block leading-none`}>{SHORT_NAMES[s.category as PremiumTag] || s.category.split(' ')[0]}</span>
                                 </div>
                                 {isProtected ? (
                                    <span className="text-[7.5px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-lg italic uppercase border border-indigo-400 shadow-sm leading-none">PROTEGIDO</span>
                                 ) : isStaged && isActiveReal ? (
                                    <span className="text-[7.5px] font-black bg-[#E63946] text-white px-1.5 py-0.5 rounded-lg italic uppercase border border-[#E63946]/40 shadow-sm leading-none">APAGAR</span>
                                 ) : isActiveReal ? (
                                    <span className="text-[8px] font-black bg-[#3B82F6] text-white px-2.5 py-0.5 rounded-lg italic uppercase border border-[#3B82F6]/30 shadow-blue-600/10">ACTIVO</span>
                                 ) : isStaged ? (
                                    <span className="text-[8px] font-black bg-amber-600 text-black px-2.5 py-0.5 rounded-lg italic uppercase border border-amber-400 shadow-amber-600/10">STAGED</span>
                                 ) : null}
                              </div>
                            </div>
                          </div>
                          {isViewingToday && (
                            <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleToggleIndividualNow(s.id)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isProtected ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-500' : isActiveReal && !isStaged ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-500 cursor-not-allowed' : (isStaged && isActiveReal ? 'bg-black/20 border-white/5 text-red-500 hover:text-emerald-500' : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40')}`}
                              >
                                {isProtected ? <ShieldCheck size={18} /> : isActiveReal && !isStaged ? <Check size={18} /> : <Play size={18} fill="currentColor" />}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
            
            {isViewingToday && (
              <div className="mt-10 pt-10 border-t-2 border-slate-100 dark:border-white/10 relative z-10 space-y-6">
                 <button 
                  onClick={commitActivation}
                  disabled={!stagedIds.some(id => !activeSuppIds.includes(id))}
                  className={`w-full py-6 rounded-[2rem] font-black text-[14px] uppercase tracking-[0.4em] italic shadow-2xl transition-all flex items-center justify-center gap-5 ${stagedIds.some(id => !activeSuppIds.includes(id)) ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-[1.03] shadow-amber-500/20 border-2 border-amber-400 active:scale-95' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-secondary/40 border-2 border-slate-200 dark:border-white/5 cursor-not-allowed'}`}
                >
                  <Power size={24} strokeWidth={3} /> ACTIVAR PLAN
                 </button>
                 <div className="grid grid-cols-2 gap-6">
                   <button 
                    onClick={handleApagarProtocolo}
                    disabled={!stagedIds.some(id => activeSuppIds.includes(id))}
                    className={`py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] italic transition-all flex items-center justify-center gap-4 shadow-xl border-2 ${stagedIds.some(id => activeSuppIds.includes(id)) ? 'bg-[#E63946] text-white border-[#E63946] hover:bg-red-700 hover:scale-[1.03] shadow-red-600/20 active:scale-95' : 'bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-secondary/20 border-slate-100 dark:border-white/5 cursor-not-allowed'}`}
                  >
                    <PowerOff size={20} strokeWidth={3} /> APAGAR
                   </button>
                   <button 
                    onClick={clearStaged}
                    disabled={stagedIds.length === 0}
                    className={`py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] italic transition-all flex items-center justify-center gap-4 shadow-xl border-2 ${stagedIds.length > 0 ? 'bg-slate-900 border-slate-700 text-white hover:bg-black hover:scale-[1.03] active:scale-95' : 'bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-secondary/10 border-slate-100 dark:border-white/5 cursor-not-allowed'}`}
                  >
                    <Eraser size={20} strokeWidth={3} /> LIMPIAR
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeSupDetail && (
        <SupplementDetailModal 
          supplement={activeSupDetail} 
          onClose={() => setSelectedSupId(null)} 
          onVote={onVote}
          onRemoveVote={onRemoveVote}
          onToggleProtocol={onToggleActivity}
          isActive={activeSuppIds.includes(activeSupDetail.id)}
          isPremium={preferences.isPremium}
          isLoggedIn={preferences.isLoggedIn}
          onStartOnboarding={onStartOnboarding}
        />
      )}
    </div>
  );
};

export default Dashboard;