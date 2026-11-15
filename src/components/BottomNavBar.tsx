import React from 'react';
import {
  ArrowUpCircle,
  BookOpen,
  Building2,
  FlaskConical,
  Package,
  Users,
} from 'lucide-react';
import { NavTab } from '../types/game';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  badges: Partial<Record<NavTab, number>>;
  visibleTabs?: NavTab[];
  highlightTab?: NavTab | null;
}

const NAV_ITEMS: Array<{
  id: NavTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'department', label: 'Department', shortLabel: 'Dept.', icon: Building2 },
  { id: 'objects', label: 'Objects', shortLabel: 'Objects', icon: Package },
  { id: 'employees', label: 'Employees', shortLabel: 'Staff', icon: Users },
  { id: 'research', label: 'Research', shortLabel: 'Lab', icon: FlaskConical },
  { id: 'upgrades', label: 'Upgrades', shortLabel: 'Upgrades', icon: ArrowUpCircle },
  { id: 'discoveries', label: 'Discoveries', shortLabel: 'Archives', icon: BookOpen },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  badges,
  visibleTabs,
  highlightTab,
}) => {
  const items = visibleTabs
    ? NAV_ITEMS.filter((item) => visibleTabs.includes(item.id))
    : NAV_ITEMS;

  if (items.length <= 1) {
    return null;
  }

  const gridColsClass =
    items.length === 2
      ? 'grid-cols-2'
      : items.length === 3
      ? 'grid-cols-3'
      : items.length === 4
      ? 'grid-cols-4'
      : items.length === 5
      ? 'grid-cols-5'
      : 'grid-cols-6';

  return (
    <nav
      aria-label="Department navigation"
      className="w-full bg-[#FFFDF8] border-t-2 border-[#2D241E] px-1.5 sm:px-4 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] z-30 shrink-0"
    >
      <div className={`max-w-5xl mx-auto grid ${gridColsClass} gap-1 sm:gap-2`}>
        {items.map(({ id, label, shortLabel, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = badges[id] ?? 0;
          const isHighlighted = highlightTab === id && !isActive;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`relative min-h-[46px] px-1 sm:px-3 py-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 text-[10px] sm:text-xs font-semibold transition-all cursor-pointer border-2 active:scale-[0.97] whitespace-nowrap ${
                isActive
                  ? 'bg-[#0D9488] text-white border-[#2D241E] shadow-[0_2px_0_#2D241E]'
                  : isHighlighted
                  ? 'bg-[#FEF6E4] text-[#26211C] border-[#F59E0B] ring-2 ring-[#F59E0B]/60'
                  : 'bg-transparent text-[#4B4035] border-transparent hover:bg-[#F3E9D8] hover:text-[#26211C]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="sm:hidden leading-tight whitespace-nowrap">{shortLabel}</span>
              <span className="hidden sm:inline truncate max-w-full">{label}</span>
              {badge > 0 && (
                <span
                  className={`absolute top-0.5 right-0.5 sm:static px-1 sm:px-1.5 py-0.5 rounded font-mono-num text-[9px] sm:text-[10px] font-bold leading-none ${
                    isActive
                      ? 'bg-[#F59E0B] text-[#2D241E]'
                      : 'bg-[#D97706] text-white'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

