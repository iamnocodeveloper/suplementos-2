import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ViewState, UserPreferences, CommunityRank, BioProfile, UserRecord } from '../types';
import { 
  Activity, Zap, BarChart2, Home, LayoutGrid, Users, 
  MessageCircle, TrendingUp, Moon, Sun, User, Twitter, Instagram, Facebook, Linkedin, 
  Volume2, VolumeX, Crown, Target, Camera, X, CheckCircle, ArrowUpRight, Heart, Edit2, Check, LogOut, Lock, Key, ShieldCheck, HeartPulse, Sparkles, AlertCircle, Eye, EyeOff, Ruler, Weight, CalendarDays, Dumbbell, Menu, Mail, UserPlus
} from 'lucide-react';
import { soundService } from '../services/sound';
import { supabase } from '../src/lib/supabase';

interface Props {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  preferences: UserPreferences;
  onToggleSound: () => void;
  onTogglePremium: () => void;
  onToggleTheme: () => void;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onStartOnboarding: () => void;
  onLogout: () => void;
}

const NavItem: React.FC<{ 
  active: boolean; 
  label: string; 
  isRestricted?: boolean;
  isPremium?: boolean;
  icon?: React.ReactNode; 
  onClick: () => void 
}> = ({ active, label, isRestricted, isPremium, icon, onClick }) => (
  <button
    onClick={() => {
      soundService.playClick();
      onClick();
    }}
    className={`
      flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium relative group
      ${active 
        ? 'text-primary bg-primary/10' 
        : 'text-secondary hover:text-primary hover:bg-primary/5'
      }
    `}
  >
    {icon && <span className="md:hidden lg:inline">{icon}</span>}
    <span>{label}</span>
    {isRestricted && !isPremium && (
      <Lock size={10} className="ml-1 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
    )}
  </button>
);

const Layout: React.FC<Props> = ({ 
  children, 
  currentView, 
  onChangeView, 
  preferences, 
  onToggleSound,
  onTogglePremium,
  onToggleTheme,
  onUpdatePreferences,
  onStartOnboarding,
  onLogout
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'stats' | 'bio'>('stats');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tempName, setTempName] = useState(preferences.name || 'Carlos');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentScore = useMemo(() => {
    const points = preferences.reputation.totalPoints;
    let score = 0;
    if (points <= 20) score = points;
    else if (points <= 80) score = 20 + (points - 20) / 2;
    else if (points <= 155) score = 50 + (points - 80) / 3;
    else if (points <= 230) score = 75 + (points - 155) / 5;
    else if (points <= 330) score = 90 + (points - 230) / 10;
    else score = 100;
    return Math.min(100, score);
  }, [preferences.reputation.totalPoints]);

  const currentRank = useMemo((): CommunityRank => {
    if (currentScore >= 80) return 'Experto';
    if (currentScore >= 60) return 'Experimentador';
    if (currentScore >= 40) return 'Explorador';
    if (currentScore >= 20) return 'Aprendiz';
    return 'Amateur';
  }, [currentScore]);

  // Handle auto-close modal when session is detected
  useEffect(() => {
    if (preferences.isLoggedIn && isLoginOpen) {
      setIsLoginOpen(false);
      setAuthLoading(false);
    }
  }, [preferences.isLoggedIn, isLoginOpen]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    
    setLoginError(null);
    setAuthLoading(true);
    soundService.playClick();

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        });

        if (error) {
           if (error.message.includes('Email not confirmed')) {
             throw new Error('Sincronización pendiente: Verifica tu correo electrónico.');
           }
           throw error;
        }
        
        setIsLoginOpen(false);
        setAuthLoading(false);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: loginEmail.trim(),
          password: loginPassword,
          options: {
            data: {
              full_name: registerName,
            }
          }
        });

        if (error) throw error;
        
        if (data.user && data.session) {
           setIsLoginOpen(false);
           setAuthLoading(false);
        } else {
           alert('Protocolo de Registro Iniciado: Revisa tu correo para confirmar tu bio-identidad.');
           setAuthMode('login');
           setAuthLoading(false);
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error en la autenticación');
      setAuthLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-indigo-500/30 flex flex-col font-sans transition-colors duration-300 overflow-x-hidden">
      {isLoginOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setIsLoginOpen(false)} />
          <div className="relative z-10 bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 w-full max-w-md rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-6 right-6 text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
            <div className="p-8 sm:p-10 space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 rotate-3">
                  {authMode === 'login' ? <ShieldCheck size={32} className="text-white" /> : <UserPlus size={32} className="text-white" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                  {authMode === 'login' ? 'Acceso de Usuario' : 'Crear Perfil'}
                </h3>
                <p className="text-sm text-secondary italic mt-2">
                  {authMode === 'login' ? 'Inicia sesión para sincronizar tus protocolos.' : 'Únete a la comunidad de biohacking.'}
                </p>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                {loginError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold animate-fade-in">
                    <AlertCircle size={16} /> {loginError}
                  </div>
                )}
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-2 italic">Nombre Completo</label>
                    <input type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder="Tu nombre" className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 text-slate-900 dark:text-white italic" required />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-2 italic">Correo Electrónico</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="biohacker@ejemplo.com" className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 text-slate-900 dark:text-white italic" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-2 italic">Clave de Acceso</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 text-slate-900 dark:text-white italic" required />
                </div>
                <button type="submit" disabled={authLoading} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] italic shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all mt-4 disabled:opacity-50">
                  {authLoading ? 'Sincronizando...' : (authMode === 'login' ? 'Sincronizar Datos' : 'Registrar Perfil')}
                </button>
              </form>
              <div className="text-center">
                <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">
                  {authMode === 'login' ? '¿Nuevo en el laboratorio?' : '¿Ya tienes un perfil?'} 
                  <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
                    {authMode === 'login' ? 'Crear Perfil' : 'Iniciar Sesión'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => onChangeView('home')}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.5)]"><Activity size={20} className="text-white" /></div>
              <span className="font-bold text-lg tracking-tight text-primary">Suplementos Inteligentes</span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <NavItem active={currentView === 'home'} label="Inicio" onClick={() => onChangeView('home')} />
              <NavItem active={currentView === 'ranking'} label="Ranking" onClick={() => onChangeView('ranking')} />
              <NavItem active={currentView === 'emerging'} label="Emergentes" isRestricted={true} isPremium={preferences.isPremium} onClick={() => onChangeView('emerging')} />
              <NavItem active={currentView === 'stacks'} label="Stacks" onClick={() => onChangeView('stacks')} />
              <NavItem active={currentView === 'dashboard'} label="Dashboard" isRestricted={true} isPremium={preferences.isPremium} onClick={() => onChangeView('dashboard')} />
              <NavItem active={currentView === 'advisor'} label="Advisor" isRestricted={true} isPremium={preferences.isPremium} onClick={() => onChangeView('advisor')} />
              <NavItem active={currentView === 'community'} label="Comunidad" onClick={() => onChangeView('community')} />
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary/5">
                <Menu size={24} />
              </button>
              <div className="hidden md:flex items-center space-x-4">
                  <button onClick={onToggleSound} className="p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary/5">{preferences.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
                  <button onClick={onToggleTheme} className="p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary/5">{preferences.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}</button>
                  {preferences.isLoggedIn ? (
                    <div onClick={() => { soundService.playClick(); setIsProfileOpen(!isProfileOpen); setProfileTab('stats'); }} className={`flex items-center space-x-2 text-sm font-medium text-primary px-2 py-1 rounded-full hover:bg-primary/5 cursor-pointer transition-all border ${isProfileOpen ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-transparent hover:border-border'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-secondary border relative transition-all ${preferences.isPremium ? 'border-amber-500 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'border-border bg-surface'}`}>
                        {preferences.avatar ? <img src={preferences.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" /> : <User size={14} className={preferences.isPremium ? 'text-amber-500' : 'text-secondary'} />}
                        {preferences.isPremium && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-black shadow-[0_0_8px_rgba(245,158,11,0.6)] z-10 animate-float-crown"><Crown size={8} fill="currentColor" className="text-black" /></div>}
                      </div>
                      <span className={`hidden sm:inline ${preferences.isPremium ? 'text-amber-600 dark:text-amber-500 font-black italic uppercase tracking-tighter' : 'text-primary'}`}>{preferences.name}</span>
                    </div>
                  ) : (
                    <button onClick={() => { soundService.playClick(); setIsLoginOpen(true); }} className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all text-primary"><Key size={14} className="text-indigo-600 dark:text-indigo-400" /> Identificarse</button>
                  )}
                  <button onClick={onTogglePremium} className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all shadow-lg ${preferences.isPremium ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black border border-transparent shadow-amber-500/20' : 'border border-amber-500/50 text-amber-500 hover:bg-amber-500/10'}`}>PRO</button>
              </div>
            </div>
          </div>
        </div>
        {isProfileOpen && (
          <>
            <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
            <div className="absolute top-16 right-4 sm:right-8 w-80 bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] animate-slide-up overflow-hidden z-50 flex flex-col max-h-[85vh]">
              <div className="relative bg-gradient-to-br from-indigo-500/10 dark:from-indigo-900/40 to-slate-50 dark:to-black p-6">
                 <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl mb-4 border border-slate-200 dark:border-white/5">
                    <button onClick={() => { soundService.playClick(); setProfileTab('stats'); }} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase italic tracking-widest transition-all ${profileTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}>Métricas</button>
                    <button onClick={() => { soundService.playClick(); setProfileTab('bio'); }} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase italic tracking-widest transition-all ${profileTab === 'bio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}>Bio-Perfil</button>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-black border-2 flex items-center justify-center relative shadow-xl overflow-hidden transition-all ${preferences.isPremium ? 'border-amber-500' : 'border-indigo-500/40'}`}>
                          {preferences.avatar ? <img src={preferences.avatar} alt="Profile" className="w-full h-full object-cover" /> : <User size={20} className={preferences.isPremium ? 'text-amber-500' : 'text-indigo-500 dark:text-indigo-400'} />}
                          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"><Camera size={14} className="text-white" /></div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (event) => onUpdatePreferences({ avatar: event.target?.result as string });
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }} className="hidden" accept="image/*" />
                    </div>
                    <div className="flex-grow min-w-0">
                        {isEditingName ? (
                          <input autoFocus type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onBlur={() => { onUpdatePreferences({ name: tempName.trim() }); setIsEditingName(false); }} onKeyDown={(e) => e.key === 'Enter' && (onUpdatePreferences({ name: tempName.trim() }), setIsEditingName(false))} className="bg-white dark:bg-black/40 border border-indigo-500/50 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs font-black uppercase italic tracking-tighter w-full outline-none" />
                        ) : (
                          <div className="flex items-center gap-2 group/name cursor-pointer overflow-visible" onClick={() => { soundService.playClick(); setIsEditingName(true); }}>
                            <h3 className={`text-sm font-black italic uppercase tracking-tighter break-words ${preferences.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'}`}>{preferences.name}</h3>
                            <Edit2 size={10} className="text-slate-400 dark:text-white/20 shrink-0" />
                          </div>
                        )}
                        <p className="text-[7px] text-secondary font-bold uppercase tracking-widest opacity-40">Bio-ID: #{preferences.userId || 'Guest'}</p>
                    </div>
                 </div>
              </div>
              <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-transparent overflow-x-hidden">
                 {profileTab === 'stats' ? (
                   <div className="space-y-6 animate-fade-in pr-1">
                      <section className="space-y-3">
                        <div className="flex justify-between items-end gap-2 pr-1">
                          <span className="text-[9px] font-black text-secondary uppercase tracking-widest italic opacity-40 whitespace-nowrap overflow-visible">Nivel de Progresión</span>
                          <span className="text-sm font-black text-indigo-600 italic whitespace-nowrap">{currentScore.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${currentScore}%` }} />
                        </div>
                        <div className="flex justify-between items-center pr-1">
                          <span className="text-[9px] font-black text-primary italic uppercase whitespace-nowrap">{currentRank}</span>
                          <span className="text-[7px] font-black text-secondary/40 uppercase">PTS: {preferences.reputation.totalPoints.toFixed(0)}</span>
                        </div>
                      </section>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-center shadow-sm hover:border-red-500/20 transition-all">
                           <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-xl bg-red-500/5 border-2 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                              <Heart size={16} className="text-red-500" fill="currentColor" stroke="black" strokeWidth={1.5} />
                           </div>
                           <span className="text-base font-black text-slate-900 dark:text-white italic">{preferences.reputation.likesReceived || 0}</span>
                           <p className="text-[7px] font-black text-secondary uppercase tracking-widest mt-1">Me Gusta</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-center shadow-sm hover:border-emerald-500/20 transition-all">
                           <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-xl bg-emerald-500/5 border-2 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-500" fill="currentColor" stroke="black" strokeWidth={1.5} />
                           </div>
                           <span className="text-base font-black text-slate-900 dark:text-white italic">{preferences.reputation.usefulReceived || 0}</span>
                           <p className="text-[7px] font-black text-secondary uppercase tracking-widest mt-1">Útil</p>
                        </div>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-6 animate-fade-in pb-4 pr-1">
                      {preferences.bioProfile ? (
                        <div className="space-y-6">
                           <div className="p-4 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl flex items-center gap-3">
                              <HeartPulse className="text-indigo-600 dark:text-indigo-500" size={18} />
                              <div>
                                <h4 className="text-[10px] font-black uppercase italic leading-none mb-1 pr-1">Estado Biológico</h4>
                                <p className="text-[7px] text-indigo-500 dark:text-indigo-400 font-medium italic">Datos sincronizados.</p>
                              </div>
                           </div>

                           <div className="p-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl">
                              <div className="text-[7px] font-black text-secondary uppercase tracking-[0.2em] mb-1 italic opacity-60">Identidad Completa</div>
                              <div className="text-[10px] font-black text-primary italic uppercase break-words">{preferences.name}</div>
                           </div>
                           
                           <div className="grid grid-cols-3 gap-2">
                             <div className="bg-slate-50 dark:bg-black/40 p-2 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
                                <CalendarDays size={10} className="text-secondary mb-1 opacity-60" />
                                <span className="text-[10px] font-black text-primary italic leading-none">{preferences.bioProfile.age}</span>
                                <span className="text-[6px] font-bold text-secondary uppercase tracking-tighter">Años</span>
                             </div>
                             <div className="bg-slate-50 dark:bg-black/40 p-2 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
                                <Weight size={10} className="text-secondary mb-1 opacity-60" />
                                <span className="text-[10px] font-black text-primary italic leading-none">{preferences.bioProfile.weight}</span>
                                <span className="text-[6px] font-bold text-secondary uppercase tracking-tighter">Kg</span>
                             </div>
                             <div className="bg-slate-50 dark:bg-black/40 p-2 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
                                <Ruler size={10} className="text-secondary mb-1 opacity-60" />
                                <span className="text-[10px] font-black text-primary italic leading-none">{preferences.bioProfile.height}</span>
                                <span className="text-[6px] font-bold text-secondary uppercase tracking-tighter">Cm</span>
                             </div>
                           </div>

                           <div className="space-y-4">
                             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-white/5 pr-4">
                               <div className="flex items-center gap-2">
                                 <Moon size={12} className="text-indigo-500" />
                                 <span className="text-[8px] font-black text-secondary uppercase tracking-widest italic opacity-60">Sueño Diario</span>
                               </div>
                               <span className="text-[10px] font-black text-primary italic">{preferences.bioProfile.sleepHours}h / {preferences.bioProfile.sleepQuality}</span>
                             </div>
                             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-white/5 pr-4">
                               <div className="flex items-center gap-2">
                                 <Dumbbell size={12} className="text-[#FF4D4F]" />
                                 <span className="text-[8px] font-black text-secondary uppercase tracking-widest italic opacity-60">Frecuencia</span>
                               </div>
                               <span className="text-[10px] font-black text-primary italic">{preferences.bioProfile.weeklyFrequency} d/semana</span>
                             </div>
                           </div>

                           <div className="space-y-1 pr-1">
                              <label className="text-[8px] font-black text-secondary uppercase tracking-widest italic ml-1 opacity-60">Objetivo de Laboratorio</label>
                              <select 
                                value={preferences.bioProfile.primaryGoal} 
                                onChange={(e) => onUpdatePreferences({ bioProfile: { ...preferences.bioProfile!, primaryGoal: e.target.value } })} 
                                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-[11px] italic font-bold outline-none focus:border-indigo-600 text-slate-900 dark:text-white"
                              >
                                {['Rendimiento físico', 'Mejora cognitiva', 'Control de peso', 'Sueño y recuperación', 'Bienestar general', 'Belleza y piel', 'Otro'].map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                           </div>

                           <div className="pt-4 border-t border-slate-100 dark:border-white/5 pr-1">
                              <button 
                                onClick={() => {
                                  soundService.playClick();
                                  onUpdatePreferences({ isProfilePrivate: !preferences.isProfilePrivate });
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all group ${preferences.isProfilePrivate ? 'bg-red-500/5 border-red-500/20' : 'bg-indigo-600/5 border-indigo-600/20'}`}
                              >
                                <div className="flex items-center gap-3">
                                  {preferences.isProfilePrivate ? <EyeOff size={14} className="text-red-500" /> : <Eye size={14} className="text-indigo-600" />}
                                  <span className={`text-[8px] font-black uppercase tracking-widest italic ${preferences.isProfilePrivate ? 'text-red-600' : 'text-indigo-600'} pr-1`}>
                                    {preferences.isProfilePrivate ? 'Perfil Privado' : 'Perfil Público'}
                                  </span>
                                </div>
                                <div className={`w-8 h-4 rounded-full relative transition-all ${preferences.isProfilePrivate ? 'bg-red-500' : 'bg-indigo-600'}`}>
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${preferences.isProfilePrivate ? 'left-4.5' : 'left-0.5'}`} />
                                </div>
                              </button>
                              <p className="text-[7px] text-secondary font-medium italic mt-2 text-center opacity-60 px-4">
                                {preferences.isProfilePrivate ? 'Tus parámetros biométricos están ocultos a otros usuarios.' : 'Otros usuarios pueden ver tus metas y nivel de actividad.'}
                              </p>
                           </div>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                          <Activity size={32} className="text-indigo-500 mb-4 opacity-20" />
                          <p className="text-[10px] text-secondary font-black uppercase tracking-widest italic leading-relaxed opacity-60 pr-1">
                            Bio-perfil no inicializado.
                          </p>
                          <button onClick={() => { setIsProfileOpen(false); onStartOnboarding(); }} className="mt-4 text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase italic underline">Completar Test</button>
                        </div>
                      )}
                   </div>
                 )}
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-white/5 space-y-2 bg-slate-50 dark:bg-black/20 mt-auto">
                  <button onClick={handleLogoutClick} className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[8px] tracking-[0.2em] italic hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">Cerrar Sesión <LogOut size={10} /></button>
              </div>
            </div>
          </>
        )}
      </nav>
      <main className="pt-16 pb-20 md:pb-0 flex-grow">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-[90] border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="max-w-[1440px] mx-auto px-2 py-1.5 flex items-center justify-between gap-1">
          <button
            onClick={() => onChangeView('home')}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold transition-colors ${
              currentView === 'home' ? 'text-primary bg-primary/5' : 'text-secondary'
            }`}
          >
            <Home size={18} />
            <span>Inicio</span>
          </button>
          <button
            onClick={() => onChangeView('ranking')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest transition-all duration-300 ${
              currentView === 'ranking' ? 'text-indigo-600 bg-indigo-600/10 shadow-[0_0_15px_rgba(79,70,229,0.2)] scale-110' : 'text-secondary hover:text-primary'
            }`}
          >
            <BarChart2 size={18} />
            <span>Ranking</span>
          </button>
          <button
            onClick={() => onChangeView('stacks')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest transition-all duration-300 ${
              currentView === 'stacks' ? 'text-indigo-600 bg-indigo-600/10 shadow-[0_0_15px_rgba(79,70,229,0.2)] scale-110' : 'text-secondary hover:text-primary'
            }`}
          >
            <Zap size={18} />
            <span>Stacks</span>
          </button>
          <button
            onClick={() => onChangeView('advisor')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest transition-all duration-300 ${
              currentView === 'advisor' ? 'text-indigo-600 bg-indigo-600/10 shadow-[0_0_15px_rgba(79,70,229,0.2)] scale-110' : 'text-secondary hover:text-primary'
            }`}
          >
            <MessageCircle size={18} />
            <span>AI</span>
          </button>
          <button
            onClick={() => onChangeView('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest transition-all duration-300 ${
              currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-600/10 shadow-[0_0_15px_rgba(79,70,229,0.2)] scale-110' : 'text-secondary hover:text-primary'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Panel</span>
          </button>
          <button
            onClick={() => onChangeView('community')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest transition-all duration-300 ${
              currentView === 'community' ? 'text-indigo-600 bg-indigo-600/10 shadow-[0_0_15px_rgba(79,70,229,0.2)] scale-110' : 'text-secondary hover:text-primary'
            }`}
          >
            <Users size={18} />
            <span>Social</span>
          </button>
        </div>
      </nav>

      {/* Mobile Side Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-[160] w-[80%] max-w-[300px] bg-white dark:bg-[#0c0c0c] border-l border-border shadow-2xl md:hidden flex flex-col animate-slide-left">
             <div className="p-6 border-b border-border flex items-center justify-between">
                <span className="text-lg font-black uppercase italic tracking-tighter text-primary">Menú</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-secondary hover:text-primary"><X size={24} /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* User Profile Section */}
                {preferences.isLoggedIn ? (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10" onClick={() => { setIsMobileMenuOpen(false); setIsProfileOpen(true); }}>
                    <div className="relative">
                      {preferences.avatar ? <img src={preferences.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500" /> : <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border-2 border-indigo-500/20"><User size={24} className="text-indigo-500" /></div>}
                      {preferences.isPremium && <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-black"><Crown size={10} className="text-black" fill="currentColor" /></div>}
                    </div>
                    <div>
                      <h4 className="font-black text-primary italic uppercase">{preferences.name}</h4>
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Ver Bio-Perfil</p>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs italic shadow-lg shadow-indigo-500/30">
                    Iniciar Sesión
                  </button>
                )}

                {/* Additional Navigation */}
                <div className="space-y-2">
                  <h5 className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] mb-4 opacity-60">Navegación</h5>
                  <button onClick={() => { onChangeView('emerging'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'emerging' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-primary/5'}`}>
                    <Sparkles size={18} /> <span className="font-bold uppercase text-sm">Emergentes</span>
                    {(!preferences.isPremium) && <Lock size={12} className="ml-auto text-amber-500" />}
                  </button>
                  <button onClick={() => { onChangeView('advisor'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'advisor' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-primary/5'}`}>
                    <MessageCircle size={18} /> <span className="font-bold uppercase text-sm">Advisor AI</span>
                    {(!preferences.isPremium) && <Lock size={12} className="ml-auto text-amber-500" />}
                  </button>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h5 className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] mb-4 opacity-60">Ajustes</h5>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-3 text-secondary">
                      {preferences.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                      <span className="text-sm font-bold uppercase">Tema</span>
                    </div>
                    <button onClick={onToggleTheme} className={`w-12 h-6 rounded-full relative transition-colors ${preferences.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.theme === 'dark' ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-3 text-secondary">
                      {preferences.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      <span className="text-sm font-bold uppercase">Sonido</span>
                    </div>
                    <button onClick={onToggleSound} className={`w-12 h-6 rounded-full relative transition-colors ${preferences.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.soundEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* PRO Action */}
                <button onClick={() => { onTogglePremium(); setIsMobileMenuOpen(false); }} className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest italic border-2 transition-all ${preferences.isPremium ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black border-transparent shadow-lg shadow-amber-500/20'}`}>
                  {preferences.isPremium ? 'Gestionar Plan PRO' : 'Actualizar a PRO'}
                </button>
             </div>
             
             {preferences.isLoggedIn && (
               <div className="p-6 border-t border-border">
                 <button onClick={() => { handleLogoutClick(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-red-500 font-bold uppercase text-xs tracking-widest hover:text-red-600">
                   <LogOut size={16} /> Cerrar Sesión
                 </button>
               </div>
             )}
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;