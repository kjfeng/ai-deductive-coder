import React, { useState } from 'react';
import { Tag } from '../types';

interface TagManagerProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  isProcessing: boolean;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onTagsChange,
  isProcessing
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');

  const addTag = () => {
    if (newTagName.trim() && newTagDescription.trim()) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
        description: newTagDescription.trim(),
        status: 'idle',
        quotes: []
      };
      
      onTagsChange([...tags, newTag]);
      setNewTagName('');
      setNewTagDescription('');
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  const getStatusIcon = (status: Tag['status']) => {
    switch (status) {
      case 'processing':
        return <span className="text-xl animate-pulse">⏳</span>;
      case 'completed':
        return <span className="text-xl text-green-500">✅</span>;
      case 'no-results':
        return <span className="text-xl text-red-500">❌</span>;
      default:
        return <span className="text-xl text-gray-400">⚪</span>;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🏷️ Coding Tags
      </h2>
      
      <div className="mb-8">
        <div className="flex flex-col gap-3 max-w-2xl">
          <input
            type="text"
            placeholder="Tag name (e.g., 'CBRN risks')"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
          <textarea
            placeholder="Tag description (e.g., 'References CBRN (Chemical, Biological, Radiological, Nuclear) risks.')"
            value={newTagDescription}
            onChange={(e) => setNewTagDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            rows={2}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical min-h-[60px] disabled:bg-gray-100"
          />
          <button
            onClick={addTag}
            disabled={!newTagName.trim() || !newTagDescription.trim() || isProcessing}
            className="self-start px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Add Tag
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Tags ({tags.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <div key={tag.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tag.status)}
                    <span className="font-semibold text-gray-800">{tag.name}</span>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{tag.description}</p>
                {tag.quotes.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <strong className="text-sm text-gray-700">Found {tag.quotes.length} relevant quote{tag.quotes.length !== 1 ? 's' : ''}:</strong>
                    <div className="mt-2">
                      {tag.quotes.slice(0, 2).map((quote, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-xs italic text-gray-600 mb-1 leading-snug">
                          "{quote.substring(0, 100)}{quote.length > 100 ? '...' : ''}"
                        </div>
                      ))}
                      {tag.quotes.length > 2 && (
                        <div className="text-blue-500 text-xs font-medium">+ {tag.quotes.length - 2} more quote{tag.quotes.length - 2 !== 1 ? 's' : ''}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
