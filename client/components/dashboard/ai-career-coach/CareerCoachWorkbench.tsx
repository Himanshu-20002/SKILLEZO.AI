'use client';

import React, { useState } from 'react';
import { useCareerCoach } from '@/hooks/useCareerCoach';
import { ConversationPanel } from './ConversationPanel';
import { IntelligencePanel } from './IntelligencePanel';
import { MessageSquare, Sparkles } from 'lucide-react';

export const CareerCoachWorkbench: React.FC = () => {
  const [mobileActiveView, setMobileActiveView] = useState<'chat' | 'intelligence'>('chat');
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<'metrics' | 'evidence' | 'actions'>('metrics');

  const {
    messages,
    status,
    isGenerating,
    targetRole,
    activeIntelligence,
    selectedEvidenceId,
    setSelectedEvidenceId,
    setTargetRole,
    sendMessage,
    cancelRequest,
    retryLastMessage,
    clearConversation,
  } = useCareerCoach();

  const handleOpenWorkbenchTab = (tab: 'metrics' | 'evidence' | 'actions') => {
    setActiveWorkbenchTab(tab);
    setMobileActiveView('intelligence');
  };

  const totalIntelligenceCount =
    (activeIntelligence?.metrics?.length || 0) +
    (activeIntelligence?.evidence?.length || 0) +
    (activeIntelligence?.recommendations?.length || 0);

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] sm:h-[calc(100dvh-6rem)] max-h-[calc(100dvh-5rem)] sm:max-h-[calc(100dvh-6rem)] max-w-7xl mx-auto min-h-0 overflow-hidden">
      {/* Mobile / Tablet Tab Switcher (< 1024px) */}
      <div className="flex lg:hidden items-center justify-center p-1 mb-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700/60 shrink-0">
        <button
          type="button"
          onClick={() => setMobileActiveView('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mobileActiveView === 'chat'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span suppressHydrationWarning>Conversation ({messages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActiveView('intelligence')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mobileActiveView === 'intelligence'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span suppressHydrationWarning>
            Intelligence {totalIntelligenceCount > 0 && `(${totalIntelligenceCount})`}
          </span>
        </button>
      </div>

      {/* Main Workbench Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left / Main Conversation Pane (60-65% on desktop) */}
        <div
          className={`lg:col-span-7 xl:col-span-7 h-full flex flex-col min-h-0 ${
            mobileActiveView === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ConversationPanel
            messages={messages}
            status={status}
            isGenerating={isGenerating}
            targetRole={targetRole}
            onSendMessage={sendMessage}
            onCancel={cancelRequest}
            onRetry={retryLastMessage}
            onClear={clearConversation}
            onSelectEvidence={(evId) => {
              setSelectedEvidenceId(evId);
              handleOpenWorkbenchTab('evidence');
            }}
            onOpenWorkbenchTab={handleOpenWorkbenchTab}
          />
        </div>

        {/* Right / Career Intelligence Workbench Pane (35-40% on desktop) */}
        <div
          className={`lg:col-span-5 xl:col-span-5 h-full flex flex-col min-h-0 ${
            mobileActiveView === 'intelligence' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <IntelligencePanel
            intelligence={activeIntelligence}
            targetRole={targetRole}
            onUpdateTargetRole={setTargetRole}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={setSelectedEvidenceId}
            activeTab={activeWorkbenchTab}
            onTabChange={setActiveWorkbenchTab}
          />
        </div>
      </div>
    </div>
  );
};
