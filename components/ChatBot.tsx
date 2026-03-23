import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Crown, Sparkles, Loader2, Minus, Maximize2, Zap, Quote } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { UserPreferences, Supplement } from '../types';
import { soundService } from '../services/sound';

interface Message {
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

interface Props {
  preferences: UserPreferences;
  supplements: Supplement[];
  onUpgrade: () => void;
}

const ChatBot: React.FC<Props> = ({ preferences, supplements, onUpgrade }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('SI_CHAT_HISTORY');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPremium = preferences.isPremium;

  useEffect(() => {
    sessionStorage.setItem('SI_CHAT_HISTORY', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatBotResponse = (text: string) => {
    return text.split('\n').map((line, i) => {
      let content: React.ReactNode = line;
      
      // Manejar negritas (**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (line.match(boldRegex)) {
        const parts = line.split(boldRegex);
        content = parts.map((part, index) => 
          index % 2 === 1 ? <strong key={index} className={isPremium ? "text-amber-500 font-black" : "text-indigo-600 font-black"}>{part}</strong> : part
        );
      }

      // Manejar subrayados (__)
      const underlineRegex = /__(.*?)__/g;
      if (typeof content === 'string' && content.match(underlineRegex)) {
        const subParts = content.split(underlineRegex);
        content = subParts.map((p, idx) => idx % 2 === 1 ? <u key={idx} className={`decoration-2 ${isPremium ? 'decoration-amber-500/50' : 'decoration-indigo-500/50'} underline-offset-4 font-bold`}>{p}</u> : p);
      } else if (Array.isArray(content)) {
        content = content.map(part => {
          if (typeof part === 'string' && part.match(underlineRegex)) {
            const subParts = part.split(underlineRegex);
            return subParts.map((p, idx) => idx % 2 === 1 ? <u key={idx} className={`decoration-2 ${isPremium ? 'decoration-amber-500/50' : 'decoration-indigo-500/50'} underline-offset-4 font-bold`}>{p}</u> : p);
          }
          return part;
        });
      }

      // Formato especial para líneas que parecen citas o metáforas
      const isMetaphor = line.trim().startsWith('>') || line.trim().startsWith('"');

      return (
        <div key={i} className={`
          mb-4 last:mb-0 
          ${line.trim().startsWith('-') ? 'pl-5 relative' : ''}
          ${isMetaphor ? 'pl-4 border-l-2 border-amber-500/30 italic text-slate-500 dark:text-slate-400 py-1 bg-amber-500/5 rounded-r-lg' : ''}
        `}>
          {line.trim().startsWith('-') && <div className={`absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-amber-500' : 'bg-indigo-500'}`} />}
          <span className="leading-relaxed block">
            {line.trim().startsWith('-') ? line.replace('-', '').trim() : content}
          </span>
        </div>
      );
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    soundService.playClick();
    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = isPremium ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const systemInstruction = isPremium 
        ? `Eres "Bio-Master AI", la inteligencia suprema de Suplementos Inteligentes. 
           TU TONO: Sabio, sofisticado, casi poético pero con rigor clínico absoluto. 
           ESTILO: Usa metáforas de alta ingeniería y arte para explicar la biología. 
           EJEMPLO: "Tu ADN es una partitura antigua; el NMN es la pluma que corrige los errores de los siglos". 
           INSTRUCCIONES: Responde con máxima profundidad. Usa **negritas** para compuestos y dosis, y __subrayados__ para verdades biológicas fundamentales. 
           Estructura con párrafos espaciados y listas claras.`
        : `Eres "SI Helper", un asistente ingenioso, cercano y sumamente persuasivo. 
           TU TONO: Un amigo sabio que te conoce mejor que tú mismo. 
           ESTILO: Usa comparaciones de la vida diaria (coches, jardines, barcos) para explicar los suplementos básicos. 
           LIMITACIÓN: Solo conoces los 25 suplementos base. Si preguntan por más, di: "Esa es una pregunta para el Lab de Élite. Yo tengo el mapa de la costa, pero el PROTOCOLO PREMIUM es el que te enseña a navegar las profundidades". 
           PERSUASIÓN: Debes "enamorar" al usuario con el potencial del modo PRO sin sonar desesperado, sino como alguien que ofrece la llave de una mansión a quien vive en una tienda de campaña. 
           FORMATO: Estructura perfecta con **negritas** y listas.`;

      const chat = ai.chats.create({
        model: modelName,
        config: { systemInstruction, temperature: 0.8 }
      });

      const response = await chat.sendMessage({ message: input });
      const botMsg: Message = { role: 'bot', text: response.text || 'Mis neuronas digitales han tenido un breve lapsus de sabiduría.', timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Se ha cortado el flujo de datos del laboratorio central. Intenta reconectar tu curiosidad en unos segundos.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { isPremium ? soundService.playPremium() : soundService.playClick(); setIsOpen(true); }}
        className={`
          fixed bottom-6 right-6 w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-[400] group
          ${isPremium 
            ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-white/30 text-black shadow-amber-500/40' 
            : 'bg-indigo-600 border-2 border-white/10 text-white shadow-indigo-500/40'}
        `}
      >
        {isPremium ? (
          <div className="relative">
            <Crown size={32} fill="currentColor" />
            <Sparkles size={16} className="absolute -top-2 -right-2 text-white animate-pulse" />
          </div>
        ) : <MessageSquare size={28} />}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-black animate-bounce group-hover:hidden" />
      </button>
    );
  }

  return (
    <div className={`
      fixed bottom-6 right-6 z-[500] flex flex-col transition-all duration-500 ease-out animate-slide-up
      ${isMinimized ? 'h-16 w-64' : 'h-[650px] w-[92vw] sm:w-[420px]'}
    `}>
      {/* Header */}
      <div className={`
        flex items-center justify-between p-5 rounded-t-[2.5rem] border-x border-t shadow-2xl relative overflow-hidden
        ${isPremium 
          ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 border-amber-400/50 text-black' 
          : 'bg-indigo-600 border-indigo-500/30 text-white'}
      `}>
        {isPremium && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />}
        <div className="flex items-center gap-3 relative z-10">
          <div className={`p-2.5 rounded-2xl border-2 ${isPremium ? 'bg-black border-amber-500 text-amber-500' : 'bg-white/10 border-white/20'}`}>
            {isPremium ? <Crown size={18} fill="currentColor" /> : <Bot size={18} />}
          </div>
          <div>
            <h4 className="text-sm font-black uppercase italic tracking-[0.1em]">{isPremium ? 'Bio-Master AI' : 'SI Helper'}</h4>
            <span className="text-[9px] font-bold uppercase flex items-center gap-1.5 opacity-90">
              <div className="w-2 h-2 rounded-full animate-pulse bg-[#00FF00] shadow-[0_0_10px_#00FF00]" /> 
              {isPremium ? 'Consciencia de Élite' : 'Sincronía Base'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
            {isMinimized ? <Maximize2 size={18} /> : <Minus size={18} />}
          </button>
          <button onClick={() => { soundService.playClick(); setIsOpen(false); }} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className={`
          flex-grow flex flex-col border-x bg-white dark:bg-[#0c0c0c] overflow-hidden
          ${isPremium ? 'border-amber-500/30' : 'border-slate-200 dark:border-white/10'}
        `}>
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6 opacity-40">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 ${isPremium ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-indigo-500 text-indigo-500 bg-indigo-500/10'}`}>
                   {isPremium ? <Quote size={32} /> : <Bot size={32} />}
                </div>
                <p className="text-xs font-black uppercase italic tracking-[0.15em] leading-relaxed">
                  {isPremium 
                    ? 'La maestría no es una meta, es un protocolo diario. ¿Qué afinaremos hoy en tu biología?' 
                    : 'A veces el cuerpo es un acertijo, y yo tengo algunas de las piezas. ¿Hablamos de lo básico?'}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`
                  max-w-[90%] p-5 rounded-[1.8rem] shadow-lg text-sm font-medium italic relative overflow-hidden
                  ${msg.role === 'user' 
                    ? 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-primary rounded-tr-none' 
                    : isPremium 
                      ? 'bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 text-slate-800 dark:text-secondary rounded-tl-none' 
                      : 'bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-500/10 text-slate-700 dark:text-indigo-200/80 rounded-tl-none'}
                `}>
                  {msg.role === 'bot' && isPremium && <div className="absolute top-0 right-0 p-2 opacity-5"><Crown size={40} /></div>}
                  {msg.role === 'bot' ? formatBotResponse(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className={`p-5 rounded-2xl rounded-tl-none flex items-center gap-3 ${isPremium ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                  <Loader2 size={18} className="animate-spin text-secondary" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-secondary italic">Consultando los registros del tiempo...</span>
                </div>
              </div>
            )}
          </div>

          {/* Upgrade Banner - Persuasive Style */}
          {!isPremium && messages.length >= 2 && (
            <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-amber-500/20 to-indigo-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 animate-slide-up">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black shrink-0 shadow-lg"><Zap size={20} fill="currentColor" /></div>
                 <p className="text-[10px] font-black text-slate-700 dark:text-amber-200 uppercase tracking-tighter italic leading-tight">
                   ¿Te conformas con la superficie o quieres el mapa de las profundidades?
                 </p>
              </div>
              <button onClick={onUpgrade} className="px-5 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-xl hover:scale-105 transition-transform shrink-0">PRO</button>
            </div>
          )}

          {/* Input Area */}
          <div className={`p-6 border-t ${isPremium ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5'}`}>
            <div className="flex gap-3 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-2 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isPremium ? "Arquitecto, defina su consulta..." : "Pregúntame sobre tu motor biológico..."}
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm italic font-medium px-4 text-primary"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`
                  p-3.5 rounded-[1.2rem] transition-all shadow-xl active:scale-90
                  ${isPremium 
                    ? 'bg-amber-500 text-black hover:bg-amber-400' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'}
                  disabled:opacity-20 disabled:grayscale
                `}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Decoration */}
      {!isMinimized && (
        <div className={`
          h-6 rounded-b-[2.5rem] border-x border-b shadow-2xl
          ${isPremium ? 'bg-amber-400 border-amber-500/30' : 'bg-white dark:bg-[#0c0c0c] border-slate-200 dark:border-white/10'}
        `} />
      )}
    </div>
  );
};

export default ChatBot;