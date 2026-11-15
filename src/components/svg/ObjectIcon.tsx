import React from 'react';
import { IdleAnimationType } from '../../types/game';

interface ObjectIconProps {
  iconKey: string;
  idleAnimation?: IdleAnimationType;
  silhouette?: boolean;
  reflectedIconKey?: string;
  className?: string;
}

function getAnimationWrapperClass(idleAnimation?: IdleAnimationType, silhouette?: boolean): string {
  if (silhouette) return '';
  switch (idleAnimation) {
    case 'plant_sprout':
      return 'animate-plant-sway';
    case 'cube_hover':
      return 'animate-cube-bob';
    case 'mood_lamp':
      return 'animate-mood-shift';
    case 'float_gentle':
      return 'animate-float-gentle';
    default:
      return '';
  }
}

export const ObjectIcon: React.FC<ObjectIconProps> = ({
  iconKey,
  idleAnimation,
  silhouette = false,
  reflectedIconKey,
  className = 'w-12 h-12',
}) => {
  const animClass = getAnimationWrapperClass(idleAnimation, silhouette);
  const filterClass = silhouette ? 'brightness-0 opacity-30' : '';

  const renderSvg = () => {
    switch (iconKey) {
      case 'forecast_toaster':
      case 'toaster':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Animated forecast toast */}
            <g className={silhouette ? '' : 'animate-toaster-pop'}>
              <path
                d="M20 23 C20 14, 29 13, 31 17 C33 13, 42 14, 42 23 L42 31 L20 31 Z"
                fill="#F4C27F"
                stroke="#2D241E"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Tiny sun forecast scorch mark */}
              <circle cx="31" cy="22" r="3" fill="#B45309" />
              <path
                d="M31 16.5 V18 M31 26 V27.5 M25.5 22 H27 M35 22 H36.5"
                stroke="#B45309"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
            <rect
              x="12"
              y="26"
              width="40"
              height="26"
              rx="7"
              fill="#E2E8F0"
              stroke="#2D241E"
              strokeWidth="2.5"
            />
            <path d="M16 31 H48" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Side barometer dial */}
            <circle cx="24" cy="40" r="6" fill="#FFFBEB" stroke="#2D241E" strokeWidth="1.8" />
            <line x1="24" y1="40" x2="27" y2="37" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="39" cy="40" r="2" fill="#0D9488" />
            <rect x="52" y="34" width="5" height="6" rx="2" fill="#DC2626" stroke="#2D241E" strokeWidth="2" />
            <rect x="17" y="52" width="6" height="4" rx="1.5" fill="#475569" stroke="#2D241E" strokeWidth="2" />
            <rect x="41" y="52" width="6" height="4" rx="1.5" fill="#475569" stroke="#2D241E" strokeWidth="2" />
          </svg>
        );

      case 'overachieving_plant':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Terracotta pot */}
            <polygon
              points="21,41 43,41 39,56 25,56"
              fill="#EA580C"
              stroke="#2D241E"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <rect x="19" y="37" width="26" height="6" rx="2" fill="#F97316" stroke="#2D241E" strokeWidth="2.4" />
            {/* Lush stems */}
            <path d="M32 37 Q24 27 18 22" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 37 Q32 22 32 14" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 37 Q41 28 46 21" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            {/* Leaves */}
            <ellipse cx="24" cy="30" rx="6" ry="3.2" transform="rotate(-30 24 30)" fill="#22C55E" stroke="#2D241E" strokeWidth="1.8" />
            <ellipse cx="40" cy="30" rx="6" ry="3.2" transform="rotate(30 40 30)" fill="#22C55E" stroke="#2D241E" strokeWidth="1.8" />
            {/* Miniature grown replica buds (tiny clock, tiny mug, tiny bell) */}
            <circle cx="17" cy="20" r="4.5" fill="#FDE047" stroke="#2D241E" strokeWidth="1.8" />
            <line x1="17" y1="20" x2="17" y2="17.5" stroke="#2D241E" strokeWidth="1.3" />
            <rect x="28" y="10" width="8" height="7" rx="2" fill="#38BDF8" stroke="#2D241E" strokeWidth="1.8" />
            <circle cx="47" cy="20" r="4.2" fill="#F472B6" stroke="#2D241E" strokeWidth="1.8" />
          </svg>
        );

      case 'memory_vending':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="15" y="10" width="34" height="45" rx="5" fill="#34D399" stroke="#2D241E" strokeWidth="2.5" />
            {/* Glass display window */}
            <rect x="19" y="15" width="20" height="25" rx="2.5" fill="#ECFEFF" stroke="#2D241E" strokeWidth="2" />
            {/* Glowing memory capsules */}
            <circle cx="24" cy="21" r="2.8" fill="#F472B6" stroke="#2D241E" strokeWidth="1.3" className={silhouette ? '' : 'animate-pulse-lamp'} />
            <circle cx="33" cy="21" r="2.8" fill="#FBBF24" stroke="#2D241E" strokeWidth="1.3" />
            <circle cx="24" cy="29" r="2.8" fill="#60A5FA" stroke="#2D241E" strokeWidth="1.3" />
            <circle cx="33" cy="29" r="2.8" fill="#A78BFA" stroke="#2D241E" strokeWidth="1.3" className={silhouette ? '' : 'animate-pulse-lamp'} />
            <line x1="20" y1="25" x2="38" y2="25" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="20" y1="33" x2="38" y2="33" stroke="#94A3B8" strokeWidth="1.5" />
            {/* Keypad & coin slot */}
            <rect x="41" y="19" width="5" height="12" rx="1" fill="#1E293B" />
            <circle cx="43.5" cy="35" r="2" fill="#F59E0B" stroke="#2D241E" strokeWidth="1.2" />
            {/* Dispense flap */}
            <rect x="20" y="44" width="18" height="7" rx="1.5" fill="#1E293B" stroke="#2D241E" strokeWidth="1.8" />
            <rect x="18" y="55" width="6" height="3" fill="#334155" />
            <rect x="40" y="55" width="6" height="3" fill="#334155" />
          </svg>
        );

      case 'confused_clock':
      case 'clock':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="28" y="9" width="8" height="5" rx="1.5" fill="#D97706" stroke="#2D241E" strokeWidth="2" />
            <circle cx="32" cy="34" r="19" fill="#92400E" stroke="#2D241E" strokeWidth="2.5" />
            <circle cx="32" cy="34" r="14.5" fill="#FFFBEB" stroke="#2D241E" strokeWidth="2" />
            {/* Quirky reversed tick marks */}
            <circle cx="32" cy="23" r="1.4" fill="#2D241E" />
            <circle cx="43" cy="34" r="1.4" fill="#2D241E" />
            <circle cx="32" cy="45" r="1.4" fill="#2D241E" />
            <circle cx="21" cy="34" r="1.4" fill="#2D241E" />
            {/* Animated reversing hands */}
            <g className={silhouette ? '' : 'animate-reverse-tick'}>
              <line x1="32" y1="34" x2="32" y2="23" stroke="#2D241E" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="32" y1="34" x2="24" y2="38" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <circle cx="32" cy="34" r="2.4" fill="#F59E0B" stroke="#2D241E" strokeWidth="1.6" />
          </svg>
        );

      case 'knowledge_cube':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <ellipse cx="32" cy="54" rx="14" ry="3.5" fill="#2D241E" fillOpacity="0.18" />
            {/* Isometric Cube */}
            <polygon points="32,12 50,22 32,32 14,22" fill="#38BDF8" stroke="#2D241E" strokeWidth="2.4" strokeLinejoin="round" />
            <polygon points="14,22 32,32 32,50 14,40" fill="#0284C7" stroke="#2D241E" strokeWidth="2.4" strokeLinejoin="round" />
            <polygon points="50,22 32,32 32,50 50,40" fill="#0369A1" stroke="#2D241E" strokeWidth="2.4" strokeLinejoin="round" />
            {/* Trivia glyphs */}
            <circle cx="32" cy="22" r="3" fill="#FEF08A" />
            <path d="M20 31 L26 34 M20 36 L24 38" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
            <circle cx="41" cy="35" r="2.6" fill="#99F6E4" />
          </svg>
        );

      case 'invisible_duck':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Acoustic quack ripples */}
            <circle
              cx="32"
              cy="31"
              r="14"
              stroke="#0D9488"
              strokeWidth="2"
              strokeDasharray="4 3"
              className={silhouette ? '' : 'animate-duck-ripple'}
            />
            {/* Faint dotted duck outline */}
            <path
              d="M21 36 C19 29, 25 26, 30 28 C31 20, 38 17, 43 21 C45 23, 45 25, 50 26 C48 29, 44 29, 42 30 C43 38, 36 44, 26 43 C21 43, 19 40, 21 36 Z"
              fill="#99F6E4"
              fillOpacity="0.22"
              stroke="#0F766E"
              strokeWidth="2.2"
              strokeDasharray="3 3"
              strokeLinejoin="round"
            />
            {/* Wet webbed footprints below */}
            <path d="M24 52 L22 56 M24 52 L24 56 M24 52 L26 56" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <path d="M36 50 L34 54 M36 50 L36 54 M36 50 L38 54" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            {/* Little speech tag */}
            {!silhouette && (
              <g>
                <rect x="37" y="10" width="21" height="11" rx="4" fill="#FFFDF8" stroke="#2D241E" strokeWidth="1.6" />
                <text x="47.5" y="18" textAnchor="middle" fill="#26211C" fontSize="6.5" fontWeight="800">
                  quack
                </text>
              </g>
            )}
          </svg>
        );

      case 'emotional_lamp':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Halo glow */}
            <circle cx="32" cy="25" r="20" fill="#FBBF24" fillOpacity="0.28" />
            {/* Pleated shade */}
            <polygon
              points="21,15 43,15 49,33 15,33"
              fill="#F59E0B"
              stroke="#2D241E"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <line x1="27" y1="15" x2="24" y2="33" stroke="#2D241E" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="32" y1="15" x2="32" y2="33" stroke="#2D241E" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="37" y1="15" x2="40" y2="33" stroke="#2D241E" strokeWidth="1.5" strokeOpacity="0.4" />
            {/* Brass stem & base */}
            <rect x="29.5" y="33" width="5" height="15" fill="#D97706" stroke="#2D241E" strokeWidth="2.2" />
            <ellipse cx="32" cy="50" rx="13" ry="4.5" fill="#B45309" stroke="#2D241E" strokeWidth="2.4" />
          </svg>
        );

      case 'suspicious_mirror':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Brass stand */}
            <path d="M22 54 H42 M32 47 V54" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            {/* Ornate brass oval frame */}
            <ellipse cx="32" cy="29" rx="16" ry="20" fill="#F59E0B" stroke="#2D241E" strokeWidth="2.5" />
            {/* Mirror glass */}
            <ellipse cx="32" cy="29" rx="11.5" ry="15.5" fill="#CFFAFE" stroke="#2D241E" strokeWidth="2" />
            {/* Diagonal glint */}
            <path d="M24 22 L30 16 M24 29 L36 17" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.85" />
            {/* Subtle alternate reflection silhouette inside mirror */}
            {!silhouette && (
              <g opacity="0.72">
                {reflectedIconKey === 'infinite_mug' ? (
                  <rect x="27" y="25" width="10" height="10" rx="2" fill="#0284C7" stroke="#2D241E" strokeWidth="1.4" />
                ) : reflectedIconKey === 'pocket_thunderstorm' ? (
                  <circle cx="32" cy="29" r="5" fill="#64748B" stroke="#2D241E" strokeWidth="1.4" />
                ) : (
                  <path d="M28 33 L32 23 L36 33 Z" fill="#0D9488" stroke="#2D241E" strokeWidth="1.4" />
                )}
              </g>
            )}
          </svg>
        );

      case 'infinite_mug':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Rising steam */}
            <path d="M24 14 Q21 18 24 22" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" className={silhouette ? '' : 'animate-bubble-rise'} />
            <path d="M33 11 Q30 16 33 20" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" className={silhouette ? '' : 'animate-bubble-rise'} />
            {/* Handle */}
            <path d="M44 28 H49 C53 28, 53 41, 48 41 H43" stroke="#2D241E" strokeWidth="2.8" strokeLinecap="round" />
            {/* Cobalt enamel mug body */}
            <rect x="16" y="23" width="28" height="26" rx="5" fill="#0284C7" stroke="#2D241E" strokeWidth="2.5" />
            {/* Coffee rim */}
            <ellipse cx="30" cy="24" rx="14" ry="4" fill="#F8FAFC" stroke="#2D241E" strokeWidth="2.2" />
            <ellipse cx="30" cy="24" rx="10.5" ry="2.4" fill="#78350F" />
            {/* Speckle details */}
            <circle cx="24" cy="34" r="1.4" fill="#E0F2FE" />
            <circle cx="35" cy="39" r="1.6" fill="#E0F2FE" />
            <circle cx="29" cy="42" r="1.2" fill="#E0F2FE" />
          </svg>
        );

      case 'paradox_compass':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <rect x="28" y="8" width="8" height="5" rx="2" fill="#F59E0B" stroke="#2D241E" strokeWidth="2" />
            <circle cx="32" cy="34" r="20" fill="#D97706" stroke="#2D241E" strokeWidth="2.5" />
            <circle cx="32" cy="34" r="15" fill="#FFFBEB" stroke="#2D241E" strokeWidth="2" />
            {/* Six cardinal ticks */}
            <path
              d="M32 21 V24 M32 44 V47 M19 34 H22 M42 34 H45"
              stroke="#4B4035"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <g className={silhouette ? '' : 'animate-reverse-tick'}>
              <polygon points="32,21 35,34 32,37 29,34" fill="#6D28D9" stroke="#2D241E" strokeWidth="1.5" />
              <polygon points="32,47 35,34 32,31 29,34" fill="#0D9488" stroke="#2D241E" strokeWidth="1.5" />
            </g>
            <circle cx="32" cy="34" r="3" fill="#F59E0B" stroke="#2D241E" strokeWidth="1.8" />
          </svg>
        );

      case 'klein_box':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <ellipse cx="32" cy="54" rx="14" ry="3.5" fill="#2D241E" fillOpacity="0.18" />
            {/* Topological Suggestion Box + Folded Glass Tube */}
            <rect x="16" y="22" width="32" height="27" rx="5" fill="#A5F3FC" stroke="#2D241E" strokeWidth="2.4" />
            <path
              d="M28 22 C28 11, 46 11, 46 25 C46 37, 25 39, 25 32"
              stroke="#0891B2"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <rect x="22" y="27" width="14" height="3.5" rx="1.5" fill="#1E293B" />
            <rect x="25" y="17" width="8" height="10" rx="1" fill="#FEF3C7" stroke="#2D241E" strokeWidth="1.8" />
          </svg>
        );

      case 'pocket_thunderstorm':
      default:
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            {/* Copper grounding dish */}
            <ellipse cx="32" cy="52" rx="16" ry="4" fill="#D97706" stroke="#2D241E" strokeWidth="2.2" />
            {/* Animated golden lightning bolt & rain */}
            <g className={silhouette ? '' : 'animate-storm-flash'}>
              <polygon
                points="33,33 27,42 32,42 29,49 38,39 33,39"
                fill="#FACC15"
                stroke="#2D241E"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </g>
            <line x1="21" y1="38" x2="19" y2="44" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            <line x1="43" y1="38" x2="41" y2="44" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            {/* Fluffy storm cloud */}
            <path
              d="M19 34 C14 34, 12 28, 17 25 C17 18, 26 14, 33 17 C38 14, 46 18, 46 24 C51 26, 50 34, 44 34 Z"
              fill="#64748B"
              stroke="#2D241E"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M22 25 C24 21, 30 20, 33 22" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${animClass} ${filterClass}`}>
      <div className={className}>{renderSvg()}</div>
    </div>
  );
};

interface EmployeeAvatarProps {
  coatColor: string;
  hairColor: string;
  skinColor: string;
  avatarKey: string;
  className?: string;
}

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  coatColor,
  hairColor,
  skinColor,
  avatarKey,
  className = 'w-12 h-12',
}) => {
  const tieColor =
    avatarKey === 'winston'
      ? '#B45309'
      : avatarKey === 'jasper'
      ? '#1E293B'
      : avatarKey === 'tessa'
      ? '#BE185D'
      : '#0D9488';

  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <circle cx="32" cy="32" r="29" fill="#F7EFE0" stroke="#2D241E" strokeWidth="2.5" />
      {/* Back hair styles for longer/bun profiles */}
      {avatarKey === 'sora' && (
        <circle cx="44" cy="21" r="6.5" fill={hairColor} stroke="#2D241E" strokeWidth="2" />
      )}
      {avatarKey === 'mina' && (
        <path
          d="M19 28 V39 C19 42, 45 42, 45 39 V28 Z"
          fill={hairColor}
          stroke="#2D241E"
          strokeWidth="2"
        />
      )}
      <path
        d="M13 55 C15 43, 49 43, 51 55 Z"
        fill={coatColor}
        stroke="#2D241E"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path d="M32 45 L29 55 H35 Z" fill={tieColor} stroke="#2D241E" strokeWidth="1.5" />
      <circle cx="32" cy="29" r="12" fill={skinColor} stroke="#2D241E" strokeWidth="2.3" />
      <path
        d="M19 28 C19 16, 45 16, 45 28 C42 22, 23 22, 19 28 Z"
        fill={hairColor}
        stroke="#2D241E"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Mustache / beard for Barnaby or Winston */}
      {avatarKey === 'barnaby' && (
        <path
          d="M27 33 Q32 31 37 33"
          stroke={hairColor}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
      {avatarKey === 'winston' && (
        <path
          d="M26 33.5 Q32 32 38 33.5"
          stroke="#334155"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      <circle cx="27.5" cy="30" r="1.7" fill="#2D241E" />
      <circle cx="36.5" cy="30" r="1.7" fill="#2D241E" />
      {/* Spectacles */}
      {(avatarKey === 'barnaby' ||
        avatarKey === 'cedric' ||
        avatarKey === 'winston' ||
        avatarKey === 'helena') && (
        <g stroke="#2D241E" strokeWidth="1.6">
          <circle cx="27.5" cy="30" r="4" fill="#FFFFFF" fillOpacity="0.28" />
          <circle cx="36.5" cy="30" r="4" fill="#FFFFFF" fillOpacity="0.28" />
          <line x1="31.5" y1="30" x2="32.5" y2="30" />
        </g>
      )}
      {/* Experimental Goggles on forehead for Tessa */}
      {avatarKey === 'tessa' && (
        <g>
          <rect x="21" y="18" width="22" height="6" rx="3" fill="#EC4899" stroke="#2D241E" strokeWidth="1.6" />
          <circle cx="27" cy="21" r="2.8" fill="#BAE6FD" stroke="#2D241E" strokeWidth="1.4" />
          <circle cx="37" cy="21" r="2.8" fill="#BAE6FD" stroke="#2D241E" strokeWidth="1.4" />
        </g>
      )}
      {/* Security Cap Visor for Jasper */}
      {avatarKey === 'jasper' && (
        <path
          d="M19 22 C24 18, 40 18, 45 22 L43 25 H21 Z"
          fill="#1E293B"
          stroke="#2D241E"
          strokeWidth="1.8"
        />
      )}
      {/* Mouth expression (nervous wave for Mina, confident grin otherwise) */}
      {avatarKey === 'mina' ? (
        <path d="M28.5 36 Q30.5 34.5 32 36 Q33.5 37.5 35.5 35.5" stroke="#2D241E" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M28.5 35.5 Q32 38 35.5 35.5" stroke="#2D241E" strokeWidth="1.9" strokeLinecap="round" />
      )}
    </svg>
  );
};
