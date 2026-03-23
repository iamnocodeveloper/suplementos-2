import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Dashboard, { STACKS_MANIFEST } from './components/Dashboard';
import RankingView from './components/RankingView';
import EmergingView from './components/EmergingView';
import StacksView from './components/StacksView';
import AdvisorView from './components/AdvisorView';
import CommunityView from './components/CommunityView';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import ChatBot from './components/ChatBot';
import { ViewState, UserPreferences, Supplement, BioProfile, UserRecord } from './types';
import { INITIAL_SUPPLEMENTS } from './data';
import { soundService } from './services/sound';
import { runWeeklyScientificReview } from './services/evidenceEngine';
import { Crown, ArrowUpRight, Zap, Lock } from 'lucide-react';
import { supabase } from './src/lib/supabase';

const PremiumGate: React.FC<{ section: string, onAttemptUpgrade: () => void }> = ({ section, onAttemptUpgrade }) => (
  <div className="relative min-h-[70vh] flex items-center justify-center p-8">
     <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none select-none grayscale blur-md">
        <div className="grid grid-cols-3 gap-8 p-20">
           {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white/10 rounded-[2rem] border border-white/10" />)}
        </div>
     </div>
     <div className="relative z-10 max-w-lg w-full bg-[#0c0c0c]/80 border border-amber-500/30 backdrop-blur-2xl p-12 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] text-center animate-slide-up my-auto">
        <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] mx-auto mb-8 rotate-6 border-2 border-white/20">
           <Crown size={40} className="text-black" fill="currentColor" />
        </div>
        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
           Protocolo <span className="text-amber-500">PRO</span>
        </h3>
        <p className="text-lg text-secondary font-medium italic mb-10 leading-relaxed">
           La sección <span className="text-primary font-bold">{section}</span> utiliza algoritmos de optimización molecular reservados para miembros Premium.
        </p>
        <div className="space-y-4">
           <button onClick={onAttemptUpgrade} className="w-full py-5 rounded-2xl bg-amber-500 text-black font-black uppercase text-xs tracking-[0.4em] italic shadow-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3">
             <Zap size={18} fill="currentColor" /> Activar Acceso Elite
           </button>
           <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest italic flex items-center justify-center gap-2">
             Incluye Advisor IA + Dashboards Dinámicos <ArrowUpRight size={12} />
           </p>
        </div>
     </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeSuppIds, setActiveSuppIds] = useState<string[]>([]);
  const [isSyncingScientific, setIsSyncingScientific] = useState(false);
  
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('user_prefs');
    const defaultPrefs: UserPreferences = {
      isLoggedIn: false,
      soundEnabled: true,
      isPremium: false,
      theme: 'dark',
      themeIntensity: 50,
      visionScale: 1.0,
      name: 'Invitado',
      lastScientificSync: Date.now(),
      reputation: { totalPoints: 0, likesReceived: 0, usefulReceived: 0 }
    };
    if (!saved) return defaultPrefs;
    const parsed = JSON.parse(saved);
    return { ...defaultPrefs, ...parsed, isLoggedIn: false }; // Always require login on mount for security/sync
  });

  // Supabase Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setPreferences(prev => ({
              ...prev,
              isLoggedIn: true,
              userId: session.user.id,
              name: profile.full_name || profile.username || 'Usuario',
              isPremium: profile.is_premium,
              avatar: profile.avatar_url,
              reputation: {
                totalPoints: profile.reputation_points || 0,
                likesReceived: profile.likes_received || 0,
                usefulReceived: profile.useful_received || 0,
              },
              bioProfile: profile.bio_profile
            }));

            const { data: protocols } = await supabase
              .from('user_protocols')
              .select('protocol_id')
              .eq('user_id', session.user.id);

            if (protocols) {
              setActiveSuppIds(protocols.map(p => p.protocol_id));
            }
          } else {
            // Create profile if missing
            const newProfile = {
              id: session.user.id,
              full_name: session.user.user_metadata.full_name || 'Nuevo Biohacker',
              updated_at: new Date().toISOString(),
            };
            await supabase.from('profiles').upsert(newProfile);
            setPreferences(prev => ({ 
              ...prev, 
              isLoggedIn: true, 
              userId: session.user.id,
              name: newProfile.full_name 
            }));
          }
        } else {
          setPreferences(prev => ({ 
            ...prev, 
            isLoggedIn: false, 
            userId: undefined,
            name: 'Invitado',
            isPremium: false 
          }));
          setActiveSuppIds([]);
        }
      } catch (err) {
        console.error("Error en flujo de autenticación:", err);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [supplements, setSupplements] = useState<Supplement[]>(() => {
    const saved = localStorage.getItem('app_supplements');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLEMENTS;
  });

  const triggerScientificRecalibration = useCallback(async () => {
    if (isSyncingScientific) return;
    setIsSyncingScientific(true);
    soundService.playClick();

    try {
      const response = await runWeeklyScientificReview(supplements);
      if (response.updates.length > 0) {
        setSupplements(prev => {
          const updated = prev.map(s => {
            const update = response.updates.find(u => u.id === s.id);
            if (update) {
              return {
                ...s,
                previousScientificScore: s.scientificScore,
                scientificScore: update.newScore,
                scientificTrend: update.trend,
                studiesCount: s.studiesCount + update.studiesAdded,
                humanTrialsCount: (s.humanTrialsCount || 0) + update.humanTrialsAdded,
                metaAnalysisCount: (s.metaAnalysisCount || 0) + update.metaAnalysisAdded,
                // Reiniciamos votos al actualizar según instrucción de sistema para nuevo ciclo científico
                rating: 0,
                votes: 0,
                userVote: undefined
              };
            }
            return s;
          });
          return updated;
        });
        
        const now = Date.now();
        setPreferences(prev => ({ ...prev, lastScientificSync: now }));
        soundService.playPremium();
      }
    } catch (err) {
      console.error("Fallo en sincronización:", err);
    } finally {
      setIsSyncingScientific(false);
    }
  }, [supplements, isSyncingScientific]);

  useEffect(() => {
    // Timer para actualización automática por tiempo (Semanas)
    // Solo dispara si han pasado 7 días. El check se hace cada 30 segundos.
    const checkTimer = () => {
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      if (now - preferences.lastScientificSync >= ONE_WEEK) {
        triggerScientificRecalibration();
      }
    };
    const interval = setInterval(checkTimer, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [preferences.lastScientificSync, triggerScientificRecalibration]);


  const saveUserToDB = useCallback(async (userId: string, prefs: UserPreferences, protocols: string[]) => {
    // Sync with Supabase
    await supabase.from('profiles').update({
      full_name: prefs.name,
      avatar_url: prefs.avatar,
      is_premium: prefs.isPremium,
      reputation_points: prefs.reputation.totalPoints,
      likes_received: prefs.reputation.likesReceived,
      useful_received: prefs.reputation.usefulReceived,
      bio_profile: prefs.bioProfile,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    // Sync Protocols
    // Optimized approach: delete ones not in current list and add missing ones
    const { data: current } = await supabase.from('user_protocols').select('protocol_id').eq('user_id', userId);
    const existingIds = current?.map(p => p.protocol_id) || [];
    
    const toAdd = protocols.filter(id => !existingIds.includes(id)).map(id => ({ user_id: userId, protocol_id: id }));
    const toRemove = existingIds.filter(id => !protocols.includes(id));

    if (toAdd.length) await supabase.from('user_protocols').insert(toAdd);
    if (toRemove.length) await supabase.from('user_protocols').delete().in('protocol_id', toRemove).eq('user_id', userId);

  }, []);

  useEffect(() => {
    localStorage.setItem('user_prefs', JSON.stringify({
      theme: preferences.theme,
      themeIntensity: preferences.themeIntensity,
      soundEnabled: preferences.soundEnabled,
      visionScale: preferences.visionScale
    }));
    
    if (preferences.isLoggedIn && preferences.userId) {
      saveUserToDB(preferences.userId, preferences, activeSuppIds);
    }
  }, [preferences.theme, preferences.themeIntensity, preferences.soundEnabled, preferences.visionScale, preferences.isLoggedIn, preferences.userId, activeSuppIds, saveUserToDB]);

  useEffect(() => {
    if (preferences.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    const root = document.documentElement;
    const intensity = preferences.themeIntensity || 50;

    if (preferences.theme === 'dark') {
      const bgL = Math.max(0, 10 - (intensity / 10)); 
      const surfL = Math.max(5, 15 - (intensity / 10)); 
      root.style.setProperty('--color-background', `hsl(210, 10%, ${bgL}%)`);
      root.style.setProperty('--color-surface', `hsl(210, 10%, ${surfL}%)`);
      root.style.setProperty('--color-border', `rgba(255,255,255, ${0.05 + (intensity / 1000)})`);
    } else {
      const bgL = 100 - (intensity / 10); 
      const surfL = 100; 
      root.style.setProperty('--color-background', `hsl(210, 40%, ${bgL}%)`);
      root.style.setProperty('--color-surface', `hsl(0, 0%, ${surfL}%)`);
      root.style.setProperty('--color-border', `hsl(210, 30%, ${90 - (intensity / 10)}%)`);
    }
  }, [preferences.theme, preferences.themeIntensity]);

  const handleUpdatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const handleUpgradeAttempt = useCallback(() => {
    soundService.playClick();
    if (!preferences.isLoggedIn) {
       setShowOnboarding(true);
       return;
    }
    handleUpdatePreferences({ isPremium: true });
    soundService.playPremium();
  }, [preferences.isLoggedIn, handleUpdatePreferences]);

  const recalibratedSupplements = useMemo(() => {
    if (!preferences.bioProfile) return supplements;
    const goal = preferences.bioProfile.primaryGoal.toLowerCase();
    return [...supplements].sort((a, b) => {
      let scoreA = a.scientificScore;
      let scoreB = b.scientificScore;
      const getBoost = (s: Supplement) => {
        if (goal.includes('físico') && s.category.toLowerCase().includes('rendimiento')) return 15;
        if (goal.includes('cognitiva') && s.category.toLowerCase().includes('mental')) return 15;
        if (goal.includes('sueño') && (s.goalTags.includes('Sueño') || s.benefitTag.includes('Relajación'))) return 20;
        if (goal.includes('belleza') && s.category.toLowerCase().includes('belleza')) return 15;
        if (goal.includes('peso') && (s.category.toLowerCase().includes('metabolismo') || s.benefitTag.includes('Glucemia'))) return 10;
        return 0;
      };
      scoreA += getBoost(a);
      scoreB += getBoost(b);
      return scoreB - scoreA;
    });
  }, [supplements, preferences.bioProfile]);

  const toggleProtocol = (id: string) => {
    if (!preferences.isLoggedIn) {
       setShowOnboarding(true);
       return;
    }
    if (!preferences.isPremium) {
       soundService.playClick();
       return;
    }
    soundService.playClick();
    const isActive = activeSuppIds.includes(id);
    if (!isActive) {
      setActiveSuppIds(prev => [...prev, id]);
      const dates = JSON.parse(localStorage.getItem('activation_dates') || '{}');
      dates[id] = Date.now();
      localStorage.setItem('activation_dates', JSON.stringify(dates));
    } else {
      setActiveSuppIds(prev => prev.filter(sid => sid !== id));
    }
  };

  const handleActivateStack = (ingredients: string[]) => {
    if (!preferences.isLoggedIn) {
      setShowOnboarding(true);
      return;
    }
    if (!preferences.isPremium) {
       soundService.playClick();
       return;
    }
    soundService.playClick();
    
    const stackSupps = recalibratedSupplements.filter(s => 
      ingredients.some(name => s.name.toLowerCase().includes(name.toLowerCase()))
    );
    const stackIds = stackSupps.map(s => s.id);
    if (stackIds.length === 0) return;

    const allActive = stackIds.every(id => activeSuppIds.includes(id));

    if (allActive) {
      const otherActiveStacks = STACKS_MANIFEST.filter(stack => {
        const isInteractedStack = stack.ingredients.length === ingredients.length && 
                                 stack.ingredients.every(ing => ingredients.includes(ing));
        if (isInteractedStack) return false;

        const sSupps = recalibratedSupplements.filter(s => 
          stack.ingredients.some(name => s.name.toLowerCase().includes(name.toLowerCase()))
        );
        const sIds = sSupps.map(s => s.id);
        return sIds.length > 0 && sIds.every(id => activeSuppIds.includes(id));
      });

      const idsRequiredByOthers = new Set(otherActiveStacks.flatMap(stack => {
        const sSupps = recalibratedSupplements.filter(s => 
          stack.ingredients.some(name => s.name.toLowerCase().includes(name.toLowerCase()))
        );
        return sSupps.map(s => s.id);
      }));

      setActiveSuppIds(prev => prev.filter(id => !stackIds.includes(id) || idsRequiredByOthers.has(id)));
    } else {
      setActiveSuppIds(prev => [...new Set([...prev, ...stackIds])]);
      const dates = JSON.parse(localStorage.getItem('activation_dates') || '{}');
      const now = Date.now();
      stackIds.forEach(id => { if (!activeSuppIds.includes(id)) dates[id] = now; });
      localStorage.setItem('activation_dates', JSON.stringify(dates));
    }
  };

  const syncProtocolsFromDashboard = (ids: string[]) => {
    if (!preferences.isLoggedIn) {
      setShowOnboarding(true);
      return;
    }
    setActiveSuppIds(ids);
    const dates = JSON.parse(localStorage.getItem('activation_dates') || '{}');
    const now = Date.now();
    ids.forEach(id => { if (!activeSuppIds.includes(id)) dates[id] = now; });
    localStorage.setItem('activation_dates', JSON.stringify(dates));
  };

  const handleVote = (id: string, newVote: number) => {
    setSupplements(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          const hadPreviousVote = s.userVote !== undefined;
          const oldUserVote = s.userVote || 0;
          const currentTotalVotes = s.votes;
          const currentRating = s.rating;
          let nextVotes = currentTotalVotes;
          let nextRating = currentRating;
          if (!hadPreviousVote) {
            nextVotes = currentTotalVotes + 1;
            nextRating = ((currentRating * currentTotalVotes) + newVote) / nextVotes;
          } else {
            nextRating = ((currentRating * currentTotalVotes) - oldUserVote + newVote) / Math.max(1, currentTotalVotes);
          }
          return { ...s, userVote: newVote, rating: nextRating, votes: nextVotes };
        }
        return s;
      });
      return updated;
    });
  };

  const handleViewChange = useCallback((view: ViewState) => {
    soundService.playClick();
    setCurrentView(view);
  }, []);

  const handleLogout = useCallback(async () => {
    soundService.playClick();
    await supabase.auth.signOut();
    setCurrentView('home');
  }, []);

  const handleOnboardingComplete = useCallback(async (bioProfile: BioProfile) => {
    soundService.playClick();
    
    // Update local preferences first for immediate UI response
    setPreferences(prev => ({ ...prev, bioProfile }));
    
    // Fetch the absolute latest session directly from Supabase to avoid React state race conditions
    const { data: { session } } = await supabase.auth.getSession();
    const activeUserId = session?.user?.id || preferences.userId;
    const isUserLoggedIn = !!session || preferences.isLoggedIn;

    // If logged in, sync with Supabase
    if (isUserLoggedIn && activeUserId) {
      try {
        await supabase.from('profiles').update({
          bio_profile: bioProfile,
          updated_at: new Date().toISOString()
        }).eq('id', activeUserId);
      } catch (err) {
        console.error("Error sincronizando bio-perfil:", err);
      }
    }
    
    setShowOnboarding(false);
  }, [preferences.isLoggedIn, preferences.userId]);

  const renderContent = () => {
    const commonProps = {
      supplements: recalibratedSupplements,
      activeSuppIds,
      onVote: handleVote,
      onRemoveVote: (id: string) => {
        setSupplements(prev => prev.map(s => s.id === id ? { ...s, userVote: undefined } : s));
      },
      onToggleProtocol: toggleProtocol,
      onStartOnboarding: () => setShowOnboarding(true)
    };

    if (['dashboard', 'advisor', 'emerging'].includes(currentView) && !preferences.isPremium) {
       const titles: any = { dashboard: 'DASHBOARD BIOMÉTRICO', advisor: 'ADVISOR IA', emerging: 'COMPUESTOS EMERGENTES' };
       return <PremiumGate section={titles[currentView]} onAttemptUpgrade={handleUpgradeAttempt} />;
    }

    switch (currentView) {
      case 'home': return <Hero onStart={() => preferences.isLoggedIn ? handleViewChange('advisor') : setShowOnboarding(true)} />;
      case 'ranking': return <RankingView {...commonProps} isSyncing={isSyncingScientific} onSync={triggerScientificRecalibration} preferences={preferences} onAttemptUpgrade={handleUpgradeAttempt} />;
      case 'emerging': return <EmergingView {...commonProps} preferences={preferences} onStartOnboarding={() => setShowOnboarding(true)} />;
      case 'stacks': return <StacksView {...commonProps} onActivateStack={handleActivateStack} isPremium={preferences.isPremium} onAttemptUpgrade={handleUpgradeAttempt} />;
      case 'advisor': return <AdvisorView supplements={supplements} preferences={preferences} />;
      case 'dashboard': return <Dashboard preferences={preferences} supplements={recalibratedSupplements} activeSuppIds={activeSuppIds} onToggleActivity={toggleProtocol} onSyncProtocols={syncProtocolsFromDashboard} onVote={handleVote} onRemoveVote={(id) => setSupplements(prev => prev.map(s => s.id === id ? { ...s, userVote: undefined } : s))} onActivateStack={handleActivateStack} onStartOnboarding={() => setShowOnboarding(true)} />;
      case 'community': return <CommunityView preferences={preferences} supplements={supplements} onTogglePremium={handleUpgradeAttempt} onUpdatePreferences={handleUpdatePreferences} />;
      default: return <Hero onStart={() => preferences.isLoggedIn ? handleViewChange('advisor') : setShowOnboarding(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary transition-all duration-300" style={{ zoom: preferences.visionScale }}>
      <Layout currentView={currentView} onChangeView={handleViewChange} preferences={preferences} onToggleSound={() => setPreferences(p => ({...p, soundEnabled: !p.soundEnabled}))} onTogglePremium={handleUpgradeAttempt} onToggleTheme={() => setPreferences(p => ({...p, theme: p.theme === 'dark' ? 'light' : 'dark'}))} onUpdatePreferences={handleUpdatePreferences} onStartOnboarding={() => setShowOnboarding(true)} onLogout={handleLogout}>
        {renderContent()}
        {showOnboarding && <OnboardingQuestionnaire isLoggedIn={preferences.isLoggedIn} onComplete={handleOnboardingComplete} onClose={() => setShowOnboarding(false)} />}
      </Layout>
      <ChatBot preferences={preferences} supplements={supplements} onUpgrade={handleUpgradeAttempt} />
    </div>
  );
};

export default App;