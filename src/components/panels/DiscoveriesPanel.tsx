import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileText,
  FolderLock,
  KeyRound,
  Lock,
  MessageSquare,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  EMPLOYEE_CONVERSATIONS,
  evaluateClassifiedProjectEligibility,
} from '../../data/storyData';
import { GameState } from '../../types/game';
import { formatCompact } from '../../utils/simulation';

export type DiscoveriesSubTab = 'milestones' | 'classified' | 'archives';

interface DiscoveriesPanelProps {
  gameState: GameState;
  initialSubTab?: DiscoveriesSubTab;
  onClaimDiscovery: (discoveryId: string) => void;
  onCompleteClassifiedProject: (projectId: string) => void;
  onTriggerSecretRoomAction: (secretRoomId: string) => void;
  onListenPneumaticTube: () => void;
}

export const DiscoveriesPanel: React.FC<DiscoveriesPanelProps> = ({
  gameState,
  initialSubTab = 'milestones',
  onClaimDiscovery,
  onCompleteClassifiedProject,
  onTriggerSecretRoomAction,
  onListenPneumaticTube,
}) => {
  const [subTab, setSubTab] = useState<DiscoveriesSubTab>(initialSubTab);
  const [expandedDocId, setExpandedDocId] = useState<string>('doc_charter_1974');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const unlockedCount = gameState.discoveries.filter((d) => d.unlocked).length;
  const claimableCount = gameState.discoveries.filter((d) => d.unlocked && !d.claimed).length;

  const classifiedProjects = gameState.classifiedProjects ?? [];
  const completedClassifiedCount = classifiedProjects.filter((p) => p.completed).length;
  const readyClassifiedCount = classifiedProjects.filter(
    (p) => evaluateClassifiedProjectEligibility(p, gameState).canLaunch
  ).length;

  const archivedDocs = gameState.archivedDocuments ?? [];
  const unlockedDocsCount = archivedDocs.filter((d) => d.unlocked).length;
  const secretRooms = gameState.secretRooms ?? [];
  const unlockedSecretRoomsCount = secretRooms.filter((sr) => sr.discovered).length;
  const unlockedConvSet = new Set(gameState.unlockedConversations ?? ['conv_toaster_weather']);
  const strangeMessages = gameState.strangeMessages ?? [];

  const lastMessageTime = strangeMessages[0]?.timestamp ?? 0;
  const tubeCooldownRemaining = Math.max(
    0,
    40 - Math.floor((nowMs - lastMessageTime) / 1000)
  );

  return (
    <div className="w-full h-full overflow-y-auto warm-scroll bg-[#F4EFE4] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header & Section Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#26211C]">
              Discoveries, Classified Projects & Dept. 404 Archives
            </h2>
            <p className="text-sm text-[#5A4D41]">
              Document agency milestones or peel back the strange history of Bureau Section 404 at your own pace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#E7DFD0] border-2 border-[#2D241E] shrink-0">
            <button
              type="button"
              onClick={() => setSubTab('milestones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'milestones'
                  ? 'bg-[#FFFDF8] text-[#26211C] shadow-sm'
                  : 'text-[#5A4D41] hover:text-[#26211C]'
              }`}
            >
              Milestones {claimableCount > 0 ? `(${claimableCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setSubTab('classified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'classified'
                  ? 'bg-[#4F46E5] text-white shadow-sm'
                  : 'text-[#5A4D41] hover:text-[#26211C]'
              }`}
            >
              Classified ({completedClassifiedCount}/{classifiedProjects.length})
              {readyClassifiedCount > 0 ? ' · Ready!' : ''}
            </button>
            <button
              type="button"
              onClick={() => setSubTab('archives')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'archives'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-[#5A4D41] hover:text-[#26211C]'
              }`}
            >
              Dept. 404 Archives ({unlockedDocsCount}/{archivedDocs.length})
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
            <p className="text-[11px] font-semibold text-[#7A6B5C]">Lifetime Funds</p>
            <p className="font-mono-num text-base font-extrabold text-[#26211C] mt-0.5">
              ${formatCompact(gameState.totalFundsEarned)}
            </p>
          </div>
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
            <p className="text-[11px] font-semibold text-[#7A6B5C]">Lifetime Research</p>
            <p className="font-mono-num text-base font-extrabold text-[#0F766E] mt-0.5">
              {formatCompact(gameState.totalResearchEarned)} RP
            </p>
          </div>
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
            <p className="text-[11px] font-semibold text-[#7A6B5C]">Objects Studied</p>
            <p className="font-mono-num text-base font-extrabold text-[#26211C] mt-0.5">
              {gameState.objects.filter((o) => o.investigated).length}/{gameState.objects.length}
            </p>
          </div>
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
            <p className="text-[11px] font-semibold text-[#7A6B5C]">Dept. 404 Secrets</p>
            <p className="font-mono-num text-base font-extrabold text-[#4338CA] mt-0.5">
              {completedClassifiedCount}/5 Cases · {unlockedSecretRoomsCount}/2 Sub-Levels
            </p>
          </div>
        </div>

        {/* SUB-TAB 1: MILESTONES */}
        {subTab === 'milestones' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#26211C]">
                Department Milestones ({unlockedCount}/{gameState.discoveries.length} Recorded)
              </h3>
            </div>
            {gameState.discoveries.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-2xl border-2 border-[#2D241E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  entry.unlocked
                    ? 'bg-[#FFFDF8] shadow-[0_3px_0_#2D241E]'
                    : 'bg-[#EAE2D3] opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border-2 border-[#2D241E] flex items-center justify-center shrink-0 ${
                      entry.unlocked
                        ? 'bg-[#FEF3C7] text-[#B45309]'
                        : 'bg-[#D8CBB8] text-[#6B5E51]'
                    }`}
                  >
                    {entry.claimed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />
                    ) : entry.unlocked ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#7A6B5C] capitalize">
                      <span>{entry.category}</span>
                      <span>·</span>
                      <span>
                        Reward: +${entry.rewardFunds} / +{entry.rewardResearch} RP / +
                        {entry.rewardReputation} Rep
                      </span>
                    </div>
                    <h3 className="font-display text-base font-extrabold text-[#26211C] mt-0.5">
                      {entry.title}
                    </h3>
                    <p className="text-xs text-[#4B4035] mt-1">{entry.description}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {entry.claimed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5EFEA] border border-[#0F766E]/40 text-xs font-bold text-[#0F766E]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Claimed</span>
                    </span>
                  ) : entry.unlocked ? (
                    <button
                      type="button"
                      onClick={() => onClaimDiscovery(entry.id)}
                      className="px-4 py-2 rounded-xl border-2 border-[#2D241E] bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] text-xs font-bold cursor-pointer shadow-[0_3px_0_#2D241E]"
                    >
                      Claim Grant
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#6B5E51]">In Progress</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUB-TAB 2: CLASSIFIED PROJECTS */}
        {subTab === 'classified' && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-[#2D241E] bg-[#EEF2FF] p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-[#4338CA]" />
                <h3 className="font-display text-base font-extrabold text-[#1E1B4B]">
                  Case Files of Department 404 (Optional Long-Term Story)
                </h3>
              </div>
              <p className="text-xs text-[#3730A3] leading-relaxed">
                Decades ago, the government founded an oversized subterranean bureau beneath a quiet post office after discovering an unexplainable object. In 1998, floors were bricked shut, two dozen staff vanished into an unindexed hallway, and all records were stamped “404”. Unseal each dossier below to unlock secret rooms, lost memos, and permanent rewards.
              </p>
            </div>

            <div className="space-y-3.5">
              {classifiedProjects.map((proj) => {
                const { canLaunch, checks } = evaluateClassifiedProjectEligibility(proj, gameState);

                return (
                  <div
                    key={proj.id}
                    className={`rounded-2xl border-2 border-[#2D241E] p-4 sm:p-5 space-y-3 ${
                      proj.completed
                        ? 'bg-[#E5EFEA]'
                        : 'bg-[#FFFDF8] shadow-[0_4px_0_#2D241E]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#26211C] text-[#FDE68A] font-mono-num text-[10px] font-bold">
                            {proj.code}
                          </span>
                          <span className="font-mono-num text-[11px] font-bold text-[#0F766E]">
                            Reward: +${proj.rewardFunds} · +{proj.rewardResearch} RP · +
                            {proj.rewardReputation} Rep · +{proj.rewardSamples} Samples
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-extrabold text-[#26211C]">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-[#4B4035] leading-relaxed">{proj.teaser}</p>
                      </div>

                      {proj.completed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#0F766E] text-xs font-bold text-[#0F766E] shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Declassified</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!canLaunch}
                          onClick={() => onCompleteClassifiedProject(proj.id)}
                          className={`px-4 py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold shrink-0 transition-all ${
                            canLaunch
                              ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                              : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                          }`}
                        >
                          Declassify Case
                        </button>
                      )}
                    </div>

                    {proj.completed ? (
                      <div className="rounded-xl bg-[#FFFDF8] border border-[#0F766E]/35 p-3 text-xs text-[#14532D] leading-relaxed">
                        <span className="font-bold">Declassified Outcome: </span>
                        {proj.declassifiedLog}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {checks.map((chk) => (
                          <span
                            key={chk.label}
                            className={`px-2.5 py-1 rounded-lg border font-mono-num text-[11px] font-semibold ${
                              chk.met
                                ? 'bg-[#E5EFEA] border-[#0F766E]/40 text-[#0F766E]'
                                : 'bg-[#FAF5EB] border-[#2D241E]/20 text-[#5A4D41]'
                            }`}
                          >
                            {chk.label}: {chk.current}/{chk.target}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: DEPT. 404 ARCHIVES, SECRET ROOMS, CONVERSATIONS & STRANGE MESSAGES */}
        {subTab === 'archives' && (
          <div className="space-y-6">
            {/* Secret Rooms */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-[#26211C] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#B45309]" />
                <span>Secret Facility Rooms</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {secretRooms.map((sr) => {
                  const elapsed = Math.floor((nowMs - (sr.lastUsedAt ?? 0)) / 1000);
                  const remaining = Math.max(0, 45 - elapsed);
                  return (
                    <div
                      key={sr.id}
                      className={`rounded-2xl border-2 border-[#2D241E] p-4 flex flex-col justify-between gap-3 ${
                        sr.discovered ? 'bg-[#EEF2FF] shadow-[0_3px_0_#2D241E]' : 'bg-[#EAE2D3] opacity-85'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono-num font-bold text-[#4338CA]">
                          <span>{sr.floorLabel}</span>
                          {sr.discovered ? (
                            <span>
                              +${sr.passiveFundsPerSec}/s · +{sr.passiveResearchPerSec} RP/s
                            </span>
                          ) : (
                            <span className="text-[#6B5E51]">Sealed</span>
                          )}
                        </div>
                        <h4 className="font-display text-base font-extrabold text-[#26211C]">
                          {sr.discovered ? sr.name : 'Sealed Secret Sub-Level'}
                        </h4>
                        <p className="text-xs text-[#4B4035]">
                          {sr.discovered ? sr.description : sr.unlockHint}
                        </p>
                        {sr.discovered && (
                          <p className="text-[11px] font-semibold text-[#0F766E]">
                            {sr.specialActionDescription}
                          </p>
                        )}
                      </div>

                      {sr.discovered && (
                        <button
                          type="button"
                          disabled={remaining > 0}
                          onClick={() => onTriggerSecretRoomAction(sr.id)}
                          className={`w-full py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold ${
                            remaining > 0
                              ? 'bg-[#D6DDF5] text-[#5A5F8C] cursor-not-allowed'
                              : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer'
                          }`}
                        >
                          {remaining > 0 ? `Recharging (${remaining}s)` : sr.specialActionLabel}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Archived Documents */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-[#26211C] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0D9488]" />
                <span>
                  Archived Documents ({unlockedDocsCount}/{archivedDocs.length})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {archivedDocs.map((doc) => {
                  const isOpen = expandedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`rounded-2xl border-2 border-[#2D241E] p-4 space-y-2 ${
                        doc.unlocked ? 'bg-[#FFFDF8]' : 'bg-[#EAE2D3] opacity-85'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-num font-bold">
                            <span className="text-[#6B5E51]">{doc.docCode}</span>
                            <span>·</span>
                            <span
                              className={
                                doc.classification === 'Dept. 404 Eyes Only'
                                  ? 'text-[#991B1B]'
                                  : 'text-[#0F766E]'
                              }
                            >
                              {doc.classification}
                            </span>
                          </div>
                          <h4 className="font-display text-sm font-extrabold text-[#26211C] mt-0.5">
                            {doc.unlocked ? doc.title : 'Redacted File Folder'}
                          </h4>
                        </div>
                        {!doc.unlocked && <Lock className="w-4 h-4 text-[#7A6B5C] shrink-0" />}
                      </div>

                      {doc.unlocked ? (
                        <>
                          <p className="text-xs italic text-[#5A4D41]">{doc.excerpt}</p>
                          {isOpen ? (
                            <div className="rounded-xl bg-[#FAF5EB] border border-[#2D241E]/20 p-3 text-xs text-[#26211C] space-y-1.5 leading-relaxed">
                              <p>{doc.body}</p>
                              <p className="text-[11px] font-semibold text-[#7A6B5C]">
                                — {doc.author} ({doc.dateLabel})
                              </p>
                            </div>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setExpandedDocId(isOpen ? '' : doc.id)}
                            className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                          >
                            {isOpen ? 'Fold Memo ↑' : 'Read Full Document →'}
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-[#5A4D41]">Unlock Hint: {doc.unlockHint}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Employee Conversations */}
            <section className="space-y-3">
              <h3 className="font-display text-lg font-bold text-[#26211C] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
                <span>
                  Employee Conversations ({unlockedConvSet.size}/{EMPLOYEE_CONVERSATIONS.length})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EMPLOYEE_CONVERSATIONS.map((conv) => {
                  const unlocked = unlockedConvSet.has(conv.id);
                  return (
                    <div
                      key={conv.id}
                      className={`rounded-2xl border-2 border-[#2D241E] p-4 space-y-2 ${
                        unlocked ? 'bg-[#FFFDF8]' : 'bg-[#EAE2D3] opacity-85'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-extrabold text-[#26211C]">
                          {conv.title}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#6B5E51]">
                          {conv.roomLabel}
                        </span>
                      </div>
                      {unlocked ? (
                        <div className="space-y-1.5">
                          {conv.lines.map((line, idx) => (
                            <p key={idx} className="text-xs text-[#3F362D] leading-snug">
                              <span className="font-bold text-[#0F766E]">{line.speaker}:</span>{' '}
                              “{line.text}”
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#5A4D41]">{conv.unlockHint}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Intercepted Strange Messages */}
            <section className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#9333EA]" />
                  <h3 className="font-display text-base font-bold text-[#26211C]">
                    Intercepted Pneumatic Slips & Strange Messages
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={tubeCooldownRemaining > 0}
                  onClick={onListenPneumaticTube}
                  className={`px-3 py-1.5 rounded-xl border-2 border-[#2D241E] text-xs font-bold ${
                    tubeCooldownRemaining > 0
                      ? 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                      : 'bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] cursor-pointer'
                  }`}
                >
                  {tubeCooldownRemaining > 0
                    ? `Tube Quiet (${tubeCooldownRemaining}s)`
                    : 'Listen to Tube #0 (+12 RP)'}
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto warm-scroll pr-1">
                {strangeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl bg-[#FAF5EB] border border-[#2D241E]/20 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B211C]">
                      <span>
                        {msg.sender} · {msg.channel}
                      </span>
                      <span className="font-mono-num text-[#7A6B5C]">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[#26211C] leading-snug">“{msg.text}”</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
