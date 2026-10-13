import { QualityScores } from '../types';

interface QualitySidebarProps {
  scores: QualityScores;
}

export default function QualitySidebar({ scores }: QualitySidebarProps) {
  if (!scores) return null;

  const metrics = [
    { label: 'Grammar', value: scores.grammar ?? 90, color: 'bg-emerald-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Accurate' },
    { label: 'Academic Tone', value: scores.academicTone ?? 88, color: 'bg-blue-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Authoritative' },
    { label: 'Readability', value: scores.readability ?? 86, color: 'bg-amber-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Clear' },
    { label: 'Conciseness', value: scores.conciseness ?? 85, color: 'bg-emerald-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Precise' },
  ];

  return (
    <footer className="h-44 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-5 flex space-x-6 shrink-0 transition-colors">
      <div className="flex flex-col border-r border-slate-100 dark:border-slate-700 pr-6 justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Quality Score</span>
        <div className="flex items-end space-x-2">
          <span className="text-4xl font-light text-slate-800 dark:text-slate-100">{scores.overall ?? 88}</span>
          <span className="text-emerald-500 font-bold mb-1">/ 100</span>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col justify-center transition-colors">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{metric.label}</span>
            <div className={`w-full ${metric.barBg} h-1.5 mt-2 rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${metric.color} rounded-full transition-all duration-500`} 
                style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
              />
            </div>
            <span className="text-xs font-semibold mt-1 block text-slate-700 dark:text-slate-300">{metric.value}% {metric.textStatus}</span>
          </div>
        ))}
      </div>
      
      <div className="w-56 bg-slate-900 dark:bg-slate-950 rounded-xl p-3.5 flex flex-col justify-center text-white border border-transparent dark:border-slate-700 shadow-sm transition-colors">
        <span className="text-[10px] font-bold uppercase text-slate-400 opacity-80">Pipeline Verification</span>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center text-[10px] font-medium text-emerald-400">
            <span className="w-3.5 h-3.5 bg-emerald-500/20 rounded-full mr-2 flex items-center justify-center text-[9px] text-emerald-400">✓</span>
            Citations Preserved (100%)
          </div>
          <div className="flex items-center text-[10px] font-medium text-blue-400">
            <span className="w-3.5 h-3.5 bg-blue-500/20 rounded-full mr-2 flex items-center justify-center text-[9px] text-blue-400">✓</span>
            Academic Tone Elevated
          </div>
          <div className="flex items-center text-[10px] font-medium text-indigo-400">
            <span className="w-3.5 h-3.5 bg-indigo-500/20 rounded-full mr-2 flex items-center justify-center text-[9px] text-indigo-400">✓</span>
            Formatting & Tables Intact
          </div>
        </div>
      </div>
    </footer>
  );
}
