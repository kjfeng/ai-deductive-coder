import React, { useState } from 'react';
import { Tag } from '../types';

// Simple hash function to create fingerprints for tags
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
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagDescription, setEditTagDescription] = useState('');

  const addTag = () => {
    if (newTagName.trim() && newTagDescription.trim()) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
        description: newTagDescription.trim(),
        status: 'idle',
        quotes: [],
        fingerprint: createTagFingerprint(newTagName.trim(), newTagDescription.trim())
      };
      
      onTagsChange([...tags, newTag]);
      setNewTagName('');
      setNewTagDescription('');
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setEditTagDescription(tag.description);
  };

  const cancelEditing = () => {
    setEditingTagId(null);
    setEditTagName('');
    setEditTagDescription('');
  };

  const saveEdit = () => {
    if (editTagName.trim() && editTagDescription.trim() && editingTagId) {
      const newFingerprint = createTagFingerprint(editTagName.trim(), editTagDescription.trim());
      const updatedTags = tags.map(tag =>
        tag.id === editingTagId
          ? { 
              ...tag, 
              name: editTagName.trim(), 
              description: editTagDescription.trim(),
              fingerprint: newFingerprint,
              // Reset status and quotes if the tag content changed
              status: newFingerprint !== tag.fingerprint ? 'idle' as const : tag.status,
              quotes: newFingerprint !== tag.fingerprint ? [] : tag.quotes
            }
          : tag
      );
      onTagsChange(updatedTags);
      cancelEditing();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
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
                {editingTagId === tag.id ? (
                  // Editing mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                      onKeyPress={handleEditKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-semibold"
                    />
                    <textarea
                      value={editTagDescription}
                      onChange={(e) => setEditTagDescription(e.target.value)}
                      onKeyPress={handleEditKeyPress}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={!editTagName.trim() || !editTagDescription.trim()}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tag.status)}
                        <span className="font-semibold text-gray-800">{tag.name}</span>
                      </div>
                      {!isProcessing && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditing(tag)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                            title="Edit tag"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => removeTag(tag.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                            title="Remove tag"
                          >
                            ×
                          </button>
                        </div>
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
                  </>
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
