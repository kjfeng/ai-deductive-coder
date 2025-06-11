import React from 'react';
import { AnalysisProgress } from '../types';

interface AnalysisProgressProps {
  progress: AnalysisProgress;
  currentTagName?: string;
}

const AnalysisProgressComponent: React.FC<AnalysisProgressProps> = ({
  progress,
  currentTagName
}) => {
    console.log("[progress]", progress)
  const progressPercentage = progress.totalTags > 0 
    ? ((progress.currentTag - 1) / progress.totalTags) * 100 
    : 0;

  if (!progress.isProcessing && progress.currentTag === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          🔍 Analyzing Document
        </h3>
        {progress.isProcessing && (
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <span className="text-lg animate-pulse">⏳</span>
            <span>Processing...</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="text-gray-600 leading-relaxed">
          {progress.isProcessing ? (
            <>
              Analyzing tag <strong>{progress.currentTag}</strong> of <strong>{progress.totalTags}</strong>
              {currentTagName && (
                <div className="mt-2 text-blue-600 text-sm">
                  Current tag: <em>"{currentTagName}"</em>
                </div>
              )}
            </>
          ) : (
            <>
              Completed analysis of <strong>{progress.totalTags}</strong> tag{progress.totalTags !== 1 ? 's' : ''}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="font-semibold text-blue-600 text-sm min-w-[40px] text-right">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {!progress.isProcessing && progress.currentTag > 0 && !progress.hasError && (
        <div className="flex items-center gap-2 text-green-600 font-semibold p-2 bg-green-50 border border-green-200 rounded">
          <span className="text-lg">✅</span>
          Analysis complete!
        </div>
      )} 
    </div>
  );
};

export default AnalysisProgressComponent;
