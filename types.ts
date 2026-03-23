export type ViewState = 'home' | 'ranking' | 'emerging' | 'dashboard' | 'stacks' | 'advisor' | 'community';

export type EvidenceLevel = 'Alta' | 'Media' | 'Baja';
export type OriginType = 'Natural' | 'Sintético';

export interface Supplement {
  id: string;
  name: string;
  description: string;
  category: string;
  benefitTag: string;
  evidence: EvidenceLevel;
  scientificScore: number;
  previousScientificScore?: number;
  scientificTrend?: 'up' | 'down' | 'neutral';
  studiesCount: number;
  humanTrialsCount?: number;
  metaAnalysisCount?: number;
  lastRevision: string;
  isPremium: boolean;
  isEmerging?: boolean;
  rating: number;
  votes: number;
  userVote?: number;
  goalTags: string[];
  recommendedDosage: string;
  mechanism?: string;
  warnings: string[];
  contraindications?: string[];
  curiosities?: string[];
  isVegan: boolean;
  isGlutenFree: boolean;
  origin: OriginType;
  affiliateLink?: string;
}

export interface UserReputation {
  totalPoints: number;
  likesReceived: number;
  usefulReceived: number;
}

export interface BioProfile {
  primaryGoal: string;
  energyLevel: number;
  stressLevel: number;
  sleepHours: number;
  sleepQuality: 'pobre' | 'regular' | 'buena';
  age: number;
  sex: 'masculino' | 'femenino' | 'otro';
  height: number;
  weight: number;
  practicesSport: boolean;
  sportsList: string;
  weeklyFrequency: number;
  specialDiet: string;
  currentSupplements: string;
  medicalConditions?: string;
}

/**
 * FIX: Se agrega la propiedad visionScale a UserPreferences para soportar
 * la escala de zoom definida en App.tsx y evitar errores de tipado.
 */
export interface UserPreferences {
  isLoggedIn: boolean;
  userId?: string;
  soundEnabled: boolean;
  isPremium: boolean;
  theme: 'light' | 'dark';
  themeIntensity?: number;
  // visionScale: Control de zoom de la interfaz para accesibilidad visual
  visionScale?: number;
  lastScientificSync: number;
  avatar?: string;
  name?: string;
  reputation: UserReputation;
  bioProfile?: BioProfile;
  isProfilePrivate?: boolean;
}

export interface UserRecord extends UserPreferences {
  password?: string;
  activeProtocols: string[];
  activationDates: Record<string, number>;
  supplementLogs: any;
}

export type CommunityRank = 'Amateur' | 'Aprendiz' | 'Explorador' | 'Experimentador' | 'Experto';

export type PremiumTag = 
  | 'Rendimiento físico y deportivo' 
  | 'Salud mental y cognitiva' 
  | 'Salud general' 
  | 'Salud hormonal y sexual' 
  | 'Belleza y estética' 
  | 'Digestión y metabolismo' 
  | 'Longevidad y biohacking';

export interface CommunityReply {
  id: string;
  author: {
    name: string;
    isPremium: boolean;
    reputation: number;
    rank: CommunityRank;
  };
  content: string;
  timestamp: number;
  likes: number;
  hasLiked?: boolean;
  isUseful?: boolean;
  usefulCount: number;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    isPremium: boolean;
    reputation: number;
    rank: CommunityRank;
  };
  content: string;
  timestamp: number;
  likes: number;
  hasLiked?: boolean;
  isUseful?: boolean;
  usefulCount: number;
  replies: CommunityReply[];
  premiumTags: PremiumTag[];
  isPremiumStyle: boolean;
}

export const TAG_STYLES: Record<PremiumTag, { text: string, border: string, bg: string }> = {
  'Rendimiento físico y deportivo': { text: 'text-[#FF4D4F]', border: 'border-[#FF4D4F]/30', bg: 'bg-[#FF4D4F]/10' },
  'Salud mental y cognitiva': { text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/30', bg: 'bg-[#3B82F6]/10' },
  'Salud general': { text: 'text-[#10B981]', border: 'border-[#10B981]/30', bg: 'bg-[#10B981]/10' },
  'Salud hormonal y sexual': { text: 'text-[#D946EF]', border: 'border-[#D946EF]/30', bg: 'bg-[#D946EF]/10' },
  'Belleza y estética': { text: 'text-[#A0522D]', border: 'border-[#A0522D]/30', bg: 'bg-[#A0522D]/10' },
  'Digestión y metabolismo': { text: 'text-[#F97316]', border: 'border-[#F97316]/30', bg: 'bg-[#F97316]/10' },
  'Longevidad y biohacking': { text: 'text-[#06B6D4]', border: 'border-[#06B6D4]/30', bg: 'bg-[#06B6D4]/10' }
};

export const getCategoryStyle = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('rendimiento')) {
    return { bg: 'bg-[#FF4D4F]/10', border: 'border-[#FF4D4F]/30', text: 'text-[#FF4D4F]', dot: 'bg-[#FF4D4F]', glow: 'shadow-[#FF4D4F]/50' };
  }
  if (c.includes('mental')) {
    return { bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]', glow: 'shadow-[#3B82F6]/50' };
  }
  if (c.includes('general')) {
    return { bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', text: 'text-[#10B981]', dot: 'bg-[#10B981]', glow: 'shadow-[#10B981]/50' };
  }
  if (c.includes('hormonal')) {
    return { bg: 'bg-[#D946EF]/10', border: 'border-[#D946EF]/30', text: 'text-[#D946EF]', dot: 'bg-[#D946EF]', glow: 'shadow-[#D946EF]/50' };
  }
  if (c.includes('belleza')) {
    return { bg: 'bg-[#A0522D]/10', border: 'border-[#A0522D]/30', text: 'text-[#A0522D]', dot: 'bg-[#A0522D]', glow: 'shadow-[#A0522D]/50' };
  }
  if (c.includes('digestión') || c.includes('metabolismo')) {
    return { bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/30', text: 'text-[#F97316]', dot: 'bg-[#F97316]', glow: 'shadow-[#F97316]/50' };
  }
  if (c.includes('longevidad') || c.includes('biohacking')) {
    return { bg: 'bg-[#06B6D4]/10', border: 'border-[#06B6D4]/30', text: 'text-[#06B6D4]', dot: 'bg-[#06B6D4]', glow: 'shadow-[#06B6D4]/50' };
  }
  return { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-500', dot: 'bg-indigo-500', glow: 'shadow-indigo-500/50' };
};