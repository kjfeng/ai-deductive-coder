import React, { useState } from 'react';
import { Tag } from '../types';

interface ResultsProps {
  tags: Tag[];
  documentName: string;
}

const Results: React.FC<ResultsProps> = ({ tags, documentName }) => {
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  const toggleExpanded = (tagId: string) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedTags(newExpanded);
  };

  const completedTags = tags.filter(tag => tag.status === 'completed' || tag.status === 'no-results');
  const tagsWithResults = completedTags.filter(tag => tag.quotes.length > 0);
  const tagsWithoutResults = completedTags.filter(tag => tag.quotes.length === 0);

  const exportResults = () => {
    const results = {
      document: documentName,
      analyzedAt: new Date().toISOString(),
      tags: completedTags.map(tag => ({
        name: tag.name,
        description: tag.description,
        quotesFound: tag.quotes.length,
        quotes: tag.quotes
      }))
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coding-results-${documentName.replace('.pdf', '')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (completedTags.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          📊 Analysis Results
        </h2>
        <button 
          onClick={exportResults} 
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
        >
          📥 Export Results
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{tagsWithResults.length}</div>
            <div className="text-gray-600 text-sm mt-1">Tags with matches</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-500">{tagsWithoutResults.length}</div>
            <div className="text-gray-600 text-sm mt-1">Tags without matches</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {tagsWithResults.reduce((total, tag) => total + tag.quotes.length, 0)}
            </div>
            <div className="text-gray-600 text-sm mt-1">Total quotes found</div>
          </div>
        </div>
      </div>

      {tagsWithResults.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
            🎯 Tags with Relevant Quotes
          </h3>
          <div className="space-y-4">
            {tagsWithResults.map((tag) => (
              <div key={tag.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(tag.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl flex-shrink-0">✅</span>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{tag.name}</h4>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{tag.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium text-sm">
                        {tag.quotes.length} quote{tag.quotes.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {expandedTags.has(tag.id) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {expandedTags.has(tag.id) && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="space-y-3">
                      {tag.quotes.map((quote, index) => (
                        <div key={index}>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Quote {index + 1}
                          </div>
                          <div className="bg-white p-3 rounded border-l-3 border-l-blue-500 italic leading-relaxed text-gray-700">
                            "{quote}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tagsWithoutResults.length > 0 && (
        <div>
          <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
            ❌ Tags without Relevant Quotes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tagsWithoutResults.map((tag) => (
              <div key={tag.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden border-l-4 border-l-red-500">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">❌</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{tag.name}</h4>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{tag.description}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 text-center text-gray-500 italic text-sm bg-gray-50 border-t border-gray-200">
                  No relevant content found in the document
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
