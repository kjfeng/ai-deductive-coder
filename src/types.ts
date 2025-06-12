// Types for the AI deductive coding app

export interface Tag {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'processing' | 'completed' | 'no-results' | 'error';
  quotes: string[];
  fingerprint?: string; // Hash of name + description to detect changes
}

export interface AIConfig {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'custom';
  model: string;
  endpoint?: string;
}

export interface Document {
  name: string;
  content: string;
  totalPages: number;
}

export interface AnalysisProgress {
  currentTag: number;
  totalTags: number;
  isProcessing: boolean;
  hasError: boolean;
}
