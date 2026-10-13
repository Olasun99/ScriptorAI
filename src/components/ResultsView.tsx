import { ImproveResponse, TextChange } from '../types';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ArrowRight, Copy, Check, SplitSquareHorizontal, FileText, Download, FileDown, ShieldCheck, AlertTriangle, FileCode, BookOpen } from 'lucide-react';
import { diffWords } from 'diff';
import { jsPDF } from 'jspdf';

interface ResultsViewProps {
  originalText: string;
  result: ImproveResponse;
}

export default function ResultsView({ originalText, result }: ResultsViewProps) {
  const [selectedChange, setSelectedChange] = useState<TextChange | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [copied, setCopied] = useState(false);
  
  const [activeHighlights, setActiveHighlights] = useState({
    grammar: true,
    structure: true,
    style: true,
    other: true
  });

  const handleCopy = () => {
    const textToCopy = result.improvedText;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        fallbackCopyTextToClipboard(textToCopy);
      });
    } else {
      fallbackCopyTextToClipboard(textToCopy);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - margin * 2;
    
    doc.setFontSize(16);
    doc.text('Refined Manuscript', margin, margin + 5);
    
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(result.improvedText, textWidth);
    doc.text(lines, margin, margin + 20);
    
    doc.save('refined_manuscript.pdf');
  };

  const handleExportDOCX = async () => {
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Refined Manuscript',
          text: result.improvedText
        })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'refined_manuscript.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('DOCX export error:', err);
      alert('Failed to export DOCX');
    }
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([result.improvedText], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refined_manuscript.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportTXT = () => {
    const blob = new Blob([result.improvedText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refined_manuscript.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + "<p>" + result.improvedText.replace(/\n/g, "</p><p>") + "</p>" + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'refined_manuscript.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const diffs = useMemo(() => {
    return diffWords(originalText || '', result?.improvedText || '');
  }, [originalText, result?.improvedText]);

  const getNormalizedCategory = (category: string | undefined): 'grammar' | 'structure' | 'style' | 'other' => {
    if (!category) return 'other';
    const c = category.toLowerCase();
    if (c.includes('gram') || c.includes('spell') || c.includes('typo') || c.includes('punct') || c.includes('syntax')) return 'grammar';
    if (c.includes('struct') || c.includes('flow') || c.includes('cohes') || c.includes('transit') || c.includes('paragr')) return 'structure';
    if (c.includes('style') || c.includes('tone') || c.includes('acad') || c.includes('concis') || c.includes('form') || c.includes('clar')) return 'style';
    return 'other';
  };

  const getCategoryColor = (category: string | undefined, isRemoved = false) => {
    const norm = getNormalizedCategory(category);
    const base = isRemoved ? 'line-through opacity-70' : '';
    switch (norm) {
      case 'grammar': return `bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 ${base}`;
      case 'structure': return `bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 ${base}`;
      case 'style': return `bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 ${base}`;
      default: return isRemoved ? `bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 ${base}` : `bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ${base}`;
    }
  };

  const getPartCategory = (part: any, isRemoved = false) => {
    if (!result?.changes) return 'other';
    const val = (part.value || '').trim();
    if (!val) return 'other';
    
    const matchingChange = result.changes.find(c => {
      const segment = isRemoved ? c.originalSegment : c.improvedSegment;
      return segment && (segment.includes(val) || val.includes(segment));
    });
    return getNormalizedCategory(matchingChange?.category);
  };

  const toggleHighlight = (category: keyof typeof activeHighlights) => {
    setActiveHighlights(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderOriginalText = () => {
    return (
      <div className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 space-y-4 whitespace-pre-wrap">
        {diffs.map((part, index) => {
          if (part.removed) {
            const category = getPartCategory(part, true);
            const isVisible = activeHighlights[category as keyof typeof activeHighlights] || (category === 'other' && activeHighlights.other);
            if (isVisible) {
              const colorClass = getCategoryColor(category, true);
              return <span key={index} className={`${colorClass} px-1 rounded mx-0.5`}>{part.value}</span>;
            } else {
              return <span key={index} className="line-through opacity-70">{part.value}</span>;
            }
          }
          if (!part.added) {
            return <span key={index}>{part.value}</span>;
          }
          return null;
        })}
      </div>
    );
  };

  const renderImprovedText = () => {
    return (
      <div className="text-lg leading-relaxed text-slate-800 dark:text-slate-200 space-y-4 whitespace-pre-wrap">
        {diffs.map((part, index) => {
          if (part.added) {
            const category = getPartCategory(part, false);
            const isVisible = activeHighlights[category as keyof typeof activeHighlights] || (category === 'other' && activeHighlights.other);
            if (isVisible) {
              const colorClass = getCategoryColor(category, false);
              return <span key={index} className={`${colorClass} px-1 rounded mx-0.5`}>{part.value}</span>;
            } else {
              return <span key={index}>{part.value}</span>;
            }
          }
          if (!part.removed) {
            return <span key={index}>{part.value}</span>;
          }
          return null;
        })}
        <div className="mt-8 flex flex-col gap-3 pt-4 border-t border-blue-100 dark:border-blue-900/50">
           <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
             <span className="mr-2 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-bold self-center">Toggle Highlights:</span>
             <button onClick={() => toggleHighlight('grammar')} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${activeHighlights.grammar ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
               <span className={`w-2.5 h-2.5 rounded-full ${activeHighlights.grammar ? 'bg-orange-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>Grammar
             </button>
             <button onClick={() => toggleHighlight('structure')} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${activeHighlights.structure ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
               <span className={`w-2.5 h-2.5 rounded-full ${activeHighlights.structure ? 'bg-purple-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>Structure
             </button>
             <button onClick={() => toggleHighlight('style')} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${activeHighlights.style ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
               <span className={`w-2.5 h-2.5 rounded-full ${activeHighlights.style ? 'bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>Style
             </button>
             <button onClick={() => toggleHighlight('other')} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${activeHighlights.other ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
               <span className={`w-2.5 h-2.5 rounded-full ${activeHighlights.other ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>Other
             </button>
           </div>
           <div className="flex flex-wrap gap-2">
             {(result.changes || []).map((change, idx) => {
               const category = change.category || 'other';
               const isVisible = activeHighlights[category as keyof typeof activeHighlights] || (category === 'other' && activeHighlights.other);
               if (!isVisible) return null;
               
               return (
                 <span
                   key={idx}
                   onClick={() => setSelectedChange(change)}
                   className={`cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:opacity-80 shadow-sm ${getCategoryColor(category, false)}`}
                 >
                   {change.improvedSegment || change.originalSegment}
                 </span>
               );
             })}
           </div>
        </div>
      </div>
    );
  };

  const renderUnifiedDiff = () => {
    return (
      <div className="text-lg leading-relaxed text-slate-800 dark:text-slate-200 space-y-4 whitespace-pre-wrap">
        {diffs.map((part, index) => {
          if (part.added) {
            const category = getPartCategory(part, false);
            const isVisible = activeHighlights[category as keyof typeof activeHighlights] || (category === 'other' && activeHighlights.other);
            if (isVisible) {
              const colorClass = getCategoryColor(category, false);
              return <span key={index} className={`${colorClass} px-1 rounded mx-0.5`}>{part.value}</span>;
            } else {
              return <span key={index}>{part.value}</span>;
            }
          }
          if (part.removed) {
            const category = getPartCategory(part, true);
            const isVisible = activeHighlights[category as keyof typeof activeHighlights] || (category === 'other' && activeHighlights.other);
            if (isVisible) {
              const colorClass = getCategoryColor(category, true);
              return <span key={index} className={`${colorClass} px-1 rounded mx-0.5`}>{part.value}</span>;
            } else {
              return <span key={index} className="line-through opacity-70">{part.value}</span>;
            }
          }
          return <span key={index}>{part.value}</span>;
        })}
      </div>
    );
  };

  return (
    <main className="flex-1 p-6 flex flex-col space-y-4 overflow-hidden relative">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg transition-colors">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'side-by-side' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Side-by-side
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'unified' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Unified Diff
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportDOCX}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Export native Microsoft Word DOCX"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            DOCX (.docx)
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Export PDF Document"
          >
            <Download className="w-3.5 h-3.5 text-red-600" />
            PDF
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Export Markdown Document"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-600" />
            Markdown (.md)
          </button>
          <button
            onClick={handleExportTXT}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Export Plain Text"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            TXT (.txt)
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>

      {/* Enterprise Originality & Citation Protection Report Card */}
      {result.originalityReport && (
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-emerald-900/10 dark:from-blue-950/40 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Originality & Plagiarism Reduction Report
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  result.originalityReport.riskLevel === 'Low'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                }`}>
                  {result.originalityReport.riskLevel} Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                {result.originalityReport.analysisSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="text-center">
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Original Similarity</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                ~{result.originalityReport.originalSimilarityEstimate}%
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Post-Processing</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ~{result.originalityReport.postProcessingSimilarityEstimate}%
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Passages Refined</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {result.originalityReport.flaggedPassagesCount}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex space-x-6 min-h-0">
        {viewMode === 'side-by-side' ? (
          <>
            {/* Left Pane: Input */}
            <div className="flex-1 flex flex-col space-y-4 h-full min-h-0">
              <div className="flex items-center justify-between shrink-0 h-8">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Source Manuscript</h2>
                <span className="text-xs text-slate-400 dark:text-slate-500">{originalText.length} chars</span>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm overflow-y-auto min-h-0 transition-colors">
                {renderOriginalText()}
              </div>
            </div>

            {/* Right Pane: Improved Output */}
            <div className="flex-1 flex flex-col space-y-4 h-full min-h-0">
              <div className="flex items-center justify-between shrink-0 h-8">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ScriptorAI Refinement</h2>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900/50 rounded-xl p-6 shadow-md shadow-blue-900/5 dark:shadow-none overflow-y-auto min-h-0 relative transition-colors">
                {renderImprovedText()}
                
                <AnimatePresence>
                  {selectedChange && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-6 left-6 right-6 bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600 shadow-lg z-10"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reason for change</h4>
                            <button onClick={() => setSelectedChange(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">×</button>
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 text-sm mb-3">{selectedChange.reason}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            {selectedChange.originalSegment && (
                              <span className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded line-through">
                                {selectedChange.originalSegment}
                              </span>
                            )}
                            {(selectedChange.originalSegment && selectedChange.improvedSegment) && (
                              <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            )}
                            {selectedChange.improvedSegment && (
                              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded">
                                {selectedChange.improvedSegment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col space-y-4 h-full min-h-0">
            <div className="flex items-center justify-between shrink-0 h-8">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Unified Diff</h2>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm overflow-y-auto min-h-0 w-full max-w-4xl mx-auto transition-colors">
              {renderUnifiedDiff()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
