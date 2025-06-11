import React, { useState } from 'react';
import { AIConfig } from '../types';

interface AIConfigurationProps {
  config: AIConfig | null;
  onConfigChange: (config: AIConfig) => void;
  isProcessing: boolean;
}

const AIConfiguration: React.FC<AIConfigurationProps> = ({
  config,
  onConfigChange,
  isProcessing
}) => {
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [provider, setProvider] = useState<AIConfig['provider']>(config?.provider || 'openai');
  const [model, setModel] = useState(config?.model || '');
  const [endpoint, setEndpoint] = useState(config?.endpoint || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      const newConfig: AIConfig = {
        apiKey: apiKey.trim(),
        provider,
        model: model.trim() || getDefaultModel(provider),
        endpoint: provider === 'custom' ? endpoint.trim() : undefined
      };
      onConfigChange(newConfig);
    }
  };

  const getDefaultModel = (provider: AIConfig['provider']): string => {
    switch (provider) {
      case 'openai':
        return 'gpt-4o';
      case 'anthropic':
        return 'claude-sonnet-4-20250514';
      case 'custom':
        return 'custom-model';
      default:
        return 'gpt-4o';
    }
  };

  const isConfigValid = () => {
    if (!apiKey.trim()) return false;
    if (provider === 'custom' && !endpoint.trim()) return false;
    return true;
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🤖 AI Configuration
      </h2>
      
      <div className="max-w-lg bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as AIConfig['provider'];
                setProvider(newProvider);
                setModel(getDefaultModel(newProvider));
              }}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="custom">Custom Endpoint</option>
            </select>
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={isProcessing}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <input
              id="model"
              type="text"
              placeholder={`Default (if blank): ${getDefaultModel(provider)}`}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            />
            <small className="text-xs text-gray-500 mt-1 block">
              {provider === 'openai' && 'e.g., gpt-4, gpt-4o, o1-mini'}
              {provider === 'anthropic' && 'e.g., claude-sonnet-4-0, claude-3-7-sonnet-latest'}
              {provider === 'custom' && 'Enter your custom model name'}
            </small>
          </div>

          {provider === 'custom' && (
            <div>
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-2">Custom Endpoint</label>
              <input
                id="endpoint"
                type="url"
                placeholder="https://your-api-endpoint.com/v1/chat"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!isConfigValid() || isProcessing}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {config ? 'Update Configuration' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {config && (
        <div className="mt-4 max-w-lg p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-500 text-lg">✅</span>
            <span className="font-medium text-green-800">AI configuration saved</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Provider:</strong> {config.provider}</p>
            <p><strong>Model:</strong> {config.model}</p>
            {config.endpoint && <p><strong>Endpoint:</strong> {config.endpoint}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfiguration;
