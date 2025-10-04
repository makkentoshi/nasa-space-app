"use client";

import React, { useState } from 'react';
import type { AIQueryResponse } from '@/app/types';

interface AIChatProps {
  onQuery: (query: string) => Promise<void>;
  response?: AIQueryResponse;
  loading?: boolean;
  error?: string;
  className?: string;
}

export default function AIChat({ onQuery, response, loading, error, className = '' }: AIChatProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    await onQuery(query);
    // Don't clear query to allow user to refine it
  };

  const suggestedQuestions = [
    "Is it likely to rain during my outdoor event?",
    "What are the chances of extreme heat?",
    "Should I be worried about high winds?",
    "Is this a good day for a parade?",
  ];

  return (
    <div className={`${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      >
        <span className="text-xl">🤖</span>
        <span className="font-semibold">Ask AI</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold text-lg">ForecastGPT-5</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!response && !loading && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Ask me about weather conditions, probabilities, and recommendations for your location and date.
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Suggested questions:</p>
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(q)}
                      className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded-md transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                {/* Answer */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Answer</p>
                  <p className="text-sm text-gray-800">{response.answer}</p>
                </div>

                {/* Explanation */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Technical Explanation</p>
                  <p className="text-xs text-gray-700">{response.explanation}</p>
                </div>

                {/* Recommended Actions */}
                {response.recommended_actions.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-xs font-semibold text-green-800 mb-2">Recommended Actions</p>
                    <ul className="list-disc list-inside space-y-1">
                      {response.recommended_actions.map((action, idx) => (
                        <li key={idx} className="text-xs text-gray-700">{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Confidence Score */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Confidence:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${response.confidence_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold">{(response.confidence_score * 100).toFixed(0)}%</span>
                </div>

                {/* Download Links */}
                {response.downloadable && (
                  <div className="flex gap-2 flex-wrap">
                    {response.downloadable.csv_url && (
                      <a
                        href={response.downloadable.csv_url}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition"
                        download
                      >
                        📄 CSV
                      </a>
                    )}
                    {response.downloadable.json_url && (
                      <a
                        href={response.downloadable.json_url}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition"
                        download
                      >
                        📊 JSON
                      </a>
                    )}
                  </div>
                )}

                {/* Sources */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Sources</p>
                  {response.sources.map((src, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {src.dataset}
                      </a>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about weather conditions..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
