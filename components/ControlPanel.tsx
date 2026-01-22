import React from 'react';

interface ControlPanelProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: 'all' | 'next' | 'completed') => void;
  currentFilter: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onSearch, 
  onFilterChange,
  currentFilter 
}) => {
  return (
    <div className="bg-white border-r border-gray-200 w-full h-full flex flex-col shadow-xl overflow-hidden">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          SkillTree
        </h1>

        {/* Search & Filter Section */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
          />
          
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            {(['all', 'next', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${
                  currentFilter === f 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'next' ? 'Available' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <p className="font-semibold text-blue-800 mb-1">Welcome!</p>
          <p className="leading-relaxed">
            Select courses to track your progress. The map updates automatically to show you what unlocks next.
          </p>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></div>
            <span className="text-gray-600 font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-500"></div>
            <span className="text-gray-600 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></div>
            <span className="text-gray-500">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-dashed border-purple-500 rounded-full bg-purple-50"></div>
            <span className="text-gray-500">Milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
};