import React, { useState } from 'react';
import { Course } from '../types';
import { parseCSV, EXAMPLE_CSV } from '../services/csvService';

interface ControlPanelProps {
  onLoadData: (courses: Course[]) => void;
  onGenerate: (topic: string) => Promise<void>;
  onSearch: (query: string) => void;
  onFilterChange: (filter: 'all' | 'next' | 'completed') => void;
  isGenerating: boolean;
  currentFilter: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onLoadData, 
  onGenerate, 
  onSearch, 
  onFilterChange,
  isGenerating,
  currentFilter 
}) => {
  const [topic, setTopic] = useState('');
  const [csvInput, setCsvInput] = useState(EXAMPLE_CSV);
  const [activeTab, setActiveTab] = useState<'editor' | 'ai'>('ai');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLoadCsv = () => {
    try {
      const courses = parseCSV(csvInput);
      if (courses.length === 0) throw new Error("No valid courses found. Check format.");
      onLoadData(courses);
      setError(null);
    } catch (e) {
      setError((e as Error).message || "Invalid CSV format");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    try {
      setError(null);
      await onGenerate(topic);
    } catch (e) {
      setError("Failed to generate. Check API Key.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-md border-r border-gray-700 w-full h-full flex flex-col shadow-2xl overflow-hidden">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6">
          SkillTree
        </h1>

        {/* Search & Filter Section */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search courses..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          
          <div className="flex bg-gray-900 rounded-lg p-1">
            {(['all', 'next', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                  currentFilter === f ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f === 'next' ? 'Available' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-900 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'ai' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            AI Generator
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'editor' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            CSV Data
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'ai' ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-gray-400">
              Ask Gemini to build a curriculum for you. Try "Potion Brewing", "Quantum Physics", or "React Developer".
            </p>
            <form onSubmit={handleGenerate} className="flex flex-col gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic..."
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isGenerating || !topic}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-900/50 transition-all flex justify-center items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Thinking...
                  </>
                ) : (
                  "Generate Pathway"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4 h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-xs text-gray-400 bg-gray-900/50 p-3 rounded border border-gray-700">
              <p className="font-bold mb-1">Spreadsheet Format:</p>
              <code>Course Code, Title, Prerequisites, Category, Description</code>
              <p className="mt-1 opacity-75">Separate multiple prerequisites with a semicolon (;).</p>
              
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="font-bold text-emerald-400 mb-1">Tips for Complex Requirements:</p>
                <p className="opacity-80">
                  For abstract rules like "3 courses in Category X", create a 
                  <span className="font-mono text-purple-400"> Milestone</span> or 
                  <span className="font-mono text-purple-400"> Requirement</span> category node.
                  <br/><br/>
                  Example: Create a node "Basic Training" with category "Milestone". Manually check it off when satisfied.
                </p>
              </div>
            </div>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="flex-1 min-h-[200px] bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs font-mono text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none whitespace-pre"
              spellCheck={false}
              placeholder="Paste your CSV data here..."
            />
            <button
              onClick={handleLoadCsv}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-emerald-900/50 transition-all"
            >
              Load Data
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-700 bg-gray-800">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-gray-300">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <span className="text-gray-500">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 border border-dashed border-purple-500 rounded-full"></div>
            <span className="text-gray-400">Milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
