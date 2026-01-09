
import React from 'react';
import { ArrowRight, Activity, Zap, Brain } from 'lucide-react';
import { soundService } from '../services/sound';

interface Props {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; text: string; colorClass: string }> = ({ icon, title, text, colorClass }) => (
  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface/50 border border-border backdrop-blur-sm hover:bg-surface transition-colors duration-300 shadow-sm">
    <div className={`p-3 rounded-xl bg-background mb-4 border border-border ${colorClass}`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-primary mb-2 tracking-tight uppercase">{title}</h3>
    <p className="text-sm text-secondary leading-relaxed font-medium">{text}</p>
  </div>
);

const Hero: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden w-full bg-background">
      {/* Background Elements - Precision Grids & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full relative z-10 pt-20 px-4 sm:px-12 lg:px-20">
        
        {/* Main Text Section */}
        <div className="text-center max-w-[1600px] mx-auto mb-20 flex flex-col items-center">
          
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-primary animate-slide-up mb-6 leading-[0.95]" style={{ animationDelay: '0.1s' }}>
              Potencia tu cuerpo y mente
            </h1>
            
            {/* Marco de Precisión Científica */}
            <div className="inline-flex items-center gap-6 px-10 py-5 rounded-2xl border border-border bg-surface/80 backdrop-blur-xl animate-fade-in shadow-2xl transition-all duration-700 hover:border-indigo-500/30 group">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00FF90] shadow-[0_0_12px_#00FF90] animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#00FF90] animate-ping opacity-40" />
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-indigo-500 dark:text-indigo-400 tracking-[0.02em] leading-none uppercase italic">
                con ciencia y precisión
              </h2>
            </div>
          </div>
          
          <p className="text-lg md:text-2xl text-secondary mb-14 max-w-4xl mx-auto leading-relaxed animate-slide-up font-medium opacity-90 tracking-tight" style={{ animationDelay: '0.3s' }}>
            Descubre combinaciones de suplementos ("stacks") diseñados para tus objetivos específicos: energía, sueño, concentración, longevidad y más...
          </p>

          <button 
            onClick={() => { soundService.playClick(); onStart(); }}
            className="group relative inline-flex items-center justify-center px-16 py-6 text-xl font-black uppercase italic tracking-[0.2em] text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] hover:-translate-y-1.5 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            Empieza Ahora
            <ArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1440px] mx-auto animate-slide-up" style={{ animationDelay: '0.5s' }}>
          
          <FeatureCard 
            icon={<Activity size={32} />} 
            title="Sincronización Biológica"
            text="Algoritmos de precisión que analizan tus biomarcadores para sugerir el protocolo exacto en el momento metabólico ideal."
            colorClass="text-[#FF4D4F] shadow-[0_0_20px_rgba(255,77,79,0.15)] bg-red-500/5"
          />

          <FeatureCard 
            icon={<Zap size={32} />} 
            title="Sinergia de Compuestos"
            text="Stacks moleculares validados por su farmacocinética para maximizar la absorción sistémica y evitar antagonismos."
            colorClass="text-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-500/5"
          />

          <FeatureCard 
            icon={<Brain size={32} />} 
            title="Rigor Científico"
            text="Base de datos integrada con PubMed. Cada score se recalibra semanalmente según los últimos meta-análisis publicados."
            colorClass="text-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.15)] bg-purple-500/5"
          />
          
        </div>

      </div>
    </div>
  );
};

export default Hero;
