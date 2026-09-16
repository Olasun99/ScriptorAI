import { QualityScores } from '../types';

interface QualitySidebarProps {
  scores: QualityScores;
}

export default function QualitySidebar({ scores }: QualitySidebarProps) {
  const metrics = [
    { label: 'Grammar', value: scores.grammar, color: 'bg-emerald-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Perfect' },
    { label: 'Academic Tone', value: scores.academicTone, color: 'bg-blue-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Match' },
    { label: 'Readability', value: scores.readability, color: 'bg-amber-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Good' },
    { label: 'Conciseness', value: scores.conciseness, color: 'bg-emerald-500', barBg: 'bg-slate-200 dark:bg-slate-600', textStatus: 'Concise' },
  ];

  return (
    <footer className="h-48 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex space-x-8 shrink-0 transition-colors">
      <div className="flex flex-col border-r border-slate-100 dark:border-slate-700 pr-8 justify-center">
        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">Quality Score</span>
        <div className="flex items-end space-x-2">
          <span className="text-5xl font-light text-slate-800 dark:text-slate-100">{scores.overall}</span>
          <span className="text-emerald-500 font-bold mb-2">/ 100</span>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col justify-center transition-colors">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{metric.label}</span>
            <div className={`w-full ${metric.barBg} h-1.5 mt-2 rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${metric.color} rounded-full`} 
                style={{ width: `${metric.value}%` }}
              />
            </div>
            <span className="text-xs font-semibold mt-1 block text-slate-700 dark:text-slate-300">{metric.value}% {metric.textStatus}</span>
          </div>
        ))}
      </div>
      
      <div className="w-64 bg-slate-900 dark:bg-slate-950 rounded-xl p-4 flex flex-col justify-center text-white border border-transparent dark:border-slate-700 shadow-sm transition-colors">
        <span className="text-[10px] font-bold uppercase text-slate-400 opacity-80">Pipeline Status</span>
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-[10px] font-medium">
            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2 flex items-center justify-center text-[8px]">✓</span>
            Analysis Complete
          </div>
          <div className="flex items-center text-[10px] font-medium">
            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2 flex items-center justify-center text-[8px]">✓</span>
            Grammar & Style Engines
          </div>
          <div className="flex items-center text-[10px] font-medium">
            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2 flex items-center justify-center text-[8px]">✓</span>
            Refinement
          </div>
        </div>
      </div>
    </footer>
  );
}
