export interface TextChange {
  originalSegment: string;
  improvedSegment: string;
  type: 'added' | 'removed' | 'rewritten';
  category?: 'grammar' | 'structure' | 'style' | 'other';
  reason: string;
}

export interface QualityScores {
  overall: number;
  grammar: number;
  readability: number;
  academicTone: number;
  conciseness: number;
  style: number;
}

export interface OriginalityReport {
  originalSimilarityEstimate: number;
  postProcessingSimilarityEstimate: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  analysisSummary: string;
  flaggedPassagesCount: number;
}

export interface ImproveResponse {
  improvedText: string;
  changes: TextChange[];
  scores: QualityScores;
  originalityReport?: OriginalityReport;
  processedChunksCount?: number;
  contextGlossary?: string[];
}

export interface JobProgressLog {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warn' | 'error';
}

export interface ProcessingJob {
  id: string;
  documentId: string;
  documentTitle: string;
  mode: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0 to 100
  chunksTotal: number;
  chunksCompleted: number;
  currentChunkIndex: number;
  estimatedSecondsRemaining: number;
  logs: JobProgressLog[];
  error?: string;
  result?: ImproveResponse;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  improvedText: string;
  mode: string;
  scores: QualityScores;
  changes: TextChange[];
  originalityReport?: OriginalityReport;
}

export interface DocumentProject {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  lastModified: number;
  undoStack: string[];
  redoStack: string[];
  lastResult?: ImproveResponse;
  activeJobId?: string;
  fileType?: 'txt' | 'docx' | 'md' | 'rtf';
}
