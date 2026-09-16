import React, { useState } from 'react';
import { ProcessingJob } from '../types';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Terminal, Clock, FileText, X } from 'lucide-react';

interface JobProgressBannerProps {
  job: ProcessingJob;
  onCancel: (jobId: string) => void;
  onViewResult: (job: ProcessingJob) => void;
  onDismiss: () => void;
}

export default function JobProgressBanner({
  job,
  onCancel,
  onViewResult,
  onDismiss
}: JobProgressBannerProps) {
  const [showLogs, setShowLogs] = useState(false);

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';
  const isRunning = job.status === 'processing' || job.status === 'queued';

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Almost done...';
    if (seconds < 60) return `~${seconds}s remaining`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `~${mins}m ${secs}s remaining`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRunning && <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />}
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {isFailed && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {isCancelled && <XCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Enterprise Pipeline</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">{job.documentTitle}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isRunning && `Processing chunk ${job.currentChunkIndex + 1} of ${job.chunksTotal} (${job.progress}%)`}
              {isCompleted && `Completed • ${job.chunksTotal} semantic sections refined`}
              {isFailed && `Failed: ${job.error || 'Unknown error'}`}
              {isCancelled && 'Job Cancelled'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[11px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 border border-slate-700">
              <Clock className="w-3 h-3 text-blue-400" />
              {formatTimeRemaining(job.estimatedSecondsRemaining)}
            </span>
          )}

          <button
            onClick={() => setShowLogs(!showLogs)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
            title="Toggle Processing Logs"
          >
            {showLogs ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {isRunning && (
            <button
              onClick={() => onCancel(job.id)}
              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded text-xs font-semibold transition-colors border border-rose-500/30"
            >
              Cancel
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => onViewResult(job)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
            >
              View Result
            </button>
          )}

          {(isCompleted || isFailed || isCancelled) && (
            <button
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5">
        <div
          className={`h-full transition-all duration-500 ${
            isCompleted
              ? 'bg-emerald-500'
              : isFailed
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          }`}
          style={{ width: `${job.progress}%` }}
        />
      </div>

      {/* Processing Logs Tray */}
      {showLogs && (
        <div className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5 border-t border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-blue-400" /> Real-time Processing Logs
            </span>
            <span>{job.logs.length} events</span>
          </div>
          {job.logs.map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${
                log.level === 'error'
                  ? 'text-rose-400 font-semibold'
                  : log.level === 'warn'
                  ? 'text-amber-400'
                  : log.level === 'success'
                  ? 'text-emerald-400'
                  : 'text-slate-300'
              }`}
            >
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className="break-words">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
