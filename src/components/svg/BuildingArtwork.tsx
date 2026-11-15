import React from 'react';
import { Employee, RoomDefinition, RoomId, RoomRuntimeState, UnusualObject } from '../../types/game';
import { ObjectIcon } from './ObjectIcon';

interface RoomInteriorProps {
  def: RoomDefinition;
  runtime: RoomRuntimeState;
  assignedEmployees: Employee[];
  assignedObjects: UnusualObject[];
  reflectedIconKey?: string;
  onQuickPropClick?: (e: React.MouseEvent, roomId: RoomId) => void;
}

const MiniWorker: React.FC<{ emp: Employee; xOffset: number }> = ({ emp, xOffset }) => {
  const recentlyActed = emp.lastActionAt > 0 && Date.now() - emp.lastActionAt < 2600;

  const renderRoleProp = () => {
    switch (emp.role) {
      case 'Research Scientist':
        return (
          <g>
            <path d="M27 32 H31 L33 39 H25 Z" fill="#5EEAD4" stroke="#2D241E" strokeWidth="1.5" />
            <rect x="28" y="29" width="2" height="3" fill="#2D241E" />
          </g>
        );
      case 'Engineer':
        return (
          <path
            d="M27 29 L33 37 M31 28 L34 31"
            stroke="#64748B"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        );
      case 'Archivist':
        return (
          <rect x="25" y="30" width="8" height="9" rx="1.2" fill="#4338CA" stroke="#2D241E" strokeWidth="1.5" />
        );
      case 'Security Officer':
        return (
          <circle cx="29" cy="34" r="4" fill="#F59E0B" stroke="#2D241E" strokeWidth="1.5" />
        );
      case 'Experimental Technician':
        return (
          <g>
            <line x1="27" y1="39" x2="31" y2="29" stroke="#2D241E" strokeWidth="1.8" />
            <circle cx="31.5" cy="28.5" r="2.6" fill="#F472B6" stroke="#2D241E" strokeWidth="1.3" />
          </g>
        );
      case 'Department Manager':
        return (
          <rect x="25" y="32" width="9" height="7" rx="1.5" fill="#78350F" stroke="#2D241E" strokeWidth="1.5" />
        );
      default:
        return (
          <g>
            <rect x="25" y="30" width="8" height="10" rx="1.5" fill="#D97706" stroke="#2D241E" strokeWidth="1.6" />
            <rect x="26.5" y="32" width="5" height="6" fill="#FFFBEB" />
          </g>
        );
    }
  };

  return (
    <div
      className="absolute bottom-4 z-20 flex flex-col items-center pointer-events-none animate-bob-worker"
      style={{ left: `${xOffset}%`, transform: 'translateX(-50%)' }}
    >
      {recentlyActed && (
        <span className="mb-0.5 px-1.5 py-0.5 rounded bg-[#0D9488] border border-[#2D241E] text-white text-[8px] font-bold leading-none shadow-sm animate-float-up">
          +XP
        </span>
      )}
      <svg viewBox="0 0 40 56" className="w-8 h-11 drop-shadow-sm animate-patrol-x" fill="none">
        <ellipse cx="20" cy="53" rx="10" ry="2.6" fill="#2D241E" fillOpacity="0.22" />
        <line x1="16" y1="42" x2="16" y2="51" stroke="#334155" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="24" y1="42" x2="24" y2="51" stroke="#334155" strokeWidth="3.2" strokeLinecap="round" />
        <path
          d="M11 26 C11 22, 29 22, 29 26 L31 43 H9 Z"
          fill={emp.coatColor}
          stroke="#2D241E"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {renderRoleProp()}
        <circle cx="20" cy="14" r="8.5" fill={emp.skinColor} stroke="#2D241E" strokeWidth="2.2" />
        <path
          d="M11.5 13 C12 5, 28 5, 28.5 13 C25 9.5, 15 9.5, 11.5 13 Z"
          fill={emp.hairColor}
          stroke="#2D241E"
          strokeWidth="2"
        />
        <circle cx="17.5" cy="15" r="1.2" fill="#2D241E" />
        <circle cx="23" cy="15" r="1.2" fill="#2D241E" />
        <path d="M18 18.5 Q20 20 22.5 18.5" stroke="#2D241E" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="mt-[-3px] px-1.5 py-0.5 rounded bg-[#26211C]/80 text-[#FFFDF8] text-[9px] font-medium leading-none whitespace-nowrap">
        {emp.name.split(' ')[0]} · Lv.{emp.level}
      </span>
    </div>
  );
};

export const RoomInteriorScene: React.FC<RoomInteriorProps> = ({
  def,
  runtime,
  assignedEmployees,
  assignedObjects,
  reflectedIconKey,
  onQuickPropClick,
}) => {
  const lv = runtime.level;
  const eq = runtime.equipmentLevel ?? 1;

  const renderFurniture = () => {
    switch (def.id) {
      case 'reception':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#E6D2B1" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#DEC8A4" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#8D6540" strokeWidth="1.5" />
            {/* Warm lighting cone (brighter at higher levels) */}
            <polygon
              points="118,16 162,16 202,120 78,120"
              fill="#FDE68A"
              fillOpacity={lv >= 3 ? 0.42 : 0.28}
              className="animate-pulse-lamp"
            />
            {/* Department Crest */}
            <rect x="44" y="32" width="48" height="34" rx="2" fill="#FFFDF8" stroke="#5A4634" strokeWidth="2.4" />
            <circle cx="68" cy="46" r="7" fill="#0D9488" />
            <line x1="52" y1="58" x2="84" y2="58" stroke="#5A4634" strokeWidth="2" />
            {/* Lv.2+ Status Clock & Dispatch Board */}
            {lv >= 2 && (
              <g>
                <circle cx="106" cy="42" r="10" fill="#FFFBEB" stroke="#2D241E" strokeWidth="2" />
                <line x1="106" y1="42" x2="106" y2="36" stroke="#2D241E" strokeWidth="1.8" />
                <line x1="106" y1="42" x2="111" y2="44" stroke="#D97706" strokeWidth="1.8" />
              </g>
            )}
            {/* Pneumatic tube chute */}
            <rect x="220" y="14" width="16" height="68" fill="#D97706" stroke="#2D241E" strokeWidth="2.2" />
            <ellipse cx="228" cy="82" rx="10" ry="4" fill="#92400E" stroke="#2D241E" strokeWidth="2" />
            <rect x="222" y="42" width="12" height="16" rx="4" fill="#FEF3C7" stroke="#2D241E" strokeWidth="1.8" />
            {/* Eq.2+ Twin Express Pneumatic Chute */}
            {eq >= 2 && (
              <g>
                <rect x="198" y="14" width="14" height="60" fill="#B45309" stroke="#2D241E" strokeWidth="2" />
                <ellipse cx="205" cy="74" rx="9" ry="3.5" fill="#78350F" stroke="#2D241E" strokeWidth="1.8" />
              </g>
            )}
            {/* Potted Fern */}
            <polygon points="35,98 51,98 48,118 38,118" fill="#C2410C" stroke="#2D241E" strokeWidth="2" />
            <path d="M43 98 Q32 82 37 74 M43 98 Q43 76 47 71 M43 98 Q55 83 51 75" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
            {/* Reception Desk */}
            <polygon points="86,82 194,82 202,90 78,90" fill="#9A5B25" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="78" y="90" width="124" height="32" rx="2" fill="#B46A2C" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="92" y="97" width="96" height="18" rx="1.5" fill={lv >= 4 ? '#D97706' : '#8C4F1E'} />
            {/* Rotary Phone */}
            <rect x="96" y="74" width="18" height="9" rx="2" fill="#DC2626" stroke="#2D241E" strokeWidth="1.8" />
            <path d="M94 74 Q105 68 116 74" stroke="#2D241E" strokeWidth="3" strokeLinecap="round" />
            {/* Overhead Lamp */}
            <line x1="140" y1="0" x2="140" y2="14" stroke="#2D241E" strokeWidth="2" />
            <path d="M124 18 C126 11, 154 11, 156 18 Z" fill={lv >= 3 ? '#FBBF24' : '#F59E0B'} stroke="#2D241E" strokeWidth="2" />
            {lv >= 3 && (
              <rect x="132" y="30" width="52" height="16" rx="3" fill="#26211C" stroke="#F59E0B" strokeWidth="1.5" />
            )}
          </svg>
        );

      case 'investigation':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#CFE2DA" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#C4DBD2" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#6E8B80" strokeWidth="1.5" />
            <polygon points="116,16 164,16 208,120 72,120" fill="#FEF3C7" fillOpacity={lv >= 3 ? 0.45 : 0.32} className="animate-pulse-lamp" />
            {/* Evidence Pinboard */}
            <rect x="30" y="26" width="68" height="44" rx="3" fill="#D9A066" stroke="#2D241E" strokeWidth="2.3" />
            <rect x="38" y="32" width="18" height="14" fill="#FFFDF8" stroke="#2D241E" strokeWidth="1.4" />
            <rect x="66" y="40" width="22" height="16" fill="#FEF08A" stroke="#2D241E" strokeWidth="1.4" />
            <line x1="47" y1="38" x2="76" y2="46" stroke="#DC2626" strokeWidth="1.5" />
            <circle cx="47" cy="38" r="2" fill="#DC2626" />
            <circle cx="76" cy="46" r="2" fill="#DC2626" />
            {/* Reel-to-reel recorder */}
            <rect x="206" y="38" width="44" height="78" rx="3" fill="#475569" stroke="#2D241E" strokeWidth="2.2" />
            <g className="animate-spin-slow">
              <circle cx="220" cy="56" r="7" fill="#E2E8F0" stroke="#2D241E" strokeWidth="1.8" />
              <line x1="220" y1="50" x2="220" y2="62" stroke="#475569" strokeWidth="1.4" />
              <line x1="214" y1="56" x2="226" y2="56" stroke="#475569" strokeWidth="1.4" />
            </g>
            <g className="animate-spin-reverse-slow">
              <circle cx="236" cy="56" r="7" fill="#E2E8F0" stroke="#2D241E" strokeWidth="1.8" />
              <line x1="236" y1="50" x2="236" y2="62" stroke="#475569" strokeWidth="1.4" />
              <line x1="230" y1="56" x2="242" y2="56" stroke="#475569" strokeWidth="1.4" />
            </g>
            <rect x="214" y="72" width="28" height="10" fill={eq >= 2 ? '#2DD4BF' : '#0F766E'} stroke="#2D241E" strokeWidth="1.5" className="animate-pulse-lamp" />
            {/* Lv.2+ Caliper & Telemetry Rack */}
            {lv >= 2 && (
              <rect x="108" y="28" width="64" height="24" rx="3" fill="#1E293B" stroke="#2D241E" strokeWidth="2" />
            )}
            {lv >= 2 && (
              <path d="M114 40 Q124 31 134 40 T154 40 T166 40" stroke="#2DD4BF" strokeWidth="2" fill="none" />
            )}
            {/* Wide Investigation Steel Bench */}
            <polygon points="74,90 206,90 214,98 66,98" fill="#CBD5E1" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="74" y="98" width="10" height="24" fill="#64748B" stroke="#2D241E" strokeWidth="2" />
            <rect x="196" y="98" width="10" height="24" fill="#64748B" stroke="#2D241E" strokeWidth="2" />
            {/* Articulated Magnifier Arm */}
            <path d="M192 90 L204 66 L176 56" stroke="#2D241E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="173" cy="56" r="7" fill="#99F6E4" stroke="#2D241E" strokeWidth="2" />
            {eq >= 3 && (
              <path d="M88 90 L76 66 L104 56" stroke="#2D241E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {eq >= 3 && (
              <circle cx="107" cy="56" r="6" fill="#FDE68A" stroke="#2D241E" strokeWidth="2" />
            )}
            <line x1="140" y1="0" x2="140" y2="14" stroke="#2D241E" strokeWidth="2" />
            <path d="M126 18 C128 11, 152 11, 154 18 Z" fill="#0D9488" stroke="#2D241E" strokeWidth="2" />
          </svg>
        );

      case 'research_desk':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#CFD9E8" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#C4D0E3" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#6E82A0" strokeWidth="1.5" />
            {/* Tall Specimen Bookcase */}
            <rect x="26" y="28" width="50" height="86" rx="2" fill="#8B5A2B" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="32" y="34" width="38" height="20" fill="#5A3A1B" />
            <rect x="34" y="38" width="7" height="15" fill="#DC2626" />
            <rect x="42" y="36" width="8" height="17" fill="#0D9488" />
            <rect x="51" y="39" width="7" height="14" fill="#F59E0B" />
            <rect x="32" y="62" width="38" height="20" fill="#5A3A1B" />
            <circle cx="44" cy="73" r="6" fill="#5EEAD4" stroke="#2D241E" strokeWidth="1.5" />
            <rect x="55" y="67" width="11" height="14" rx="2" fill="#FEF08A" stroke="#2D241E" strokeWidth="1.5" />
            {/* Lv.2+ Illuminated Wall Chalkboard */}
            {lv >= 2 && (
              <g>
                <rect x="188" y="28" width="64" height="40" rx="2" fill="#064E3B" stroke="#8B5A2B" strokeWidth="2.5" />
                <path d="M196 42 H228 M196 50 H242 M200 58 Q216 52 232 58" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}
            {/* Lab Workbench */}
            <polygon points="88,88 242,88 250,96 80,96" fill="#C28852" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="86" y="96" width="152" height="24" fill="#9A6638" stroke="#2D241E" strokeWidth="2.2" />
            {/* Oscilloscope */}
            <rect x="200" y="56" width="44" height="32" rx="4" fill="#334155" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="205" y="61" width="26" height="22" rx="2" fill="#064E3B" stroke="#2D241E" strokeWidth="1.5" />
            <path d="M207 72 Q213 64 218 72 T229 72" stroke="#34D399" strokeWidth="2" fill="none" className="animate-pulse-lamp" />
            <circle cx="237" cy="67" r="2.3" fill="#F59E0B" className="animate-pulse-lamp" />
            <circle cx="237" cy="76" r="2.3" fill="#38BDF8" />
            {/* Eq.2+ Copper Resonance Coil */}
            {eq >= 2 && (
              <g>
                <rect x="88" y="64" width="14" height="24" rx="3" fill="#D97706" stroke="#2D241E" strokeWidth="1.8" />
                <circle cx="95" cy="58" r="6" fill="#60A5FA" stroke="#2D241E" strokeWidth="1.8" className="animate-pulse-lamp" />
              </g>
            )}
            <line x1="150" y1="0" x2="150" y2="14" stroke="#2D241E" strokeWidth="2" />
            <path d="M136 18 C138 11, 162 11, 164 18 Z" fill="#2563EB" stroke="#2D241E" strokeWidth="2" />
          </svg>
        );

      case 'containment':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#C4DCD8" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#B9D5D0" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#4C6F6B" strokeWidth="1.5" />
            <rect x="18" y="110" width="244" height="8" fill="#F59E0B" stroke="#2D241E" strokeWidth="1.5" />
            {/* Brass containment piping */}
            <path d="M24 38 H86 V110" stroke="#D97706" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 38 H86 V110" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {lv >= 3 && (
              <path d="M256 38 H194 V110" stroke="#0D9488" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {/* Wide Glass Containment Canopy */}
            <rect x="74" y="24" width="132" height="88" rx="8" fill="#5EEAD4" fillOpacity={eq >= 2 ? 0.4 : 0.28} stroke="#2D241E" strokeWidth="2.5" />
            <rect x="68" y="20" width="144" height="12" rx="4" fill="#475569" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="68" y="102" width="144" height="14" rx="4" fill="#475569" stroke="#2D241E" strokeWidth="2.2" />
            {lv >= 2 && (
              <rect x="86" y="34" width="108" height="4" rx="2" fill="#2DD4BF" fillOpacity="0.65" className="animate-pulse-lamp" />
            )}
            <circle cx="114" cy="76" r="3" fill="#99F6E4" className="animate-bubble-rise" />
            <circle cx="165" cy="64" r="2.2" fill="#FFFFFF" className="animate-bubble-rise" />
            {/* Pressure Telemetry Cabinet */}
            <rect x="214" y="42" width="40" height="68" rx="4" fill="#334155" stroke="#2D241E" strokeWidth="2.2" />
            <circle cx="226" cy="58" r="6" fill="#FFFBEB" stroke="#2D241E" strokeWidth="1.8" />
            <line x1="226" y1="58" x2="230" y2="54" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            <circle cx="242" cy="58" r="6" fill="#FFFBEB" stroke="#2D241E" strokeWidth="1.8" />
            <line x1="242" y1="58" x2="245" y2="62" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <rect x="220" y="76" width="28" height="10" rx="2" fill="#10B981" stroke="#2D241E" strokeWidth="1.5" />
          </svg>
        );

      case 'archive_vault':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#E2D3BE" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#D8C7AF" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#7A624B" strokeWidth="1.5" />
            {/* Left Catalog Cabinets */}
            <rect x="26" y="28" width="54" height="88" rx="2" fill="#78350F" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="32" y="34" width="18" height="12" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.4" />
            <rect x="54" y="34" width="18" height="12" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.4" />
            <rect x="32" y="52" width="18" height="12" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.4" />
            <rect x="54" y="52" width="18" height="12" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.4" />
            <rect x="32" y="70" width="18" height="12" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.4" />
            <rect x="54" y="70" width="18" height="12" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.4" />
            {/* Right Archival Shelving */}
            <rect x="206" y="30" width="48" height="86" rx="2" fill="#92400E" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="212" y="38" width="36" height="14" fill="#FFFBEB" stroke="#2D241E" strokeWidth="1.5" />
            <rect x="212" y="58" width="36" height="14" fill="#FEF3C7" stroke="#2D241E" strokeWidth="1.5" />
            {lv >= 2 && (
              <line x1="86" y1="24" x2="86" y2="116" stroke="#D97706" strokeWidth="3" />
            )}
            {/* Center Display Pedestal Bench */}
            <polygon points="88,92 194,92 200,100 82,100" fill="#B45309" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="84" y="100" width="114" height="20" fill="#78350F" stroke="#2D241E" strokeWidth="2.2" />
            {eq >= 2 && (
              <circle cx="140" cy="40" r="11" fill="#FDE68A" fillOpacity="0.55" stroke="#B45309" strokeWidth="2" />
            )}
          </svg>
        );

      case 'anomaly_workshop':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#E8D4C5" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#DFC8B6" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#8B6347" strokeWidth="1.5" />
            {/* Tool Pegboard */}
            <rect x="34" y="28" width="76" height="46" rx="3" fill="#475569" stroke="#2D241E" strokeWidth="2.2" />
            <g className="animate-spin-reverse-slow">
              <circle cx="52" cy="48" r="10" fill="#F59E0B" stroke="#2D241E" strokeWidth="2" />
              <line x1="44" y1="48" x2="60" y2="48" stroke="#2D241E" strokeWidth="1.6" />
              <line x1="52" y1="40" x2="52" y2="56" stroke="#2D241E" strokeWidth="1.6" />
              <circle cx="52" cy="48" r="4" fill="#475569" stroke="#2D241E" strokeWidth="1.6" />
            </g>
            <rect x="74" y="38" width="6" height="24" rx="2" fill="#CBD5E1" stroke="#2D241E" strokeWidth="1.6" />
            <rect x="88" y="38" width="6" height="24" rx="2" fill="#EA580C" stroke="#2D241E" strokeWidth="1.6" />
            {/* Heavy Brass Lathe & Copper Coil */}
            <polygon points="82,88 198,88 206,96 74,96" fill="#9A5B25" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="78" y="96" width="124" height="24" fill="#7C4418" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="116" y="64" width="46" height="24" rx="3" fill="#EA580C" stroke="#2D241E" strokeWidth="2.2" />
            <circle cx="139" cy="76" r="7" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.8" className="animate-pulse-lamp" />
            {/* Large Brass Flywheel */}
            <g className="animate-spin-slow">
              <circle cx="222" cy="74" r="22" fill="#D97706" stroke="#2D241E" strokeWidth="2.4" />
              <line x1="202" y1="74" x2="242" y2="74" stroke="#2D241E" strokeWidth="2.2" />
              <line x1="222" y1="54" x2="222" y2="94" stroke="#2D241E" strokeWidth="2.2" />
              <circle cx="222" cy="74" r="9" fill="#FEF3C7" stroke="#2D241E" strokeWidth="2" />
            </g>
            {lv >= 2 && (
              <path d="M18 32 H198 V64" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
            )}
            {eq >= 2 && (
              <circle cx="139" cy="40" r="8" fill="#FB923C" fillOpacity="0.6" className="animate-pulse-lamp" />
            )}
          </svg>
        );

      case 'break_lounge':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#E6D2D9" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#DEC8CF" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#8B6372" strokeWidth="1.5" />
            {/* Experimental Observation Console */}
            <rect x="28" y="54" width="44" height="62" rx="4" fill="#4C1D95" stroke="#2D241E" strokeWidth="2.2" />
            <rect x="34" y="62" width="32" height="16" rx="2" fill="#F472B6" stroke="#2D241E" strokeWidth="1.6" />
            {/* Hybrid Testing Ring Canopy */}
            <ellipse cx="144" cy="108" rx="64" ry="9" fill="#BE185D" stroke="#2D241E" strokeWidth="2.2" />
            <ellipse cx="144" cy="36" rx="54" ry="8" fill="#F472B6" fillOpacity={lv >= 2 ? 0.6 : 0.35} stroke="#2D241E" strokeWidth="2" />
            <line x1="90" y1="36" x2="82" y2="108" stroke="#2D241E" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="198" y1="36" x2="206" y2="108" stroke="#2D241E" strokeWidth="2" strokeDasharray="4 3" />
            {/* Espresso & Calibrator Stand */}
            <rect x="218" y="64" width="34" height="52" rx="4" fill="#9A5B25" stroke="#2D241E" strokeWidth="2.2" />
            <circle cx="235" cy="78" r="6" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.8" />
            {eq >= 2 && (
              <circle cx="144" cy="36" r="14" fill="#FDE68A" fillOpacity="0.45" className="animate-pulse-lamp" />
            )}
          </svg>
        );

      case 'temporal_lab':
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#D2D5EB" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#C6CAE5" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#5F6794" strokeWidth="1.5" />
            {/* Armored Vault Door Ring */}
            <circle cx="48" cy="72" r="26" fill="#475569" stroke="#2D241E" strokeWidth="2.4" />
            <circle cx="48" cy="72" r="14" fill="#CBD5E1" stroke="#2D241E" strokeWidth="2" />
            <line x1="36" y1="72" x2="60" y2="72" stroke="#2D241E" strokeWidth="2.5" />
            <line x1="48" y1="60" x2="48" y2="84" stroke="#2D241E" strokeWidth="2.5" />
            {/* Deep Storage Dampening Grid */}
            <rect x="82" y="24" width="124" height="88" rx="6" fill="#818CF8" fillOpacity={lv >= 2 ? 0.34 : 0.2} stroke="#312E81" strokeWidth="2.4" />
            <rect x="76" y="102" width="136" height="14" rx="3" fill="#312E81" stroke="#2D241E" strokeWidth="2.2" />
            {/* Safety Beacon & Coils */}
            <rect x="218" y="40" width="34" height="74" rx="4" fill="#334155" stroke="#2D241E" strokeWidth="2.2" />
            <circle cx="235" cy="54" r="6" fill="#F59E0B" stroke="#2D241E" strokeWidth="1.8" className="animate-pulse-lamp" />
            <rect x="225" y="70" width="20" height="8" fill="#6366F1" stroke="#2D241E" strokeWidth="1.4" />
            {eq >= 2 && (
              <line x1="82" y1="54" x2="206" y2="54" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="5 3" />
            )}
          </svg>
        );

      case 'quantum_pantry':
      default:
        return (
          <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <polygon points="0,0 18,14 18,118 0,148" fill="#C2E0D6" />
            <polygon points="280,0 262,14 262,118 280,148" fill="#B5D8CC" />
            <rect x="18" y="14" width="244" height="104" fill={def.wallColor} />
            <polygon points="18,118 262,118 280,148 0,148" fill={def.floorColor} stroke="#477364" strokeWidth="1.5" />
            {/* Reality Division Paradox Halo */}
            <ellipse cx="140" cy="68" rx="68" ry="38" stroke="#047857" strokeWidth="3" strokeDasharray="6 4" className="animate-spin-slow" />
            <ellipse cx="140" cy="68" rx="54" ry="28" fill="#5EEAD4" fillOpacity={lv >= 2 ? 0.34 : 0.2} stroke="#0D9488" strokeWidth="2" className="animate-pulse-lamp" />
            {/* Reality Pedestal Deck */}
            <polygon points="78,98 202,98 210,112 70,112" fill="#065F46" stroke="#2D241E" strokeWidth="2.2" />
            {/* Stabilizer Pylons */}
            <rect x="30" y="34" width="22" height="82" rx="4" fill="#334155" stroke="#2D241E" strokeWidth="2.2" />
            <circle cx="41" cy="44" r="6" fill="#2DD4BF" stroke="#2D241E" strokeWidth="1.8" className="animate-pulse-lamp" />
            <rect x="228" y="34" width="22" height="82" rx="4" fill="#334155" stroke="#2D241E" strokeWidth="2.2" />
            <circle cx="239" cy="44" r="6" fill="#FBBF24" stroke="#2D241E" strokeWidth="1.8" className="animate-pulse-lamp" />
            {eq >= 2 && (
              <polygon points="140,20 148,32 140,44 132,32" fill="#FDE68A" stroke="#2D241E" strokeWidth="1.8" className="animate-float-gentle" />
            )}
          </svg>
        );
    }
  };

  // Spread assigned objects cleanly across the room pedestals
  const getObjectOffsetPct = (idx: number, total: number) => {
    if (total <= 1) return 50;
    if (total === 2) return idx === 0 ? 39 : 61;
    return idx === 0 ? 33 : idx === 1 ? 50 : 67;
  };

  // Spread workers cleanly across floor
  const getWorkerOffsetPct = (idx: number, total: number) => {
    if (total === 1) return 21;
    if (total === 2) return idx === 0 ? 18 : 80;
    return idx === 0 ? 16 : idx === 1 ? 50 : 83;
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {renderFurniture()}

      {/* Assigned unusual objects rendered alive on room pedestals */}
      {assignedObjects.map((obj, idx) => (
        <button
          key={obj.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickPropClick?.(e, def.id);
          }}
          title={`Interact with ${obj.name} (${obj.rarity})`}
          style={{ left: `${getObjectOffsetPct(idx, assignedObjects.length)}%` }}
          className="absolute bottom-8 -translate-x-1/2 z-10 group/obj focus:outline-none cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <div className="transition-transform duration-150 group-hover/obj:scale-115 active:scale-95">
            <ObjectIcon
              iconKey={obj.iconKey}
              idleAnimation={obj.idleAnimation}
              reflectedIconKey={reflectedIconKey}
              className={`${assignedObjects.length > 1 ? 'w-10 h-10' : 'w-12 h-12'} drop-shadow-md`}
            />
          </div>
        </button>
      ))}

      {/* Interactive brass desk bell in reception when bonus ready */}
      {def.id === 'reception' && runtime.bonusReady && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickPropClick?.(e, def.id);
          }}
          title="Ring Reception Bell to collect stipend"
          className="absolute left-[46%] bottom-[48px] z-20 min-w-[40px] min-h-[34px] px-2.5 py-1 rounded-full bg-amber-400 border-2 border-[#2D241E] text-[#26211C] text-[11px] font-bold shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer animate-float-gentle"
        >
          +$
        </button>
      )}

      {assignedEmployees.map((emp, idx) => (
        <MiniWorker
          key={emp.id}
          emp={emp}
          xOffset={getWorkerOffsetPct(idx, assignedEmployees.length)}
        />
      ))}
    </div>
  );
};
