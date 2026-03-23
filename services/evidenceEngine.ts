import { GoogleGenAI } from "@google/genai";
import { Supplement } from "../types";

export interface ScientificUpdateResponse {
  updates: {
    id: string;
    newScore: number;
    reason: string;
    studiesAdded: number;
    humanTrialsAdded: number;
    metaAnalysisAdded: number;
    // FIX: Added trend property to match App.tsx usage and types.ts
    trend: 'up' | 'down' | 'neutral';
  }[];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runWeeklyScientificReview = async (currentSupplements: Supplement[], retries = 3): Promise<ScientificUpdateResponse> => {
  // Inicializamos dentro de la función para asegurar el uso de la API KEY más reciente si fuera necesario
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const supplementData = currentSupplements.map(s => ({
    id: s.id,
    name: s.name,
    currentScore: s.scientificScore,
    currentStudies: s.studiesCount,
    currentMetaAnalysis: s.metaAnalysisCount
  }));

  const prompt = `
    Eres un Agente de Inteligencia Farmacológica Senior. Tu misión es revisar el ranking de suplementos basándote en la literatura científica más reciente de la última semana.
    
    Analiza esta lista de suplementos: ${JSON.stringify(supplementData)}
    
    Para cada uno, basándote en tendencias reales de investigación (PubMed):
    1. Ajusta el score científico (0-100) sutilmente (+/- 1-3 pts).
    2. Estima cuántos estudios nuevos se han publicado esta semana.
    3. Estima si ha habido nuevos Meta-análisis o Ensayos Clínicos en humanos relevantes.
    
    Devuelve ÚNICAMENTE un objeto JSON con la estructura siguiente, sin explicaciones adicionales:
    {
      "updates": [
        { 
          "id": "string", 
          "newScore": number, 
          "reason": "breve explicación técnica en español", 
          "studiesAdded": number,
          "humanTrialsAdded": number,
          "metaAnalysisAdded": number,
          "trend": "up" | "down" | "neutral"
        }
      ]
    }
  `;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Usamos gemini-3-flash-preview para evitar cuotas RESOURCE_EXHAUSTED
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text?.trim() || "{}";
      
      // Limpieza de posibles bloques de código markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : text;

      const data = JSON.parse(cleanedJson) as ScientificUpdateResponse;
      if (!data.updates || !Array.isArray(data.updates)) {
         throw new Error("Respuesta del modelo malformada");
      }
      return data;
    } catch (error: any) {
      const isQuotaError = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
      
      if (isQuotaError && attempt < retries - 1) {
        const waitTime = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s...
        console.warn(`Cuota agotada. Reintentando en ${waitTime}ms... (Intento ${attempt + 1}/${retries})`);
        await sleep(waitTime);
        continue;
      }
      
      console.error("Error definitivo en la revisión científica:", error);
      // Retornamos un objeto vacío para no romper el flujo de la app
      return { updates: [] };
    }
  }
  
  return { updates: [] };
};