import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import ProcessingAnimation from './components/ProcessingAnimation';
import ResultsView from './components/ResultsView';
import QualitySidebar from './components/QualitySidebar';
import JobProgressBanner from './components/JobProgressBanner';
import HistoryView from './components/HistoryView';
import { ImproveResponse, HistoryItem, DocumentProject, ProcessingJob } from './types';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImproveResponse | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('scriptorai_history_v3');
    return saved ? JSON.parse(saved) : [];
  });

  // Enterprise project workspace with auto-save
  const [project, setProject] = useState<DocumentProject>(() => {
    const saved = localStorage.getItem('scriptorai_project_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'proj_1',
      title: 'Research Manuscript',
      text: '',
      wordCount: 0,
      lastModified: Date.now(),
      undoStack: [],
      redoStack: []
    };
  });

  // Background pipeline job state
  const [activeJob, setActiveJob] = useState<ProcessingJob | null>(null);

  useEffect(() => {
    localStorage.setItem('scriptorai_history_v3', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('scriptorai_project_v1', JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Background Job Polling Hook
  useEffect(() => {
    if (!activeJob || (activeJob.status !== 'processing' && activeJob.status !== 'queued')) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${activeJob.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.job) {
            setActiveJob(data.job);
            if (data.job.status === 'completed' && data.job.result) {
              setResult(data.job.result);
              setOriginalText(project.text);
              setActiveView('dashboard');
              // Also add to History
              const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                originalText: project.text,
                improvedText: data.job.result.improvedText,
                mode: data.job.mode,
                scores: data.job.result.scores,
                changes: data.job.result.changes,
                originalityReport: data.job.result.originalityReport
              };
              setHistory(prev => [newItem, ...prev]);
            }
          }
        }
      } catch (err) {
        console.error('Job polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob, project.text]);

  const handleUpdateProject = (updated: Partial<DocumentProject>) => {
    setProject(prev => ({ ...prev, ...updated }));
  };

  // Synchronous Immediate Processing (for small texts)
  const handleProcessInstant = async (text: string, mode: string) => {
    setIsProcessing(true);
    setOriginalText(text);
    setResult(null);
    try {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode })
      });
      if (!response.ok) {
        let errorMessage = 'Failed to improve text';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      const data: ImproveResponse = await response.json();
      setResult(data);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalText: text,
        improvedText: data.improvedText,
        mode: mode,
        scores: data.scores,
        changes: data.changes,
        originalityReport: data.originalityReport
      };
      
      setHistory(prev => [newItem, ...prev]);
    } catch (error: any) {
      console.error(error);
      alert('An error occurred while processing the text: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Asynchronous Enterprise Pipeline Processing (non-blocking)
  const handleProcessBackground = async (title: string, text: string, mode: string) => {
    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: project.id,
          documentTitle: title || project.title || 'Research Manuscript',
          text,
          mode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start enterprise pipeline');
      }

      const data = await response.json();
      if (data.job) {
        setActiveJob(data.job);
        setOriginalText(text);
      }
    } catch (err: any) {
      alert('Pipeline startup error: ' + err.message);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
      if (activeJob && activeJob.id === jobId) {
        setActiveJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
    } catch (err) {
      console.error('Cancel job error:', err);
    }
  };

  const handleViewJobResult = (job: ProcessingJob) => {
    if (job.result) {
      setOriginalText(project.text);
      setResult(job.result);
      setActiveView('dashboard');
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setOriginalText(item.originalText);
    setResult({
      improvedText: item.improvedText,
      scores: item.scores,
      changes: item.changes,
      originalityReport: item.originalityReport
    });
    setActiveView('dashboard');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        history={history} 
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors relative">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0 transition-colors">
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-slate-400 dark:text-slate-500">Workspace</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{project.title || 'Untitled Document'}</span>
          </div>
          <div className="flex items-center space-x-4">
            {result && (
              <button
                onClick={() => {
                  setResult(null);
                  setOriginalText('');
                }}
                className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
              >
                Back to Editor
              </button>
            )}
            <div className="flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                isProcessing || (activeJob && (activeJob.status === 'processing' || activeJob.status === 'queued'))
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}></span>
              {isProcessing || (activeJob && (activeJob.status === 'processing' || activeJob.status === 'queued'))
                ? 'Processing Pipeline...'
                : 'Ready'}
            </div>
          </div>
        </header>

        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center">
            <ProcessingAnimation />
          </div>
        ) : activeView === 'history' ? (
          <HistoryView
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        ) : result && activeView === 'dashboard' ? (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 overflow-hidden min-h-0">
              <ResultsView originalText={originalText} result={result} />
            </div>
            <QualitySidebar scores={result.scores} />
          </div>
        ) : (
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <Editor
              onProcessInstant={handleProcessInstant}
              onProcessBackground={handleProcessBackground}
              isProcessing={isProcessing}
              project={project}
              onUpdateProject={handleUpdateProject}
            />
          </div>
        )}

        {/* Enterprise Non-Blocking Processing Banner */}
        {activeJob && (
          <JobProgressBanner
            job={activeJob}
            onCancel={handleCancelJob}
            onViewResult={handleViewJobResult}
            onDismiss={() => setActiveJob(null)}
          />
        )}
      </main>
    </div>
  );
}
