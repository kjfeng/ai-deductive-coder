import React, { useState, useCallback } from 'react';
import DocumentUpload from './components/DocumentUpload';
import TagManager from './components/TagManager';
import AIConfiguration from './components/AIConfiguration';
import AnalysisProgress from './components/AnalysisProgress';
import Results from './components/Results';
import { parsePDF } from './utils/pdfParser';
import { AIService } from './services/aiService';
import { Tag, AIConfig, Document, AnalysisProgress as AnalysisProgressType } from './types';

function App() {
  const [document, setDocument] = useState<Document | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null);
  const [progress, setProgress] = useState<AnalysisProgressType>({
    currentTag: 0,
    totalTags: 0,
    isProcessing: false,
    hasError: false,
  });

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const parsedDocument = await parsePDF(file);
      setDocument(parsedDocument);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error parsing PDF file: ${errorMessage}\n\nPlease make sure it's a valid PDF file and try again.`);
    }
  }, []);

  const handleTagsChange = useCallback((newTags: Tag[]) => {
    setTags(newTags);
  }, []);

  const handleConfigChange = useCallback((config: AIConfig) => {
    setAIConfig(config);
  }, []);

  const startAnalysis = async () => {
    if (!document || !aiConfig || tags.length === 0) {
      alert('Please upload a document, configure AI settings, and add tags before starting analysis.');
      return;
    }

    setProgress({
      currentTag: 1,
      totalTags: tags.length,
      isProcessing: true,
      hasError: false,
    });

    // Reset all tags to idle status
    const resetTags = tags.map(tag => ({ ...tag, status: 'idle' as const, quotes: [] }));
    setTags(resetTags);

    const aiService = new AIService(aiConfig);

    try {
      for (let i = 0; i < tags.length; i++) {
        const tag = resetTags[i];
        
        // Update current tag being processed
        setProgress(prev => ({ ...prev, currentTag: i + 1 }));
        
        // Update tag status to processing
        setTags(currentTags => 
          currentTags.map(t => 
            t.id === tag.id ? { ...t, status: 'processing' } : t
          )
        );

        try {
          const quotes = await aiService.analyzeTag(document.content, tag);
          
          // Update tag with results
          setTags(currentTags => 
            currentTags.map(t => 
              t.id === tag.id 
                ? { 
                    ...t, 
                    status: quotes.length > 0 ? 'completed' : 'no-results',
                    quotes 
                  }
                : t
            )
          );

          // Small delay between requests to avoid rate limiting
          if (i < tags.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error analyzing tag "${tag.name}":`, error);
          
          // Mark tag as failed
          setTags(currentTags => 
            currentTags.map(t => 
              t.id === tag.id ? { ...t, status: 'error' } : t
            )
          );
          
          // Mark progress as having errors
          setProgress(prev => ({ ...prev, hasError: true }));
          
          console.error('Analysis failed:', error);
          alert('Analysis failed. Please check your AI configuration and try again.');
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please check your AI configuration and try again.');
    } finally {
      setProgress(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const canStartAnalysis = document && aiConfig && tags.length > 0 && !progress.isProcessing;
  const currentTag = progress.isProcessing && progress.currentTag > 0 
    ? tags[progress.currentTag - 1] 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12 p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">🔍 AI Deductive Qualitative Coding</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Upload a PDF document, define coding tags, and let AI identify relevant quotes automatically
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <DocumentUpload
              onFileUpload={handleFileUpload}
              isProcessing={progress.isProcessing}
              document={document ? { name: document.name, totalPages: document.totalPages } : null}
            />

            <TagManager
              tags={tags}
              onTagsChange={handleTagsChange}
              isProcessing={progress.isProcessing}
            />

            <AIConfiguration
              config={aiConfig}
              onConfigChange={handleConfigChange}
              isProcessing={progress.isProcessing}
            />

            {canStartAnalysis && (
              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <button 
                  onClick={startAnalysis} 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  🚀 Start Analysis
                </button>
              </div>
            )}
          </div>

          <AnalysisProgress 
            progress={progress}
            currentTagName={currentTag?.name}
          />

          <Results 
            tags={tags}
            documentName={document?.name || ''}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
