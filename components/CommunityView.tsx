import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, MessageCircle, Heart, Filter, 
  Crown, TrendingUp, Sparkles, Plus, 
  Award, Search, User, ChevronDown, Send, 
  ArrowUpRight, Clock, MessageSquare, ThumbsUp, X, CheckCircle, Globe, Zap,
  Target, Activity, BarChart3, Lock
} from 'lucide-react';
import { 
  CommunityPost, CommunityRank, UserPreferences, Supplement, 
  PremiumTag, getCategoryStyle, CommunityReply 
} from '../types';
import { soundService } from '../services/sound';

interface Props {
  preferences: UserPreferences;
  supplements: Supplement[];
  onTogglePremium: () => void;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
}

const calculateReputationFromPoints = (points: number) => {
  let score = 0;
  if (points <= 20) {
    score = points;
  } else if (points <= 80) {
    score = 20 + (points - 20) / 2;
  } else if (points <= 155) {
    score = 50 + (points - 80) / 3;
  } else if (points <= 230) {
    score = 75 + (points - 155) / 5;
  } else if (points <= 330) {
    score = 90 + (points - 230) / 10;
  } else {
    score = 100;
  }
  return Math.min(100, score);
};

const getPointsFromReputation = (score: number) => {
  if (score <= 20) return score;
  if (score <= 50) return 20 + (score - 20) * 2;
  if (score <= 75) return 80 + (score - 50) * 3;
  if (score <= 90) return 155 + (score - 75) * 5;
  if (score <= 100) return 230 + (score - 90) * 10;
  return 330;
};

const getRankFromScore = (score: number): CommunityRank => {
  if (score >= 80) return 'Experto';
  if (score >= 60) return 'Experimentador';
  if (score >= 40) return 'Explorador';
  if (score >= 20) return 'Aprendiz';
  return 'Amateur';
};

const getVoterMultiplier = (rank: CommunityRank) => {
  switch (rank) {
    case 'Experto': return 2.0;
    case 'Experimentador': return 1.5;
    case 'Explorador': return 1.2;
    case 'Aprendiz': return 1.1;
    default: return 1.0;
  }
};

const COMMUNITY_CATEGORIES: PremiumTag[] = [
  'Rendimiento físico y deportivo',
  'Salud mental y cognitiva',
  'Salud general',
  'Salud hormonal y sexual',
  'Belleza y estética',
  'Digestión y metabolismo',
  'Longevidad y biohacking'
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

const CommunityView: React.FC<Props> = ({ preferences, supplements, onTogglePremium, onUpdatePreferences }) => {
  const currentUserName = useMemo(() => preferences.name || 'Invitado', [preferences.name]);

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('SI_COMMUNITY_DATA');
    return saved ? JSON.parse(saved) : [];
  });

  const [newPostContent, setNewPostContent] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<PremiumTag | 'Global'>('Global');
  const [postDraftTags, setPostDraftTags] = useState<PremiumTag[]>([]);
  const [sortBy, setSortBy] = useState<'reciente' | 'valorada'>('reciente');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProfile, setSelectedProfile] = useState<{
    name: string;
    avatar?: string;
    isPremium: boolean;
    reputation: number;
    rank: CommunityRank;
    points: number;
    likesReceived: number;
    usefulReceived: number;
    topGoal: string;
    protocolActivity: number;
  } | null>(null);

  const CHAR_LIMIT = preferences.isPremium ? 1500 : 500;
  const currentUserScore = useMemo(() => calculateReputationFromPoints(preferences.reputation.totalPoints), [preferences.reputation.totalPoints]);
  const currentUserRank = useMemo(() => getRankFromScore(currentUserScore), [currentUserScore]);

  useEffect(() => {
    const userLikes = posts.reduce((acc, p) => {
      let count = p.author.name === currentUserName ? p.likes : 0;
      count += p.replies.reduce((rAcc, r) => r.author.name === currentUserName ? rAcc + r.likes : rAcc, 0);
      return acc + count;
    }, 0);

    const userUseful = posts.reduce((acc, p) => {
      let count = p.author.name === currentUserName ? p.usefulCount : 0;
      count += p.replies.reduce((rAcc, r) => r.author.name === currentUserName ? rAcc + r.usefulCount : rAcc, 0);
      return acc + count;
    }, 0);

    if (userLikes !== preferences.reputation.likesReceived || userUseful !== preferences.reputation.usefulReceived) {
      onUpdatePreferences({
        reputation: {
          ...preferences.reputation,
          likesReceived: userLikes,
          usefulReceived: userUseful
        }
      });
    }
  }, [posts, currentUserName, preferences.reputation, onUpdatePreferences]);

  useEffect(() => {
    localStorage.setItem('SI_COMMUNITY_DATA', JSON.stringify(posts));
  }, [posts]);

  const syncAuthorReputation = (prevPosts: CommunityPost[], authorName: string, pointsEarned: number, type: 'like' | 'useful'): CommunityPost[] => {
    if (authorName === currentUserName) {
      onUpdatePreferences({
        reputation: {
          ...preferences.reputation,
          totalPoints: Math.max(0, preferences.reputation.totalPoints + pointsEarned)
        }
      });
    }
    
    return prevPosts.map(p => {
      let updatedAuthor = { ...p.author };
      if (p.author.name === authorName) {
        const currentPoints = getPointsFromReputation(p.author.reputation);
        const newScore = calculateReputationFromPoints(currentPoints + pointsEarned);
        updatedAuthor = { ...updatedAuthor, reputation: newScore, rank: getRankFromScore(newScore) };
      }

      const updatedReplies = p.replies.map(r => {
        if (r.author.name === authorName) {
          const currentPoints = getPointsFromReputation(r.author.reputation);
          const newScore = calculateReputationFromPoints(currentPoints + pointsEarned);
          return { ...r, author: { ...r.author, reputation: newScore, rank: getRankFromScore(newScore) } };
        }
        return r;
      });

      return { ...p, author: updatedAuthor, replies: updatedReplies };
    });
  };

  const leaderBoard = useMemo(() => {
    const authorsMap = new Map<string, { name: string, reputation: number, rank: CommunityRank, isPremium: boolean, avatar?: string }>();
    authorsMap.set(currentUserName, { name: currentUserName, reputation: currentUserScore, rank: currentUserRank, isPremium: preferences.isPremium, avatar: preferences.avatar });

    posts.forEach(p => {
      if (!authorsMap.has(p.author.name) || (authorsMap.get(p.author.name)?.reputation || 0) < p.author.reputation) {
        authorsMap.set(p.author.name, { name: p.author.name, reputation: p.author.reputation, rank: p.author.rank, isPremium: p.author.isPremium, avatar: p.author.avatar });
      }
      p.replies.forEach(r => {
        if (!authorsMap.has(r.author.name) || (authorsMap.get(r.author.name)?.reputation || 0) < r.author.reputation) {
          authorsMap.set(r.author.name, { name: r.author.name, reputation: r.author.reputation, rank: r.author.rank, isPremium: r.author.isPremium });
        }
      });
    });

    return Array.from(authorsMap.values()).sort((a, b) => b.reputation - a.reputation).slice(0, 5);
  }, [posts, currentUserScore, currentUserRank, preferences.isPremium, preferences.avatar, currentUserName]);

  const handleOpenProfile = (author: { name: string, isPremium: boolean, reputation: number, rank: CommunityRank, avatar?: string }) => {
    soundService.playClick();
    
    const userLikes = posts.reduce((acc, p) => {
      let count = p.author.name === author.name ? p.likes : 0;
      count += p.replies.reduce((rAcc, r) => r.author.name === author.name ? rAcc + r.likes : rAcc, 0);
      return acc + count;
    }, 0);

    const userUseful = posts.reduce((acc, p) => {
      let count = p.author.name === author.name ? p.usefulCount : 0;
      count += p.replies.reduce((rAcc, r) => r.author.name === author.name ? rAcc + r.usefulCount : rAcc, 0);
      return acc + count;
    }, 0);

    const userTagsCount: Record<string, number> = {};
    posts.filter(p => p.author.name === author.name).forEach(p => {
      p.premiumTags.forEach(tag => {
        userTagsCount[tag] = (userTagsCount[tag] || 0) + 1;
      });
    });
    
    let topGoal = "Optimización General";
    let maxCount = 0;
    Object.entries(userTagsCount).forEach(([tag, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topGoal = tag;
      }
    });

    const protocolActivity = author.name === currentUserName ? 88 : Math.floor(author.reputation * 0.9) + 5;

    setSelectedProfile({
      name: author.name,
      avatar: author.name === currentUserName ? preferences.avatar : author.avatar,
      isPremium: author.isPremium,
      reputation: author.name === currentUserName ? currentUserScore : author.reputation,
      rank: author.name === currentUserName ? currentUserRank : author.rank,
      points: author.name === currentUserName ? preferences.reputation.totalPoints : getPointsFromReputation(author.reputation),
      likesReceived: userLikes,
      usefulReceived: userUseful,
      topGoal: topGoal,
      protocolActivity: Math.min(100, protocolActivity)
    });
  };

  const handleLikePost = (postId: string) => {
    if (!preferences.isLoggedIn) return;
    setPosts(prev => {
      const target = prev.find(p => p.id === postId);
      if (!target) return prev;
      if (target.author.name === currentUserName) return prev;
      soundService.playClick();
      const isLiking = !target.hasLiked;
      const multiplier = getVoterMultiplier(currentUserRank);
      const points = isLiking ? Math.round(1 * multiplier) : -Math.round(1 * multiplier);
      let updated = prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes + (isLiking ? 1 : -1)), hasLiked: isLiking } : p);
      return syncAuthorReputation(updated, target.author.name, points, 'like');
    });
  };

  const handleUsefulPost = (postId: string) => {
    if (!preferences.isLoggedIn) return;
    setPosts(prev => {
      const target = prev.find(p => p.id === postId);
      if (!target) return prev;
      if (target.author.name === currentUserName) return prev;
      soundService.playClick();
      const isNowUseful = !target.isUseful;
      const multiplier = getVoterMultiplier(currentUserRank);
      const points = isNowUseful ? Math.round(2 * multiplier) : -Math.round(2 * multiplier);
      let updated = prev.map(p => p.id === postId ? { ...p, usefulCount: Math.max(0, p.usefulCount + (isNowUseful ? 1 : -1)), isUseful: isNowUseful } : p);
      return syncAuthorReputation(updated, target.author.name, points, 'useful');
    });
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    if (!preferences.isLoggedIn) return;
    setPosts(prev => {
      const post = prev.find(p => p.id === postId);
      const reply = post?.replies.find(r => r.id === replyId);
      if (!reply) return prev;
      if (reply.author.name === currentUserName) return prev;
      soundService.playClick();
      const isLiking = !reply.hasLiked;
      const multiplier = getVoterMultiplier(currentUserRank);
      const points = isLiking ? Math.round(1 * multiplier) : -Math.round(1 * multiplier);
      const updated = prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          replies: p.replies.map(r => r.id === replyId ? { ...r, likes: Math.max(0, r.likes + (isLiking ? 1 : -1)), hasLiked: isLiking } : r)
        };
      });
      return syncAuthorReputation(updated, reply.author.name, points, 'like');
    });
  };

  const handleUsefulReply = (postId: string, replyId: string) => {
    if (!preferences.isLoggedIn) return;
    setPosts(prev => {
      const post = prev.find(p => p.id === postId);
      const reply = post?.replies.find(r => r.id === replyId);
      if (!reply) return prev;
      if (reply.author.name === currentUserName) return prev;
      soundService.playClick();
      const isNowUseful = !reply.isUseful;
      const multiplier = getVoterMultiplier(currentUserRank);
      const points = isNowUseful ? Math.round(2 * multiplier) : -Math.round(2 * multiplier);
      const updated = prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          replies: p.replies.map(r => r.id === replyId ? { ...r, usefulCount: Math.max(0, r.usefulCount + (isNowUseful ? 1 : -1)), isUseful: isNowUseful } : r)
        };
      });
      return syncAuthorReputation(updated, reply.author.name, points, 'useful');
    });
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !preferences.isLoggedIn) return;
    soundService.playClick();
    const newPost: CommunityPost = {
      id: `p-${Date.now()}`,
      author: { 
        name: currentUserName, 
        avatar: preferences.avatar,
        isPremium: preferences.isPremium, 
        reputation: currentUserScore, 
        rank: currentUserRank 
      },
      content: newPostContent,
      timestamp: Date.now(),
      likes: 0,
      usefulCount: 0,
      replies: [],
      premiumTags: postDraftTags,
      isPremiumStyle: preferences.isPremium
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setPostDraftTags([]);
  };

  const toggleDraftTag = (tag: PremiumTag) => {
    soundService.playClick();
    setPostDraftTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleReply = (postId: string) => {
    if (!replyContent.trim() || !preferences.isLoggedIn) return;
    soundService.playClick();
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newReply: CommunityReply = {
          id: `r-${Date.now()}`,
          author: { name: currentUserName, isPremium: preferences.isPremium, reputation: currentUserScore, rank: currentUserRank },
          content: replyContent,
          timestamp: Date.now(),
          likes: 0,
          usefulCount: 0
        };
        return { ...p, replies: [...p.replies, newReply] };
      }
      return p;
    }));
    setReplyContent('');
    setReplyingTo(null);
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (selectedChannel !== 'Global') {
      result = result.filter(p => p.premiumTags.includes(selectedChannel));
    }
    if (searchQuery) {
      result = result.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result.sort((a, b) => {
      if (sortBy === 'reciente') return b.timestamp - a.timestamp;
      return (b.likes + b.usefulCount) - (a.likes + a.usefulCount);
    });
  }, [posts, selectedChannel, sortBy, searchQuery]);

  return (
    <div className="py-12 animate-fade-in max-w-[1440px] mx-auto px-4 sm:px-8 pb-40">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 sm:mb-8 shadow-sm">
            <Globe size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[9px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] italic">Muro Comunitario</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-primary italic uppercase tracking-tighter mb-4 sm:mb-6 leading-[0.9]">
            Conexión <span className="text-indigo-600 dark:text-indigo-500">Biohacker</span>
          </h2>
          <p className="text-base sm:text-lg text-secondary font-medium leading-relaxed italic opacity-90 max-w-2xl mx-auto lg:mx-0">
            Protocolos y debates sincronizados por categorías científicas. Publicación libre para miembros PRO.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner backdrop-blur-md self-center lg:self-end">
          <button onClick={() => setSortBy('reciente')} className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic transition-all ${sortBy === 'reciente' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}>Recientes</button>
          <button onClick={() => setSortBy('valorada')} className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic transition-all ${sortBy === 'valorada' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}>Valoradas</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Tu Perfil - Sidebar Izquierdo */}
        <div className="lg:col-span-3 space-y-6">
          {preferences.isLoggedIn ? (
            <div 
              onClick={() => handleOpenProfile({ name: currentUserName, isPremium: preferences.isPremium, reputation: currentUserScore, rank: currentUserRank, avatar: preferences.avatar })}
              className={`bg-white dark:bg-[#0c0c0c] border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 cursor-pointer ${preferences.isPremium ? 'border-amber-500/40 shadow-amber-500/10' : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/40'}`}
            >
              {preferences.isPremium && <div className="absolute -top-4 -right-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Crown size={120} className="text-amber-500" /></div>}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-black border-2 flex items-center justify-center relative shadow-2xl transition-all duration-500 ${preferences.isPremium ? 'border-amber-500 shadow-amber-500/30' : 'border-slate-200 dark:border-white/20'}`}>
                    <div className="w-full h-full rounded-[1.8rem] overflow-hidden flex items-center justify-center">
                      {preferences.avatar ? (
                        <img src={preferences.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className={preferences.isPremium ? 'text-amber-500' : 'text-secondary'} />
                      )}
                    </div>
                    {preferences.isPremium && (
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-float-crown shadow-[0_0_15px_rgba(245,158,11,0.6)] z-[100]">
                        <Crown size={16} fill="currentColor" className="text-black" />
                      </div>
                    )}
                  </div>
                </div>
                <h3 className={`text-2xl font-black italic uppercase tracking-tighter w-full pr-4 ${preferences.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'}`}>{currentUserName}</h3>
                <div className="flex items-center gap-2 mt-1 mb-8">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-[0.2em] italic ${preferences.isPremium ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-slate-50 dark:bg-white/5 text-secondary border-slate-200 dark:border-white/10'}`}>{currentUserRank}</span>
                </div>
                <div className="w-full space-y-3 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-secondary uppercase tracking-widest italic opacity-60">Reputación Biohacker</span>
                    <span className={`text-xl font-black italic ${preferences.isPremium ? 'text-amber-500' : 'text-indigo-600 dark:text-white'}`}>{currentUserScore.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ${preferences.isPremium ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]'}`} 
                      style={{ width: `${currentUserScore}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase text-secondary/40 tracking-tighter mt-1 italic">
                    <span>Pts: {preferences.reputation.totalPoints.toFixed(0)} / 330</span>
                    <span className="flex items-center gap-1"><Zap size={8} fill="currentColor" /> Mult: {getVoterMultiplier(currentUserRank)}x</span>
                  </div>
                </div>
                {!preferences.isPremium && <button onClick={(e) => { e.stopPropagation(); onTogglePremium(); }} className="w-full py-4 rounded-2xl bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.3em] italic hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">Subir a Premium</button>}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border/40 rounded-[2.5rem] p-8 shadow-xl text-center">
              <User size={40} className="mx-auto text-secondary mb-4 opacity-20" />
              <h3 className="text-sm font-black text-primary uppercase italic tracking-widest mb-4">Métricas Personales</h3>
              <p className="text-[10px] text-secondary font-bold uppercase italic opacity-60 leading-relaxed">Inicia sesión para ver tu reputación y rango en la comunidad.</p>
            </div>
          )}

          <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border/40 rounded-[2.5rem] p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-8 px-2">
               <Filter size={18} className="text-indigo-600 dark:text-indigo-400" />
               <span className="text-xs font-black text-primary uppercase tracking-widest italic">Filtrar Canal</span>
             </div>
             <div className="space-y-2">
                <button onClick={() => { soundService.playClick(); setSelectedChannel('Global'); }} className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between border ${selectedChannel === 'Global' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : `text-secondary hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white border-transparent`}`}>
                  <span className="flex items-center gap-2"><Globe size={12} /> Muro Global</span>
                </button>
                {COMMUNITY_CATEGORIES.map(tag => {
                  const s = getCategoryStyle(tag);
                  const isSelected = selectedChannel === tag;
                  return (
                    <button key={tag} onClick={() => { soundService.playClick(); setSelectedChannel(tag); }} className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between border ${isSelected ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : `text-secondary hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white border-transparent`}`}>
                      <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {SHORT_NAMES[tag]}</span>
                      {isSelected && <ArrowUpRight size={12} className="text-white/40" />}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Muro Central */}
        <div className="lg:col-span-6 space-y-8">
          {preferences.isLoggedIn ? (
            <div className={`bg-white dark:bg-[#0c0c0c] border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ${preferences.isPremium ? 'border-amber-500/20' : 'border-slate-200 dark:border-white/10'}`}>
              <div className="flex gap-6">
                 <div 
                  onClick={() => handleOpenProfile({ name: currentUserName, isPremium: preferences.isPremium, reputation: currentUserScore, rank: currentUserRank, avatar: preferences.avatar })}
                  className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-black border flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors overflow-hidden ${preferences.isPremium ? 'border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-200 dark:border-white/10 text-secondary'}`}
                 >
                   {preferences.avatar ? (
                     <img src={preferences.avatar} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     preferences.isPremium ? <Crown size={28} /> : <User size={28} />
                   )}
                 </div>
                 <div className="flex-grow space-y-6">
                    <textarea value={newPostContent} maxLength={CHAR_LIMIT} onChange={(e) => setNewPostContent(e.target.value)} placeholder={`Comparte tu conocimiento... (Máx. ${CHAR_LIMIT} carac.)`} className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium italic text-primary placeholder:text-secondary/30 min-h-[120px] resize-none" />
                    {preferences.isPremium && (
                      <div className="flex items-center gap-4 py-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest italic">Categorías Premium:</span>
                          <p className="text-[7px] text-secondary font-bold uppercase opacity-40">Selección múltiple</p>
                        </div>
                        <div className="flex flex-wrap gap-2 flex-grow">
                          {COMMUNITY_CATEGORIES.map(t => {
                            const s = getCategoryStyle(t);
                            const isDraftSelected = postDraftTags.includes(t);
                            return (
                              <button key={t} onClick={() => toggleDraftTag(t)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${isDraftSelected ? `${s.bg} ${s.text} ${s.border} shadow-[0_0_8px_currentColor]` : 'bg-slate-50 dark:bg-black text-secondary border-slate-200 dark:border-white/10'}`}>
                                {SHORT_NAMES[t]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                      <span className={`text-[10px] font-black italic tracking-widest ${newPostContent.length > CHAR_LIMIT * 0.9 ? 'text-red-500' : 'text-secondary/40'}`}>{newPostContent.length}/{CHAR_LIMIT}</span>
                      <button onClick={handleCreatePost} disabled={!newPostContent.trim()} className={`px-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] italic shadow-2xl transition-all ${newPostContent.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-1' : 'bg-slate-100 dark:bg-white/5 text-secondary/30 cursor-not-allowed'}`}>Publicar Protocolo</button>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-black/20 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 text-center space-y-6">
              <Lock size={40} className="mx-auto text-indigo-600 dark:text-indigo-400 opacity-40" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Acceso Restringido</h3>
              <p className="text-sm font-bold uppercase tracking-widest italic opacity-60 px-10">Inicia sesión para compartir tus protocolos y unirte a la conversación de élite.</p>
            </div>
          )}

          <div className="space-y-8">
            {filteredPosts.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center opacity-40 text-center">
                 <MessageSquare size={48} className="mb-6 animate-pulse" />
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Sin protocolos vigentes</h3>
                 <p className="text-sm font-bold uppercase tracking-widest mt-2 italic">Inaugura el muro compartiendo tu bio-rutina.</p>
               </div>
            ) : filteredPosts.map(post => (
              <div key={post.id} className={`bg-white dark:bg-surface border rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative group hover:border-indigo-500/40 transition-all duration-700 ${post.isPremiumStyle ? 'border-amber-500/30 shadow-amber-500/[0.03]' : 'border-slate-200 dark:border-border/60'}`}>
                <div className="flex flex-col sm:flex-row items-start justify-between mb-6 sm:mb-8 gap-4">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div onClick={() => handleOpenProfile(post.author)} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-black border-2 flex items-center justify-center relative shadow-lg cursor-pointer hover:scale-105 transition-all ${post.author.isPremium ? 'border-amber-500 shadow-amber-500/20' : 'border-slate-200 dark:border-white/10'}`}>
                      <div className="w-full h-full rounded-[0.7rem] sm:rounded-[0.9rem] overflow-hidden flex items-center justify-center">
                        {post.author.name === currentUserName && preferences.avatar ? (
                           <img src={preferences.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} sm:size={28} className={post.author.isPremium ? 'text-amber-500' : 'text-indigo-600 dark:text-indigo-400'} />
                        )}
                      </div>
                      {post.author.isPremium && (
                        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-black z-[100] animate-float-crown shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                          <Crown size={10} sm:size={12} fill="currentColor" className="text-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <h4 onClick={() => handleOpenProfile(post.author)} className={`text-sm sm:text-base font-black italic tracking-tight cursor-pointer hover:underline ${post.author.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'}`}>{post.author.name}</h4>
                        <span className={`text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-black/60 border uppercase tracking-widest ${post.author.isPremium ? 'text-amber-600 dark:text-amber-500 border-amber-500/20' : 'text-secondary border-slate-200 dark:border-white/5'}`}>{post.author.rank}</span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-secondary font-bold uppercase opacity-40 mt-0.5 sm:mt-1 flex items-center gap-2"><Clock size={10} /> {new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-start sm:justify-end gap-1.5 sm:gap-2 max-w-full sm:max-w-[250px]">
                    {post.premiumTags.map(tag => {
                      const s = getCategoryStyle(tag);
                      return (
                        <div key={tag} className={`px-2.5 sm:px-3 py-1 rounded-lg border ${s.bg} ${s.border} ${s.text} flex items-center gap-1.5 sm:gap-2 bg-slate-50/50 dark:bg-black/60 backdrop-blur-md shadow-lg`}>
                          <div className={`w-1 h-1 rounded-full ${s.dot} animate-pulse`} />
                          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter italic">{SHORT_NAMES[tag]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={`text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 italic ${post.author.isPremium ? 'text-slate-900 dark:text-white font-bold' : 'text-secondary font-medium'}`}>{post.content}</div>
                <div className="flex items-center justify-between pt-6 sm:pt-8 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-6 sm:gap-10">
                    <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-2 sm:gap-2.5 transition-all hover:scale-110 ${post.hasLiked ? 'text-red-500' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'} ${(!preferences.isLoggedIn || post.author.name === currentUserName) ? 'opacity-30 cursor-not-allowed' : ''}`}>
                      <Heart 
                        size={20} sm:size={22} 
                        fill={post.hasLiked ? 'currentColor' : 'none'} 
                        stroke={post.hasLiked ? 'black' : 'currentColor'} 
                        strokeWidth={post.hasLiked ? 3 : 2.5} 
                      />
                      <span className="text-xs sm:text-sm font-black tabular-nums">{post.likes}</span>
                    </button>
                    <button onClick={() => handleUsefulPost(post.id)} className={`flex items-center gap-2 sm:gap-2.5 transition-all hover:scale-110 ${post.isUseful ? 'text-emerald-600 dark:text-emerald-500' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'} ${(!preferences.isLoggedIn || post.author.name === currentUserName) ? 'opacity-30 cursor-not-allowed' : ''}`}>
                      <CheckCircle 
                        size={20} sm:size={22} 
                        fill={post.isUseful ? 'currentColor' : 'none'} 
                        stroke={post.isUseful ? 'black' : 'currentColor'} 
                        strokeWidth={post.isUseful ? 3 : 2.5} 
                      />
                      <span className="text-xs sm:text-sm font-black tabular-nums">{post.usefulCount}</span>
                    </button>
                    <button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)} className={`flex items-center gap-2 sm:gap-2.5 transition-colors ${replyingTo === post.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}><MessageSquare size={20} sm:size={22} strokeWidth={2.5} /><span className="text-xs sm:text-sm font-black tabular-nums">{post.replies.length}</span></button>
                  </div>
                </div>
                {post.replies.length > 0 && (
                  <div className="mt-10 space-y-6 pl-8 border-l-2 border-indigo-600/20 dark:border-indigo-500/20">
                    {post.replies.map(reply => (
                      <div key={reply.id} className="bg-slate-50 dark:bg-black/30 p-6 rounded-[1.5rem] border border-slate-100 dark:border-white/5 group/reply flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center gap-4 mb-3">
                              <div onClick={() => handleOpenProfile(reply.author)} className={`w-10 h-10 rounded-xl bg-white dark:bg-black border-2 flex items-center justify-center cursor-pointer relative ${reply.author.isPremium ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-slate-200 dark:border-white/10 text-secondary'}`}>
                                <div className="w-full h-full rounded-[0.7rem] overflow-hidden flex items-center justify-center">
                                  {reply.author.name === currentUserName && preferences.avatar ? (
                                    <img src={preferences.avatar} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={18} className={reply.author.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-indigo-600 dark:text-indigo-400'} />
                                  )}
                                </div>
                                {reply.author.isPremium && (
                                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-black z-[100] animate-float-crown shadow-[0_0_5px_rgba(245,158,11,0.6)]">
                                    <Crown size={7} fill="currentColor" className="text-black" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span onClick={() => handleOpenProfile(reply.author)} className={`text-xs font-black italic cursor-pointer hover:underline ${reply.author.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'}`}>{reply.author.name}</span>
                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-black/60 border uppercase tracking-widest ${reply.author.isPremium ? 'text-amber-600 dark:text-amber-500 border-amber-500/20' : 'text-secondary border-slate-200 dark:border-white/5'}`}>{reply.author.rank}</span>
                              </div>
                            </div>
                            <p className="text-sm text-secondary italic font-medium leading-relaxed">{reply.content}</p>
                          </div>
                          <div className="flex flex-col items-center gap-3 ml-4">
                            <button onClick={() => handleUsefulReply(post.id, reply.id)} className={`flex flex-col items-center gap-1 transition-all ${reply.isUseful ? 'text-emerald-600 dark:text-emerald-500 scale-110' : 'text-secondary/40 hover:text-emerald-600 dark:hover:text-emerald-400'} ${(!preferences.isLoggedIn || reply.author.name === currentUserName) ? 'opacity-30 cursor-not-allowed' : ''}`}>
                              <CheckCircle 
                                size={22} 
                                fill={reply.isUseful ? 'currentColor' : 'none'} 
                                stroke={reply.isUseful ? 'black' : 'currentColor'} 
                                strokeWidth={reply.isUseful ? 3 : 2.5} 
                              />
                              <span className="text-px font-black">{reply.usefulCount}</span>
                            </button>
                            <button onClick={() => handleLikeReply(post.id, reply.id)} className={`flex flex-col items-center gap-1 transition-all ${reply.hasLiked ? 'text-red-500 scale-110' : 'text-secondary/40 hover:text-indigo-600 dark:hover:text-white'} ${(!preferences.isLoggedIn || reply.author.name === currentUserName) ? 'opacity-30 cursor-not-allowed' : ''}`}>
                              <Heart 
                                size={18} 
                                fill={reply.hasLiked ? 'currentColor' : 'none'} 
                                stroke={reply.hasLiked ? 'black' : 'currentColor'} 
                                strokeWidth={reply.hasLiked ? 3 : 2} 
                              />
                              <span className="text-px font-black">{reply.likes}</span>
                            </button>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
                {replyingTo === post.id && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 animate-slide-up">
                    {preferences.isLoggedIn ? (
                      <div className="flex gap-4">
                          <input autoFocus type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Escribe tu conocimiento..." className="flex-grow bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm italic text-primary outline-none focus:border-indigo-500/50" onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)} />
                          <button onClick={() => handleReply(post.id)} disabled={!replyContent.trim()} className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-30"><Send size={20} /></button>
                          <button onClick={() => setReplyingTo(null)} className="p-4 bg-slate-50 dark:bg-white/5 text-secondary rounded-2xl border border-slate-200 dark:border-white/5"><X size={20} /></button>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5 text-center flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase italic tracking-widest opacity-60">Inicia sesión para responder</span>
                        <button onClick={() => setReplyingTo(null)} className="p-2 text-secondary"><X size={16} /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Derecho: Stats y Leaderboard */}
        <div className="lg:col-span-3 space-y-8 sticky top-24">
          <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
             <h3 className="text-sm font-black text-primary uppercase italic tracking-widest mb-8 flex items-center gap-3"><TrendingUp size={18} className="text-amber-600 dark:text-amber-500" />Impacto Semanal</h3>
             <div className="space-y-8">
                {[
                  { label: 'Likes Totales', val: preferences.reputation.likesReceived, color: 'text-red-500' },
                  { label: 'Respuestas Útiles', val: preferences.reputation.usefulReceived, color: 'text-emerald-600 dark:text-emerald-500' }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-default">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-indigo-600 dark:group-hover:text-white transition-colors italic opacity-70">{stat.label}</span>
                    <span className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</span>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border/40 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_70%)]" />
             <h3 className="text-sm font-black text-primary uppercase italic tracking-widest mb-8 flex items-center gap-3 relative z-10"><Award size={18} className="text-indigo-600 dark:text-indigo-400" />Líderes Biohacker</h3>
             <div className="space-y-6 relative z-10">
                {leaderBoard.length === 1 && leaderBoard[0].name === currentUserName && preferences.reputation.totalPoints === 0 ? (
                   <p className="text-[10px] text-secondary font-black uppercase italic opacity-40 text-center py-4">Tabla sin registros técnicos vigentes.</p>
                ) : leaderBoard.map((p, i) => (
                  <div key={i} onClick={() => handleOpenProfile(p)} className="flex items-center justify-between group cursor-pointer hover:translate-x-2 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-black italic ${i === 0 ? 'text-amber-600 dark:text-amber-500' : 'text-indigo-600 dark:text-indigo-500'} w-6`}>#{i+1}</div>
                      <div className="flex items-center gap-3">
                         <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-black border flex items-center justify-center relative flex-shrink-0 transition-colors ${p.isPremium ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'border-slate-200 dark:border-white/10'}`}>
                           <div className="w-full h-full rounded-[0.6rem] overflow-hidden flex items-center justify-center">
                             {p.name === currentUserName && preferences.avatar ? (
                               <img src={preferences.avatar} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                               <User size={16} className={p.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-indigo-600 dark:text-secondary'} />
                             )}
                           </div>
                           {p.isPremium && (
                            <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-amber-500 rounded-full flex items-center justify-center border border-white dark:border-black animate-float-crown shadow-[0_0_10px_rgba(245,158,11,0.6)] z-[100]">
                              <Crown size={9} fill="currentColor" className="text-black" />
                            </div>
                           )}
                         </div>
                         <div className="flex flex-col min-w-0">
                            <div className={`text-[12px] font-black uppercase italic tracking-tight leading-none mb-1 group-hover:underline pr-4 ${p.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-primary'}`}>{p.name}</div>
                            <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-black/60 border uppercase tracking-widest leading-none self-start ${p.isPremium ? 'text-amber-600 dark:text-amber-500 border-amber-500/20' : 'text-secondary border-slate-200 dark:border-white/5'}`}>{p.rank}</div>
                         </div>
                      </div>
                    </div>
                    <div className={`text-[11px] font-black italic tabular-nums ${p.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-secondary'}`}>{p.reputation.toFixed(1)}%</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {selectedProfile && (
        <>
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProfile(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-[120] animate-slide-up flex flex-col max-h-[90vh] overflow-hidden">
            <div className="relative shrink-0 bg-gradient-to-br from-indigo-900/10 via-white dark:via-black to-white dark:to-black p-8 flex items-center gap-6 border-b border-slate-100 dark:border-white/5">
               <button onClick={() => setSelectedProfile(null)} className="absolute top-6 right-6 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors z-20"><X size={20} /></button>
               <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl bg-white dark:bg-black border-2 flex items-center justify-center relative shadow-xl ${selectedProfile.isPremium ? 'border-amber-500' : 'border-slate-200 dark:border-indigo-500/40'}`}>
                     <div className="w-full h-full rounded-[1.1rem] overflow-hidden flex items-center justify-center">
                       {selectedProfile.avatar ? (
                         <img src={selectedProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <User size={32} className={selectedProfile.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-indigo-600 dark:text-indigo-400'} />
                       )}
                     </div>
                  </div>
                  {selectedProfile.isPremium && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-float-crown shadow-[0_0_10px_rgba(245,158,11,0.6)] z-[100]">
                      <Crown size={16} fill="currentColor" className="text-black" />
                    </div>
                  )}
               </div>
               <div className="min-w-0">
                  <h3 className={`text-2xl font-black italic uppercase tracking-tighter truncate pr-8 ${selectedProfile.isPremium ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'}`}>{selectedProfile.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest italic ${selectedProfile.isPremium ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/30' : 'bg-slate-100 dark:bg-white/5 text-secondary border-slate-200 dark:border-white/10'}`}>{selectedProfile.rank}</span>
                  </div>
               </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex flex-col items-center text-center shadow-inner">
                     <Heart size={20} className="text-red-500 mb-2" fill="currentColor" stroke="black" strokeWidth={1} />
                     <span className="text-xl font-black text-slate-900 dark:text-white italic">{selectedProfile.likesReceived}</span>
                     <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Me Gusta</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex flex-col items-center text-center shadow-inner">
                     <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-500 mb-2" fill="currentColor" stroke="black" strokeWidth={1} />
                     <span className="text-xl font-black text-slate-900 dark:text-white italic">{selectedProfile.usefulReceived}</span>
                     <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Útil</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest italic opacity-60">Reputación Biohacker</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400 italic tabular-nums">{selectedProfile.reputation.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                    <div className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000" style={{ width: `${selectedProfile.reputation}%` }} />
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                     <Target size={18} className="text-amber-600 dark:text-amber-500/60" />
                     <span className="text-[10px] font-black text-secondary uppercase italic truncate">Objetivo: {SHORT_NAMES[selectedProfile.topGoal as PremiumTag] || selectedProfile.topGoal}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Activity size={18} className="text-indigo-600 dark:text-indigo-400/60" />
                     <div className="flex-grow">
                        <div className="flex justify-between mb-1">
                           <span className="text-[10px] font-black text-secondary uppercase italic">Actividad de Protocolos</span>
                           <span className="text-[10px] font-black text-slate-900 dark:text-white italic">{selectedProfile.protocolActivity}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${selectedProfile.protocolActivity}%` }} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityView;