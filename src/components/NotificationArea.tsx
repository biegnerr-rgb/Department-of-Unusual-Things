import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Eye,
  HelpCircle,
  PackagePlus,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { EVENT_CATEGORY_META } from '../data/eventsData';
import { EventCategory, GameNotification, NotificationChoice, Resources } from '../types/game';

interface NotificationAreaProps {
  notifications: GameNotification[];
  resources: Resources;
  eventCategoryHistory?: Record<EventCategory, number>;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
  onResolveChoice: (notifId: string, choice: NotificationChoice) => void;
  onDismissNotification: (notifId: string) => void;
  onTriggerDelivery: () => void;
  deliveryCooldownRemainingSec: number;
}

const CATEGORY_ORDER: EventCategory[] = ['positive', 'negative', 'neutral', 'rare', 'secret'];

function CategoryIcon({ category }: { category?: EventCategory }) {
  switch (category) {
    case 'positive':
      return <Sparkles className="w-4 h-4 text-[#166534]" />;
    case 'negative':
      return <AlertTriangle className="w-4 h-4 text-[#991B1B]" />;
    case 'neutral':
      return <HelpCircle className="w-4 h-4 text-[#92400E]" />;
    case 'rare':
      return <Star className="w-4 h-4 text-[#1E40AF]" />;
    case 'secret':
      return <Eye className="w-4 h-4 text-[#6B21A8]" />;
    default:
      return <PackagePlus className="w-4 h-4 text-[#B45309]" />;
  }
}

export const NotificationArea: React.FC<NotificationAreaProps> = ({
  notifications,
  resources,
  eventCategoryHistory,
  drawerOpen,
  onCloseDrawer,
  onResolveChoice,
  onDismissNotification,
  onTriggerDelivery,
  deliveryCooldownRemainingSec,
}) => {
  const [filterCat, setFilterCat] = useState<'all' | EventCategory>('all');

  const latestPending = !drawerOpen
    ? notifications.find((n) => !n.resolved)
    : undefined;

  const canPayChoice = (choice: NotificationChoice): boolean => {
    if ((choice.fundsDelta ?? 0) < 0 && resources.funds < Math.abs(choice.fundsDelta ?? 0)) {
      return false;
    }
    if ((choice.samplesDelta ?? 0) < 0 && (resources.samples ?? 0) < Math.abs(choice.samplesDelta ?? 0)) {
      return false;
    }
    return true;
  };

  const filteredNotifs =
    filterCat === 'all'
      ? notifications
      : notifications.filter((n) => n.category === filterCat);

  const pendingMeta = latestPending?.category
    ? EVENT_CATEGORY_META[latestPending.category]
    : null;

  return (
    <>
      {/* Floating compact banner for active deliveries & random events */}
      {latestPending && (
        <div
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-4 z-30 w-[calc(100%-20px)] max-w-sm border-2 border-[#2D241E] rounded-xl p-3.5 shadow-[0_4px_0_#2D241E] animate-modal-pop ${
            pendingMeta ? pendingMeta.cardTint : 'bg-[#FFFDF8]'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg border border-[#2D241E] flex items-center justify-center shrink-0 ${
                  pendingMeta ? pendingMeta.badgeBg : 'bg-[#FEF3C7]'
                }`}
              >
                <CategoryIcon category={latestPending.category} />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-[11px] font-bold leading-tight ${
                    pendingMeta ? pendingMeta.badgeText : 'text-[#8C6D46]'
                  }`}
                >
                  {pendingMeta ? pendingMeta.label : `${latestPending.kind} Alert`}
                </p>
                <h3 className="font-display text-sm font-bold text-[#26211C] truncate">
                  {latestPending.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismissNotification(latestPending.id)}
              aria-label="Dismiss alert"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md text-[#6B5E51] hover:bg-[#EFE6D5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2 text-xs text-[#4B4035] leading-relaxed">
            {latestPending.message}
          </p>

          {latestPending.choices && latestPending.choices.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {latestPending.choices.map((choice, idx) => {
                const payable = canPayChoice(choice);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!payable}
                    onClick={() => onResolveChoice(latestPending.id, choice)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#2D241E] transition-colors text-left active:scale-[0.98] ${
                      payable
                        ? latestPending.category === 'negative' && idx === 0
                          ? 'bg-[#B45309] hover:bg-[#92400E] text-white cursor-pointer'
                          : latestPending.category === 'secret'
                          ? 'bg-[#6B21A8] hover:bg-[#581C87] text-white cursor-pointer'
                          : 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer'
                        : 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
                    }`}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Full Slide-Over Event & Delivery Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[#26211C]/35"
          onClick={onCloseDrawer}
        >
          <div
            className="w-full max-w-md h-full bg-[#FAF5EB] border-l-2 border-[#2D241E] flex flex-col shadow-2xl animate-panel-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#FFFDF8] border-b-2 border-[#2D241E] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-[#B45309]" />
                <div>
                  <h2 className="font-display text-lg font-bold text-[#26211C]">
                    Events, Chaos & Deliveries
                  </h2>
                  <p className="text-xs text-[#6B5E51]">
                    Positive, Negative, Neutral, Rare & Secret department incidents
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseDrawer}
                aria-label="Close events drawer"
                className="w-9 h-9 rounded-lg border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Call Special Delivery button */}
            <div className="px-5 py-3 bg-[#FEF6E4] border-b border-[#D8CBB8] flex items-center justify-between gap-3">
              <div className="text-xs text-[#4B4035]">
                <p className="font-semibold text-[#26211C]">Request Pneumatic Delivery</p>
                <p>Ping courier dispatch for extra grants or crates</p>
              </div>
              <button
                type="button"
                disabled={deliveryCooldownRemainingSec > 0}
                onClick={onTriggerDelivery}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border-2 border-[#2D241E] whitespace-nowrap shrink-0 transition-colors ${
                  deliveryCooldownRemainingSec > 0
                    ? 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
                    : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#2D241E] cursor-pointer'
                }`}
              >
                {deliveryCooldownRemainingSec > 0
                  ? `Wait ${deliveryCooldownRemainingSec}s`
                  : 'Request Crate'}
              </button>
            </div>

            {/* Interactive Category Filter & Session Counts */}
            <div className="px-4 py-2.5 bg-[#FFFDF8] border-b border-[#D8CBB8] flex items-center gap-1.5 overflow-x-auto warm-scroll shrink-0">
              <button
                type="button"
                onClick={() => setFilterCat('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[#2D241E] whitespace-nowrap cursor-pointer transition-colors ${
                  filterCat === 'all'
                    ? 'bg-[#2D241E] text-white'
                    : 'bg-[#F4EFE4] text-[#4B4035] hover:bg-[#E7DDD0]'
                }`}
              >
                All ({notifications.length})
              </button>
              {CATEGORY_ORDER.map((cat) => {
                const meta = EVENT_CATEGORY_META[cat];
                const count = eventCategoryHistory?.[cat] ?? 0;
                const active = filterCat === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCat(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[#2D241E] whitespace-nowrap cursor-pointer transition-colors font-mono-num ${
                      active
                        ? `${meta.badgeBg} ${meta.badgeText} ring-1 ring-[#2D241E]`
                        : 'bg-[#FFFDF8] text-[#5A4D41] hover:bg-[#F3E9D8]'
                    }`}
                  >
                    {meta.shortLabel} ({count})
                  </button>
                );
              })}
            </div>

            {/* Event Log List */}
            <div className="flex-1 overflow-y-auto warm-scroll p-4 space-y-3">
              {filteredNotifs.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#6B5E51]">
                  No recorded events in this category yet.
                </div>
              ) : (
                filteredNotifs.map((notif) => {
                  const meta = notif.category ? EVENT_CATEGORY_META[notif.category] : null;
                  return (
                    <div
                      key={notif.id}
                      className={`rounded-xl border-2 border-[#2D241E] p-3.5 ${
                        notif.resolved
                          ? 'bg-[#F3EDE1]'
                          : meta
                          ? meta.cardTint
                          : 'bg-[#FFFDF8]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <span className={meta ? meta.badgeText : 'text-[#8C6D46]'}>
                              {meta ? meta.label : `${notif.kind}`}
                            </span>
                            <span aria-hidden="true" className="text-[#9E8F7E]">
                              ·
                            </span>
                            <span className="font-mono-num text-[#7A6B5C] font-medium">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <h3 className="font-display text-sm font-bold text-[#26211C] mt-0.5">
                            {notif.title}
                          </h3>
                        </div>
                        {notif.resolved && (
                          <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-[#4B4035] leading-relaxed">
                        {notif.message}
                      </p>

                      {!notif.resolved && notif.choices && notif.choices.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {notif.choices.map((choice, i) => {
                            const payable = canPayChoice(choice);
                            return (
                              <button
                                key={i}
                                type="button"
                                disabled={!payable}
                                onClick={() => onResolveChoice(notif.id, choice)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#2D241E] text-left transition-colors ${
                                  payable
                                    ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer'
                                    : 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
                                }`}
                              >
                                {choice.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {notif.resolved && notif.resolvedText && (
                        <p className="mt-2 text-xs font-semibold text-[#0F766E]">
                          {notif.resolvedText}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
