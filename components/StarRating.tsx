
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  max?: number;
  interactive?: boolean;
  onVote?: (rating: number) => void;
  size?: number;
  className?: string;
}

const StarRating: React.FC<Props> = ({ 
  rating, 
  max = 5, 
  interactive = false, 
  onVote, 
  size = 16,
  className = "" 
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Calculate precision of 0.1
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const val = Math.round((index + percent) * 10) / 10;
    setHoverRating(val);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation(); // Prevent card click
    if (!interactive || !onVote) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const val = Math.round((index + percent) * 10) / 10;
    onVote(val);
  };

  return (
    <div 
      className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onMouseLeave={() => setHoverRating(null)}
    >
      {[...Array(max)].map((_, i) => {
        const fillAmount = Math.max(0, Math.min(1, displayRating - i));
        
        return (
          <div
            key={i}
            className="relative"
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={(e) => handleClick(e, i)}
            style={{ width: size, height: size }}
          >
            {/* Background / Hollow Star - Enhanced contrast for Light Mode */}
            <Star 
              size={size} 
              className="text-slate-300 dark:text-white/10 absolute inset-0" 
              strokeWidth={2}
            />
            
            {/* Filled Star with Clip Path */}
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${fillAmount * 100}%` }}
            >
              <Star 
                size={size} 
                className="text-amber-500 fill-amber-500" 
                strokeWidth={1.5}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
