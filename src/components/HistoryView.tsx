import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Search, Trash2, ExternalLink, Copy, Check, Clock, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export default function HistoryView({ history, onSelectHistory, onClearHistory }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.improvedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'humanize') return matchesSearch && item.mode.toLowerCase().includes('human');
    if (selectedFilter === 'plagiarism') return matchesSearch && (item.mode.toLowerCase().includes('plag') || item.mode.toLowerCase().includes('orig'));
    if (selectedFilter === 'academic') return matchesSearch && item.mode.toLowerCase().includes('academic');
    return matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-900 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Manuscript History & Revisions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review, compare, and reopen previously refined document versions and reports.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by content, keywords, or mode..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 shadow-sm transition-colors placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Modes' },
              { id: 'academic', label: 'Academic Polish' },
              { id: 'humanize', label: 'AI Humaniser' },
              { id: 'plagiarism', label: 'Plagiarism Reduction' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Item Cards */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No revisions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Documents refined through either the Instant Refine or Enterprise Pipeline will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const originalWords = item.originalText.trim().split(/\s+/).filter(Boolean).length;
              const improvedWords = item.improvedText.trim().split(/\s+/).filter(Boolean).length;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800/60">
                        {item.mode}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {originalWords} words → {improvedWords} words
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(item.id, item.improvedText)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === item.id ? 'Copied' : 'Copy'}
                      </button>

                      <button
                        onClick={() => onSelectHistory(item)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Workspace
                      </button>
                    </div>
                  </div>

                  {/* Quality Badges */}
                  <div className="flex flex-wrap items-center gap-4 py-3 text-xs border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Overall Score:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.scores?.overall ?? 88}/100</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Grammar:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.scores?.grammar ?? 90}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Academic Tone:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.scores?.academicTone ?? 88}%</span>
                    </div>
                    {item.originalityReport && (
                      <div className="flex items-center gap-1.5 ml-auto text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Originality: ~{item.originalityReport.postProcessingSimilarityEstimate}% match ({item.originalityReport.riskLevel} Risk)</span>
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Original Excerpt</span>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {item.originalText}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50/50 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <span className="text-[10px] font-bold uppercase text-blue-500 mb-1 block">Refined Manuscript</span>
                      <p className="text-slate-800 dark:text-slate-100 line-clamp-3 leading-relaxed">
                        {item.improvedText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
