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

  // Helper function to create fingerprint for existing tags without one
  const createTagFingerprint = (name: string, description: string): string => {
    const content = `${name.trim()}|${description.trim()}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  };

  // Ensure all tags have fingerprints (for backwards compatibility)
  const ensureTagFingerprints = useCallback((tagsToCheck: Tag[]): Tag[] => {
    return tagsToCheck.map(tag => ({
      ...tag,
      fingerprint: tag.fingerprint || createTagFingerprint(tag.name, tag.description)
    }));
  }, []);

  const startAnalysis = async () => {
    if (!document || !aiConfig || tags.length === 0) {
      alert('Please upload a document, configure AI settings, and add tags before starting analysis.');
      return;
    }

    // Ensure all tags have fingerprints for comparison
    const tagsWithFingerprints = ensureTagFingerprints(tags);
    if (tagsWithFingerprints !== tags) {
      setTags(tagsWithFingerprints);
    }

    // Identify which tags need analysis (new or modified)
    const tagsNeedingAnalysis = tagsWithFingerprints.filter(tag => 
      !tag.fingerprint || 
      tag.status === 'idle' || 
      tag.status === 'error' ||
      (tag.status === 'completed' && tag.quotes.length === 0) ||
      (tag.status === 'no-results' && tag.quotes.length === 0)
    );

    const totalTagsToProcess = tagsNeedingAnalysis.length;
    const totalTagsSkipped = tags.length - totalTagsToProcess;

    if (totalTagsToProcess === 0) {
      alert('All tags have already been analyzed and are up to date.');
      return;
    }

    if (totalTagsSkipped > 0) {
      console.log(`Skipping ${totalTagsSkipped} unchanged tag(s), click to analyze ${totalTagsToProcess} new/modified tag(s)`);
    }

    setProgress({
      currentTag: 1,
      totalTags: totalTagsToProcess,
      isProcessing: true,
      hasError: false,
    });

    // Only reset tags that need analysis
    const updatedTags = tagsWithFingerprints.map(tag => {
      if (tagsNeedingAnalysis.some(t => t.id === tag.id)) {
        return { ...tag, status: 'idle' as const };
      }
      return tag; // Keep existing results for unchanged tags
    });
    setTags(updatedTags);

    const aiService = new AIService(aiConfig);

    try {
      for (let i = 0; i < tagsNeedingAnalysis.length; i++) {
        const tag = tagsNeedingAnalysis[i];
        
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
          if (i < tagsNeedingAnalysis.length - 1) {
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
  
  // Calculate how many tags need analysis for the button display
  const getAnalysisInfo = () => {
    if (!canStartAnalysis) return { needsAnalysis: 0, total: tags.length };
    
    const tagsWithFingerprints = ensureTagFingerprints(tags);
    const tagsNeedingAnalysis = tagsWithFingerprints.filter(tag => 
      !tag.fingerprint || 
      tag.status === 'idle' || 
      tag.status === 'error' ||
      (tag.status === 'completed' && tag.quotes.length === 0) ||
      (tag.status === 'no-results' && tag.quotes.length === 0)
    );
    
    return { 
      needsAnalysis: tagsNeedingAnalysis.length, 
      total: tags.length,
      allUpToDate: tagsNeedingAnalysis.length === 0
    };
  };

  const analysisInfo = getAnalysisInfo();
  const currentTag = progress.isProcessing && progress.currentTag > 0 
    ? tags[progress.currentTag - 1] 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12 p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">🔍 AI Deductive Coding</h1>
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
                {analysisInfo.allUpToDate ? (
                  <div className="space-y-3">
                    <div className="text-green-600 font-medium">
                      ✅ All {analysisInfo.total} tag{analysisInfo.total !== 1 ? 's are' : ' is'} up to date
                    </div>
                    <button 
                      onClick={startAnalysis} 
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      🔄 Re-analyze All Tags
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysisInfo.needsAnalysis < analysisInfo.total && (
                      <div className="text-blue-600 text-sm">
                        {analysisInfo.total - analysisInfo.needsAnalysis} tag{analysisInfo.total - analysisInfo.needsAnalysis !== 1 ? 's' : ''} already completed, 
                        analyzing {analysisInfo.needsAnalysis} new/modified tag{analysisInfo.needsAnalysis !== 1 ? 's' : ''}
                      </div>
                    )}
                    <button 
                      onClick={startAnalysis} 
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      🚀 Start Analysis
                      {analysisInfo.needsAnalysis < analysisInfo.total && 
                        ` (${analysisInfo.needsAnalysis} tag${analysisInfo.needsAnalysis !== 1 ? 's' : ''})`
                      }
                    </button>
                  </div>
                )}
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
