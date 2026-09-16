import React, { useState, useRef } from 'react';
import { Sparkles, Upload, FileText, Undo2, Redo2, Layers, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { DocumentProject } from '../types';

interface EditorProps {
  onProcessInstant: (text: string, mode: string) => void;
  onProcessBackground: (title: string, text: string, mode: string) => void;
  isProcessing: boolean;
  project: DocumentProject;
  onUpdateProject: (updated: Partial<DocumentProject>) => void;
}

const MODES = [
  {
    id: 'AI Humaniser (Academic)',
    label: 'AI Humaniser (Academic)',
    description: 'Removes AI patterns naturally while retaining 100% of scientific meaning, citations, and terminology.',
    badge: 'Enterprise'
  },
  {
    id: 'Plagiarism Reduction Engine',
    label: 'Plagiarism Reduction Engine',
    description: 'Rewrites high-similarity passages via academic paraphrasing with originality report and citation protection.',
    badge: 'Enterprise'
  },
  { id: 'Academic', label: 'Academic Tone', description: 'Elevates vocabulary and structure for peer-reviewed journals.' },
  { id: 'Humanize (Academic)', label: 'Humanize (Academic)', description: 'Classic originality & natural cadence refinement.' },
  { id: 'Grammar', label: 'Grammar & Syntax', description: 'Corrects grammatical, punctuation, and typographical errors.' },
  { id: 'Simplify', label: 'Simplify Technicals', description: 'Clarifies complex phrasing without losing precision.' },
  { id: 'Professional', label: 'Professional Business', description: 'Polished formal tone for reports and proposals.' },
  { id: 'Concise', label: 'Concise & Direct', description: 'Eliminates wordiness and redundant phrasing.' },
  { id: 'Expand', label: 'Expand & Elaborate', description: 'Adds depth, transitions, and academic explanation.' },
  { id: 'Formal', label: 'Strict Formal', description: 'Strict adherence to formal academic & business standards.' },
  { id: 'SEO Optimizer', label: 'SEO Optimizer', description: 'Optimizes structure and keywords for discoverability.' },
  { id: 'Copywriting', label: 'Persuasive Copywriting', description: 'Engaging hooks and clear persuasive narrative flow.' },
];

export default function Editor({
  onProcessInstant,
  onProcessBackground,
  isProcessing,
  project,
  onUpdateProject
}: EditorProps) {
  const [mode, setMode] = useState('AI Humaniser (Academic)');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const text = project.text || '';
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isLargeDocument = wordCount > 500; // Trigger pipeline recommendation for docs > 500 words

  const handleTextChange = (newText: string) => {
    // Push previous text onto undoStack
    const currentUndo = project.undoStack || [];
    const newUndo = [...currentUndo, text].slice(-30);
    onUpdateProject({
      text: newText,
      wordCount: newText.trim() ? newText.trim().split(/\s+/).length : 0,
      undoStack: newUndo,
      redoStack: [],
      lastModified: Date.now()
    });
  };

  const handleUndo = () => {
    const undoStack = project.undoStack || [];
    if (undoStack.length === 0) return;
    const prevText = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const newRedo = [...(project.redoStack || []), text].slice(-30);
    onUpdateProject({
      text: prevText,
      wordCount: prevText.trim() ? prevText.trim().split(/\s+/).length : 0,
      undoStack: newUndo,
      redoStack: newRedo,
      lastModified: Date.now()
    });
  };

  const handleRedo = () => {
    const redoStack = project.redoStack || [];
    if (redoStack.length === 0) return;
    const nextText = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newUndo = [...(project.undoStack || []), text].slice(-30);
    onUpdateProject({
      text: nextText,
      wordCount: nextText.trim() ? nextText.trim().split(/\s+/).length : 0,
      undoStack: newUndo,
      redoStack: newRedo,
      lastModified: Date.now()
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Raw = event.target?.result as string;
        const base64Data = base64Raw.split(',')[1] || base64Raw;

        try {
          const res = await fetch('/api/parse-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64Data })
          });
          const data = await res.json();
          if (data.error) {
            alert('Failed to parse file: ' + data.error);
          } else {
            handleTextChange(data.text);
            onUpdateProject({
              title: file.name.replace(/\.[^/.]+$/, "") || project.title,
              fileType: (file.name.split('.').pop()?.toLowerCase() as any) || 'txt'
            });
          }
        } catch (err: any) {
          alert('Error parsing file: ' + err.message);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleSubmitBackground = () => {
    if (text.trim() && !isProcessing) {
      onProcessBackground(project.title || "Untitled Manuscript", text, mode);
    }
  };

  const handleSubmitInstant = () => {
    if (text.trim() && !isProcessing) {
      onProcessInstant(text, mode);
    }
  };

  const selectedModeObj = MODES.find(m => m.id === mode) || MODES[0];

  return (
    <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto space-y-4">
      {/* Top Document Workspace Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 flex-1 mr-4">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            value={project.title}
            onChange={(e) => onUpdateProject({ title: e.target.value })}
            placeholder="Document Title (e.g. Dissertation Chapter 4)"
            className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 outline-none px-1 py-0.5 transition-colors w-full max-w-sm"
          />
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md">
            Enterprise Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleUndo}
              disabled={(project.undoStack || []).length === 0}
              title="Undo (Cmd/Ctrl+Z)"
              className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={(project.redoStack || []).length === 0}
              title="Redo (Cmd/Ctrl+Y)"
              className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Upload File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-600"
          >
            <Upload className="w-3.5 h-3.5" />
            {isUploading ? 'Parsing...' : 'Upload DOCX / PDF / TXT'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.rtf,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </button>

          <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{wordCount.toLocaleString()} words</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">
              ~{Math.max(1, Math.ceil(wordCount / 900))} semantic section{Math.ceil(wordCount / 900) > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Main Text Area */}
      <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm relative flex flex-col focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:shadow-md transition-shadow">
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your research manuscript, dissertation, book chapter, or grant proposal here... No length limits."
          className="flex-1 w-full p-6 text-base leading-relaxed text-slate-800 dark:text-slate-100 resize-none outline-none bg-transparent placeholder-slate-400 dark:placeholder-slate-500 font-serif"
          disabled={isProcessing}
        />

        {/* Bottom Mode Picker and Execution Panel */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/80 flex flex-col gap-4 bg-slate-50/70 dark:bg-slate-800/80 rounded-b-xl transition-colors">
          {/* Select Refinement Mode */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Select Enterprise Engine:
              </span>
              {selectedModeObj.description && (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium italic">
                  {selectedModeObj.description}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                    m.id === mode
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.badge === 'Enterprise' && (
                    <ShieldCheck className={`w-3.5 h-3.5 ${m.id === mode ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'}`} />
                  )}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Background Pipeline vs Instant */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {isLargeDocument ? (
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                  <AlertCircle className="w-4 h-4" /> Recommended: Enterprise Pipeline for multi-section processing without browser freeze.
                </span>
              ) : (
                <span>Ready to refine using <strong className="text-slate-700 dark:text-slate-200">{selectedModeObj.label}</strong></span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitInstant}
                disabled={!text.trim() || isProcessing}
                title="Synchronous immediate refinement (best for < 500 words)"
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Instant Refine
              </button>

              <button
                onClick={handleSubmitBackground}
                disabled={!text.trim() || isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors shadow-md ml-auto"
              >
                <Sparkles className="w-4 h-4" />
                Start Enterprise Pipeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
