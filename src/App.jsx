import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  Star, 
  Trash2, 
  X, 
  Heart, 
  Smile, 
  Play, 
  Pause,
  Plus
} from 'lucide-react';

// --- カスタムアイコンコンポーネント ---
const OnigiriIcon = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C65 15, 85 70, 85 80 C85 85, 75 90, 50 90 C25 90, 15 85, 15 80 C15 70, 35 15, 50 15 Z" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
    <path d="M35 75 L65 75 L65 90 C50 92, 50 92, 35 90 Z" fill="#1A1A1A" />
    <circle cx="50" cy="55" r="6" fill="#F43F5E" opacity="0.8" />
  </svg>
);

const CupIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M70 45 C85 45, 85 75, 70 75" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M25 30 L75 30 L70 85 C70 90, 30 90, 30 85 Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="3" />
    <ellipse cx="50" cy="35" rx="22" ry="5" fill="#BFDBFE" />
    <circle cx="20" cy="25" r="3" fill="#FDE047" className="animate-pulse" />
  </svg>
);

const WaterIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C50 15, 80 50, 80 70 C80 85, 65 95, 50 95 C35 95, 20 85, 20 70 C20 50, 50 15, 50 15 Z" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="3" />
    <path d="M40 60 C35 65, 35 75, 40 80" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    <circle cx="75" cy="40" r="5" fill="#0EA5E9" opacity="0.6" />
    <path d="M85 65 L88 72 L95 75 L88 78 L85 85 L82 78 L75 75 L82 72 Z" fill="#FDE047" className="animate-pulse" />
  </svg>
);

const ClothesIcon = ({ size = 40, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M30 20 L20 35 L30 45 L30 85 L70 85 L70 45 L80 35 L70 20 L60 25 C55 20, 45 20, 40 25 L30 20 Z" fill={active ? "#FFFFFF" : "#F472B6"} stroke={active ? "#F472B6" : "#DB2777"} strokeWidth="3" strokeLinejoin="round" />
    <path d="M45 45 Q50 40 55 45 Q55 50 50 55 Q45 50 45 45 Z" fill={active ? "#F472B6" : "white"} opacity="0.9" />
  </svg>
);

const CustomSparkleIcon = ({ size = 40, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 10 L58 42 L90 50 L58 58 L50 90 L42 58 L10 50 L42 42 Z" fill={active ? "#FFFFFF" : "#FDE047"} stroke={active ? "#FDE047" : "#EAB308"} strokeWidth="4" strokeLinejoin="round" />
    <path d="M80 20 L84 30 L94 34 L84 38 L80 48 L76 38 L66 34 L76 30 Z" fill={active ? "#FDE047" : "#FEF08A"} className="animate-pulse" />
  </svg>
);

const StarMark = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg overflow-visible">
    <path d="M50 5 L63 38 L98 38 L70 59 L81 9
