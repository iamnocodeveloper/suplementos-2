import React, { useState } from 'react';
import { Target, Activity, User, ArrowRight, ArrowLeft, CheckCircle2, X, Key, ShieldCheck, Info, AlertCircle } from 'lucide-react';
import { BioProfile, UserRecord, UserPreferences } from '../types';
import { soundService } from '../services/sound';

interface Props {
  isLoggedIn: boolean;
  onComplete: (data: BioProfile, authData?: Partial<UserRecord>) => void;
  onClose: () => void;
}

const OnboardingQuestionnaire: React.FC<Props> = ({ isLoggedIn, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<Partial<BioProfile>>({
    primaryGoal: 'Bienestar general',
    energyLevel: 7,
    stressLevel: 4,
    sleepHours: 7,
    sleepQuality: 'regular',
    sex: 'masculino',
    age: 28,
    height: 175,
    weight: 70,
    practicesSport: true,
    weeklyFrequency: 3,
    specialDiet: 'Ninguna',
    currentSupplements: '',
    sportsList: '',
    medicalConditions: ''
  });

  const getUserDB = (): Record<string, UserRecord> => {
    const db = localStorage.getItem('SI_USER_DATABASE');
    return db ? JSON.parse(db) : {};
  };

  const handleAuth = () => {
    setError(null);
    const db = getUserDB();

    if (authMode === 'register') {
      if (!nickname || !password) {
        setError('Por favor, rellena todos los campos.');
        return;
      }
      if (db[nickname]) {
        setError('Este nombre de usuario o correo ya está registrado.');
        return;
      }
      // Proceder con el completado guardando los datos básicos + password para el primer registro
      onComplete(data as BioProfile, { 
        userId: nickname, 
        name: nickname, 
        isLoggedIn: true,
        password: password
      });
    } else {
      const user = db[nickname];
      if (!user || user.password !== password) {
        setError('Credenciales incorrectas.');
        return;
      }
      // Loguear y fusionar datos
      onComplete(data as BioProfile, { 
        userId: nickname, 
        name: user.name, 
        isLoggedIn: true 
      });
    }
  };

  const nextStep = () => {
    soundService.playClick();
    if (step < 6) {
      setStep(step + 1);
    } else {
      if (isLoggedIn) {
        onComplete(data as BioProfile);
      } else {
        handleAuth();
      }
    }
  };

  const prevStep = () => {
    soundService.playClick();
    if (step > 1) setStep(step - 1);
  };

  const updateData = (updates: Partial<BioProfile>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4 leading-none">¿Cuál es tu objetivo?</h3>
              <p className="text-slate-500 font-medium italic">Selecciona tu prioridad para recalibrar tus recomendaciones.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Rendimiento físico', 'Mejora cognitiva', 'Control de peso', 'Sueño y recuperación', 'Bienestar general', 'Belleza y piel', 'Otro'].map(goal => (
                <button
                  key={goal}
                  onClick={() => updateData({ primaryGoal: goal })}
                  className={`group p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between ${data.primaryGoal === goal ? 'border-indigo-600 bg-indigo-50 shadow-xl' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <span className={`font-black uppercase italic tracking-tighter text-sm ${data.primaryGoal === goal ? 'text-indigo-950' : 'text-slate-600'}`}>{goal}</span>
                  {data.primaryGoal === goal && <CheckCircle2 size={24} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4 leading-none">Estado Vital</h3>
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase text-slate-400">Energía (1-10)</span><span className="text-2xl font-black text-indigo-600">{data.energyLevel}</span></div>
                <input type="range" min="1" max="10" value={data.energyLevel} onChange={(e) => updateData({ energyLevel: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase text-slate-400">Estrés (1-10)</span><span className="text-2xl font-black text-red-500">{data.stressLevel}</span></div>
                <input type="range" min="1" max="10" value={data.stressLevel} onChange={(e) => updateData({ stressLevel: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400">Horas de Sueño</span>
                  <input type="number" value={data.sleepHours} onChange={(e) => updateData({ sleepHours: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-950 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400">Calidad</span>
                  <div className="flex gap-1">
                    {['pobre', 'regular', 'buena'].map(q => (
                      <button key={q} onClick={() => updateData({ sleepQuality: q as any })} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${data.sleepQuality === q ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{q}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4 leading-none">Biometría</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Edad</label><input type="number" value={data.age} onChange={(e) => updateData({ age: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 focus:bg-white transition-all" /></div>
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Sexo</label><select value={data.sex} onChange={(e) => updateData({ sex: e.target.value as any })} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 focus:bg-white transition-all outline-none"><option value="masculino">Masculino</option><option value="femenino">Femenino</option><option value="otro">Otro</option></select></div>
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Peso (kg)</label><input type="number" value={data.weight} onChange={(e) => updateData({ weight: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 focus:bg-white transition-all" /></div>
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Altura (cm)</label><input type="number" value={data.height} onChange={(e) => updateData({ height: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 focus:bg-white transition-all" /></div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4 leading-none">Actividad Física</h3>
            </div>
            <div className="space-y-8">
               <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                  <div><h4 className="font-black uppercase italic text-indigo-950">¿Practicas deporte?</h4><p className="text-xs text-slate-400 italic">Gimnasio, Running, Yoga, etc.</p></div>
                  <button onClick={() => updateData({ practicesSport: !data.practicesSport })} className={`w-16 h-8 rounded-full relative transition-all ${data.practicesSport ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${data.practicesSport ? 'left-9' : 'left-1'}`} /></button>
               </div>
               {data.practicesSport && (
                 <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">¿Qué disciplinas?</label><input type="text" value={data.sportsList} onChange={(e) => updateData({ sportsList: e.target.value })} placeholder="Ej: CrossFit, Natación..." className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 transition-all outline-none shadow-sm" /></div>
                    <div className="space-y-4"><div className="flex justify-between"><span className="text-[10px] font-black uppercase text-slate-400">Frecuencia Semanal</span><span className="font-black text-indigo-600">{data.weeklyFrequency} días</span></div><input type="range" min="1" max="7" value={data.weeklyFrequency} onChange={(e) => updateData({ weeklyFrequency: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600" /></div>
                 </div>
               )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4 leading-none">Salud y Hábitos</h3>
            </div>
            <div className="space-y-6">
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Dieta Especial</label><select value={data.specialDiet} onChange={(e) => updateData({ specialDiet: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 focus:bg-white transition-all outline-none"><option value="Ninguna">Ninguna</option><option value="Vegana">Vegana</option><option value="Vegetariana">Vegetariana</option><option value="Keto">Keto</option><option value="Intermitente">Intermitente</option></select></div>
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Afecciones o Alergias</label><input type="text" value={data.medicalConditions} onChange={(e) => updateData({ medicalConditions: e.target.value })} placeholder="Ej: Lactosa, Hipertensión..." className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 transition-all outline-none shadow-sm" /></div>
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">Suplementos Actuales</label><textarea value={data.currentSupplements} onChange={(e) => updateData({ currentSupplements: e.target.value })} placeholder="Proteína, Omega 3..." className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-950 focus:border-indigo-600 transition-all outline-none shadow-sm min-h-[100px] resize-none" /></div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-10 animate-fade-in flex flex-col items-center">
            {isLoggedIn ? (
              <div className="text-center space-y-8 py-10 w-full max-w-md">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <ShieldCheck size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Sesión Activa</h3>
                  <p className="text-slate-500 font-medium italic px-6">Identidad bio-analítica vinculada. Haz clic en guardar para actualizar tu bio-perfil.</p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-lg space-y-8">
                <div className="text-center mb-8">
                   <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase mb-4 leading-none">Vinculación de Datos</h3>
                   <p className="text-slate-500 font-medium italic">Para persistir tu bio-perfil es necesario registrar tu identidad.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 shadow-inner">
                  <button onClick={() => { soundService.playClick(); setAuthMode('register'); setError(null); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authMode === 'register' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Registrarse</button>
                  <button onClick={() => { soundService.playClick(); setAuthMode('login'); setError(null); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authMode === 'login' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Iniciar Sesión</button>
                </div>

                <div className="space-y-4 bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-fade-in">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Identificador Biohacker</label>
                    <div className="relative">
                      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Usuario o Email" className="w-full bg-white border-2 border-slate-200 rounded-2xl px-12 py-4 outline-none focus:border-indigo-600 text-slate-950 font-black shadow-sm" />
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Clave de Acceso</label>
                    <div className="relative">
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border-2 border-slate-200 rounded-2xl px-12 py-4 outline-none focus:border-indigo-600 text-slate-950 font-black shadow-sm" />
                      <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border-2 border-amber-100 text-amber-700">
                  <Info size={20} className="shrink-0" />
                  <p className="text-[11px] font-medium leading-relaxed">Al {authMode === 'register' ? 'registrarte' : 'iniciar sesión'}, vinculas tus resultados de este test a tu dashboard personal para un seguimiento en tiempo real.</p>
                </div>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col overflow-hidden font-sans">
      <div className="w-full pt-10 px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-6">
           <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Test Bio-Analítico</span><span className="text-sm font-black text-indigo-600 italic">Paso {step} de 6</span></div>
           <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={20} /></button>
        </div>
        <div className="max-w-4xl mx-auto h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${(step / 6) * 100}%` }} /></div>
      </div>
      <div className="flex-grow flex items-center justify-center p-8 overflow-y-auto no-scrollbar"><div className="max-w-4xl w-full">{renderStep()}</div></div>
      <div className="p-10 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 text-xs font-black uppercase italic tracking-widest transition-all ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-950'}`}><ArrowLeft size={16} /> Volver</button>
          <button onClick={nextStep} className="group flex items-center gap-5 px-12 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-xs tracking-[0.3em] italic shadow-xl shadow-indigo-200 hover:bg-indigo-500 hover:-translate-y-1 transition-all">
            {step === 6 ? (isLoggedIn ? 'Guardar y Sincronizar' : (authMode === 'register' ? 'Registrarse y Guardar' : 'Entrar y Guardar')) : 'Continuar'} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;