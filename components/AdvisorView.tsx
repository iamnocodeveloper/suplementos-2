import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Paperclip, FileText, Target, 
  ShieldAlert, Salad, Thermometer, ChevronRight, 
  Bot, Award, Zap, Microscope, Trash2, Eye, Loader2,
  Download, FileDown, CheckCircle2, Calendar, Activity, X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Supplement, UserPreferences } from '../types';
import { soundService } from '../services/sound';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  supplements: Supplement[];
  preferences: UserPreferences;
}

interface AttachedFile {
  name: string;
  type: string;
  data: string; 
}

const AdvisorView: React.FC<Props> = ({ supplements, preferences }) => {
  const [goals, setGoals] = useState('');
  const [diet, setDiet] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medical, setMedical] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Cargar estado guardado
  const [result, setResult] = useState<string | null>(() => {
    return localStorage.getItem('SI_ADVISOR_RESULT');
  });
  
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>(() => {
    const saved = localStorage.getItem('SI_ADVISOR_FILES');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar estado cuando cambie
  useEffect(() => {
    if (result) localStorage.setItem('SI_ADVISOR_RESULT', result);
    else localStorage.removeItem('SI_ADVISOR_RESULT');
  }, [result]);

  useEffect(() => {
    localStorage.setItem('SI_ADVISOR_FILES', JSON.stringify(attachedFiles));
  }, [attachedFiles]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        let dataToSave = content;
        if (file.type.startsWith('image/')) {
          dataToSave = content.split(',')[1];
        }
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: dataToSave
        }]);
        soundService.playClick();
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    soundService.playClick();
  };

  const downloadPDF = async () => {
    if (!pdfTemplateRef.current) return;
    soundService.playClick();
    
    const template = pdfTemplateRef.current;
    template.style.display = 'block';
    
    try {
      const canvas = await html2canvas(template, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const imgHeightInPdf = imgHeight * ratio;
      
      let heightLeft = imgHeightInPdf;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeightInPdf;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Protocolo_Optimización_SI_${new Date().getTime().toString().slice(-4)}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      template.style.display = 'none';
    }
  };

  const generatePlan = async () => {
    if (!goals.trim()) return;
    setIsGenerating(true);
    setResult(null);
    soundService.playClick();

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';

    const supplementsContext = supplements.map(s => 
      `- ${s.name}: ${s.description} (Evidencia: ${s.evidence}, Score: ${s.scientificScore}, Dosis: ${s.recommendedDosage})`
    ).join('\n');

    const promptText = `
      ERES UN CONSULTOR LÍDER EN BIOHACKING Y OPTIMIZACIÓN HUMANA.
      GENERA UN INFORME CLÍNICO MAESTRO LLAMADO "PLAN DE OPTIMIZACIÓN BIO-ESTRUCTURAL".

      ESTRUCTURA (Usa # para títulos):
      # I. EVALUACIÓN BIO-METABÓLICA: Análisis profundo de los datos del cliente.
      # II. PROTOCOLO DE SUPLEMENTACIÓN DIARIA: Tabla detallada con MOMENTO | COMPUESTO | DOSIFICACIÓN | ACCIÓN CLAVE.
      # III. SINERGIAS Y BIODISPONIBILIDAD: Explicación técnica de las combinaciones sugeridas.
      # IV. SEGURIDAD Y CICLADO CLÍNICO: Instrucciones de periodización y avisos de seguridad.

      FORMATO OBLIGATORIO:
      - Resalta nombres de suplementos y dosis en **NEGRITA**.
      - Sé extremadamente descriptivo y profesional.
      - Usa un lenguaje técnico pero accesible.
    `;

    const parts = [{ text: promptText + `\n\nDATOS DEL CLIENTE:\n${goals}\n${diet}\n${allergies}\n${medical}\n\nCATÁLOGO DISPONIBLE:\n${supplementsContext}` }];
    
    attachedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        parts.push({ inlineData: { mimeType: file.type, data: file.data } } as any);
      } else {
        parts[0].text += `\n\nDATOS ADJUNTOS:\n${file.data}`;
      }
    });

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts },
        config: { thinkingConfig: { thinkingBudget: 4000 }, temperature: 0.5 }
      });
      setResult(response.text);
    } catch (error) {
      setResult("Error en la conexión con el servidor IA. Reintente en unos segundos.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-12 animate-fade-in max-w-[1440px] mx-auto px-4 sm:px-8 pb-32">
      <div className="max-w-4xl mb-12">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 shadow-sm">
          <Award size={16} className="text-amber-600 dark:text-amber-500" />
          <span className="text-[11px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.3em] italic">Biohacker Advisor Premium</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-primary italic uppercase tracking-tighter mb-6 leading-[0.9]">
          Asesoría <span className="text-amber-600 dark:text-amber-500">Inteligente</span>
        </h2>
        <p className="text-lg text-secondary font-medium leading-relaxed italic opacity-90 max-w-2xl">
          Algoritmos avanzados escaneando tus biomarcadores para un rendimiento superior.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#0c0c0c] border-2 border-border/80 dark:border-amber-500/20 rounded-[3rem] p-10 shadow-2xl h-full flex flex-col relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.03),transparent_70%)] pointer-events-none" />
            
            <div className="space-y-10 relative z-10 flex-grow">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500/80">
                  <Target size={20} />
                  <span className="text-[11px] font-black uppercase tracking-widest italic">Metas Bio-Estructurales</span>
                </div>
                <textarea 
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Describe tus objetivos de salud y rendimiento..."
                  className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-6 text-primary text-base font-medium italic focus:border-amber-500/40 outline-none min-h-[220px] transition-all resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500/80">
                    <Salad size={20} />
                    <span className="text-[11px] font-black uppercase tracking-widest italic">Dieta Actual</span>
                  </div>
                  <input 
                    type="text" 
                    value={diet} 
                    onChange={(e) => setDiet(e.target.value)} 
                    placeholder="Paleo, Vegano..." 
                    className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold italic outline-none focus:border-emerald-500/30 transition-all" 
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-500/80">
                    <ShieldAlert size={20} />
                    <span className="text-[11px] font-black uppercase tracking-widest italic">Alergias / Intolerancias</span>
                  </div>
                  <input 
                    type="text" 
                    value={allergies} 
                    onChange={(e) => setAllergies(e.target.value)} 
                    placeholder="Lactosa, Gluten..." 
                    className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold italic outline-none focus:border-red-500/30 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-500/80">
                  <Thermometer size={20} />
                  <span className="text-[11px] font-black uppercase tracking-widest italic">Antecedentes Médicos</span>
                </div>
                <input 
                  type="text" 
                  value={medical} 
                  onChange={(e) => setMedical(e.target.value)} 
                  placeholder="Condiciones, analíticas previas..." 
                  className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold italic outline-none focus:border-indigo-500/30 transition-all" 
                />
              </div>

              <div className="pt-10 border-t-2 border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex flex-wrap gap-3">
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black flex items-center gap-3 shadow-sm italic">
                      <FileText size={12} className="text-indigo-500" /> {f.name} 
                      <button onClick={() => removeFile(i)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 text-[10px] font-black uppercase italic tracking-widest hover:border-indigo-500/40 hover:bg-slate-50 transition-all shadow-md flex items-center gap-3"
                  >
                    <Paperclip size={14} className="text-indigo-500" /> Adjuntar Datos (Analítica)
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>

                <button 
                  onClick={generatePlan}
                  disabled={isGenerating || !goals}
                  className={`px-12 py-5 rounded-[2rem] text-[13px] font-black uppercase tracking-[0.3em] italic transition-all shadow-2xl flex items-center justify-center gap-5 ${isGenerating ? 'bg-amber-500/20 text-amber-500/50 cursor-not-allowed' : 'bg-amber-500 text-black hover:bg-amber-400 hover:-translate-y-1 border-2 border-amber-400 shadow-amber-600/30'}`}
                >
                  {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <>GENERAR PROTOCOLO <Zap size={20} fill="currentColor" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 h-full">
          <div className="bg-white dark:bg-surface border-2 border-border/80 dark:border-white/5 rounded-[3rem] p-10 shadow-2xl min-h-[600px] h-full flex flex-col relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.02),transparent_70%)] pointer-events-none" />
            
            {!result && !isGenerating ? (
              <div className="flex-grow flex flex-col items-center justify-center opacity-40 text-center p-10">
                <Sparkles size={80} className="text-amber-500 mb-10 animate-pulse" />
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary">Terminal IA</h3>
                <p className="text-sm font-bold italic mt-4 max-w-[200px] leading-relaxed">Introduce tus parámetros para iniciar la síntesis clínica.</p>
              </div>
            ) : isGenerating ? (
              <div className="space-y-10 animate-pulse p-4 h-full flex flex-col">
                <div className="flex items-center gap-5 mb-14">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center border-2 border-amber-500/30">
                    <Activity size={32} className="text-amber-600 dark:text-amber-500 animate-pulse" />
                  </div>
                  <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-2xl w-56" />
                </div>
                <div className="space-y-6 flex-grow">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="h-4 bg-slate-50 dark:bg-white/5 rounded-full w-full" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-fade-in relative z-10">
                <div className="flex items-center justify-between mb-10 border-b-2 border-slate-100 dark:border-white/5 pb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center shadow-lg border-2 border-amber-400"><Bot size={28} className="text-black" /></div>
                    <div>
                      <h4 className="text-[14px] font-black uppercase tracking-widest italic text-amber-600 dark:text-amber-500">Plan Optimizado</h4>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60 mt-1">IA Advisor Premium</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={downloadPDF} className="flex items-center gap-3 px-6 py-3 bg-amber-600 text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-amber-500 transition-all hover:scale-105 border-2 border-amber-400">
                      <FileDown size={20} />
                      <span>PDF</span>
                    </button>
                    <button onClick={() => setResult(null)} className="p-3 hover:bg-red-500/10 text-secondary hover:text-red-500 rounded-2xl transition-all border-2 border-transparent hover:border-red-500/20"><Trash2 size={22} /></button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-3 custom-scrollbar p-8 bg-slate-50/50 dark:bg-black/40 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 shadow-inner">
                  <div className="prose prose-slate dark:prose-invert prose-amber max-w-none text-base text-slate-700 dark:text-secondary font-semibold italic whitespace-pre-wrap leading-relaxed">
                    {result}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div 
        ref={pdfTemplateRef} 
        style={{ 
          display: 'none', 
          width: '794px', 
          backgroundColor: '#ffffff', 
          color: '#0f172a', 
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box'
        }}
        className="pdf-clinical-sheet"
      >
        <div style={{ padding: '25mm 20mm 35mm 20mm' }}>
          <div className="border-b-4 border-indigo-600 pb-12 mb-14 flex justify-between items-end">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Zap size={28} className="text-white" /></div>
                <h1 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase italic leading-none">SUPLEMENTOS INTELIGENTES</h1>
              </div>
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocolo Clínico de Optimización Bio-Estructural</p>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">ID REPORTE: #SI-{Math.floor(Math.random()*90000 + 10000)}</span>
              <span className="text-base font-bold text-slate-800 italic">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="mb-14" style={{ breakInside: 'avoid' }}>
            <div className="bg-slate-50 border-l-[10px] border-indigo-500 p-10 rounded-r-[3rem] shadow-sm">
              <h3 className="text-[13px] font-black text-indigo-700 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Target size={18} /> Parámetros Biomédicos y Metas
              </h3>
              <div className="space-y-6">
                <div className="text-base font-semibold text-slate-800 italic leading-relaxed border-b border-slate-200 pb-6">
                  <span className="text-indigo-950 not-italic uppercase text-[11px] font-black block mb-2 opacity-60">Objetivos del Cliente:</span>
                  "{goals}"
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Preferencia Dieta</span>
                    <span className="text-sm font-bold text-slate-900">{diet || "N/A"}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Alergias</span>
                    <span className="text-sm font-bold text-red-600">{allergies || "Ninguna"}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Historial Base</span>
                    <span className="text-sm font-bold text-slate-900">{medical || "Estable"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            {result?.split('#').map((section, idx) => {
              if (!section.trim()) return null;
              const lines = section.trim().split('\n');
              const title = lines[0];
              const content = lines.slice(1).join('\n');

              return (
                <div key={idx} style={{ breakInside: 'avoid', marginBottom: '40px' }}>
                  <h2 className="text-2xl font-black text-indigo-950 uppercase italic tracking-tighter mb-8 flex items-center gap-4 border-b-2 border-slate-100 pb-2">
                    <div className="w-3 h-8 bg-indigo-600 rounded-full" />
                    {title}
                  </h2>
                  
                  <div className="text-[14px] text-slate-700 leading-[1.8] space-y-6">
                    {content.split('\n').map((line, lIdx) => {
                      if (line.includes('|')) {
                        const cells = line.split('|').filter(c => c.trim().length > 0);
                        if (line.includes('---')) return null;
                        return (
                          <div key={lIdx} className="my-8 overflow-hidden border-2 border-slate-100 rounded-[2rem] shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <tbody>
                                <tr className={lIdx === 0 ? "bg-indigo-50" : "bg-white"}>
                                  {cells.map((cell, cIdx) => (
                                    <td key={cIdx} className={`p-5 border-r border-slate-100 last:border-0 font-medium ${lIdx === 0 ? 'font-black text-indigo-900 text-[11px] uppercase tracking-widest' : 'text-slate-800'}`}>
                                      {cell.split('**').map((part, pIdx) => pIdx % 2 === 1 ? <span key={pIdx} className="text-indigo-800 font-black bg-indigo-50 px-1 rounded">{part}</span> : part)}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      
                      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                        return (
                          <div key={lIdx} className="flex items-start gap-5 ml-8 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-sm" />
                            <span className="font-semibold text-slate-700 italic">
                              {line.replace(/^[-*]\s*/, '').split('**').map((part, pIdx) => 
                                pIdx % 2 === 1 ? <strong key={pIdx} className="text-indigo-950 font-black">{part}</strong> : part
                              )}
                            </span>
                          </div>
                        );
                      }

                      const formattedLine = line.split('**').map((part, pIdx) => 
                        pIdx % 2 === 1 ? <strong key={pIdx} className="text-indigo-700 font-black bg-indigo-50 px-1.5 rounded-lg">{part}</strong> : part
                      );
                      
                      return line.trim() ? <p key={lIdx} className="mb-5 italic opacity-95 text-justify">{formattedLine}</p> : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-24 pt-12 border-t-2 border-slate-100 text-center pb-12" style={{ breakInside: 'avoid' }}>
            <div className="inline-flex items-center gap-3 px-10 py-3 bg-indigo-50 rounded-full mb-8 border border-indigo-100 shadow-sm">
              <ShieldAlert size={16} className="text-indigo-600" />
              <p className="text-[11px] font-black text-indigo-700 uppercase tracking-[0.3em]">Validación de Inteligencia Bio-Analítica</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed uppercase italic opacity-70">
              Este reporte es una síntesis generada por algoritmos de IA de vanguardia. No constituye una prescripción médica vinculante. 
              Consulte siempre a un profesional antes de realizar cualquier cambio en su protocolo de salud.
            </p>
            <div className="mt-12 text-[12px] font-black text-slate-200 tracking-[1em] uppercase italic">
              S.I. LABS • PRECISIÓN CLÍNICA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorView;