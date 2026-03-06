import React from 'react';
import { Heart, Smile } from 'lucide-react';

// おにぎりアイコン
export const OnigiriIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C65 15, 85 70, 85 80 C85 85, 75 90, 50 90 C25 90, 15 85, 15 80 C15 70, 35 15, 50 15 Z" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
    <path d="M35 75 L65 75 L65 90 C50 92, 50 92, 35 90 Z" fill="#1A1A1A" />
    <circle cx="50" cy="55" r="6" fill="#F43F5E" opacity="0.8" />
  </svg>
);

// コップ（はみがき）アイコン
export const CupIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M70 45 C85 45, 85 75, 70 75" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M25 30 L75 30 L70 85 C70 90, 30 90, 30 85 Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="3" />
    <ellipse cx="50" cy="35" rx="22" ry="5" fill="#BFDBFE" />
  </svg>
);

// お水（かおをふく）アイコン
export const WaterIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C50 15, 80 50, 80 70 C80 85, 65 95, 50 95 C35 95, 20 85, 20 70 C20 50, 50 15, 50 15 Z" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="3" />
    <path d="M40 60 C35 65, 35 75, 40 80" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// おようふく（きがえ）アイコン
export const ClothesIcon = ({ size = 40, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M30 20 L20 35 L30 45 L30 85 L70 85 L70 45 L80 35 L70 20 L60 25 C55 20, 45 20, 40 25 L30 20 Z" fill={active ? "#FFFFFF" : "#F472B6"} stroke={active ? "#F472B6" : "#DB2777"} strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

// キラキラ（わすれもの）アイコン
export const CustomSparkleIcon = ({ size = 40, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 10 L58 42 L90 50 L58 58 L50 90 L42 58 L10 50 L42 42 Z" fill={active ? "#FFFFFF" : "#FDE047"} stroke={active ? "#FDE047" : "#EAB308"} strokeWidth="4" />
  </svg>
);

// 達成時のスタンプアイコン
export const StarMark = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg overflow-visible">
    <path d="M50 5 L63 38 L98 38 L70 59 L81 92 L50 72 L19 92 L30 59 L2 38 L37 38 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);

// うさぎのキャラクター
export const UsagiCharacter = ({ size = 150, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" fill="none" className={className}>
    <ellipse cx="130" cy="120" rx="45" ry="110" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <ellipse cx="270" cy="120" rx="45" ry="110" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <circle cx="200" cy="270" r="120" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <circle cx="155" cy="260" r="15" fill="#0F172A" />
    <circle cx="245" cy="260" r="15" fill="#0F172A" />
    <circle cx="200" cy="295" r="10" fill="#F43F5E" />
    <path d="M175 325C190 335 210 335 225 325" stroke="#F43F5E" strokeWidth="10" strokeLinecap="round" fill="none"/>
  </svg>
);

// タスク名に応じてアイコンを出し分けるメインコンポーネント
export const TaskIcon = ({ name, size = 50, active = false }) => {
  const props = { size, className: active ? "text-white" : "text-pink-600" };
  switch (name) {
    case 'onigiri': return <OnigiriIcon size={size} />;
    case 'clothes': return <ClothesIcon size={size} active={active} />;
    case 'cup': return <CupIcon size={size} />;
    case 'water': return <WaterIcon size={size} />;
    case 'sparkle': return <CustomSparkleIcon size={size} active={active} />;
    case 'heart': return <Heart {...props} className={active ? "text-white" : "text-rose-500"} />;
    default: return <Smile {...props} />;
  }
};
