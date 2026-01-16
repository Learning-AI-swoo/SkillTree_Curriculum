import React, { useMemo } from 'react';
import { Course } from '../types';

interface CategoryTrackerProps {
  courses: Course[];
  completedCourses: Set<string>;
}

export const CategoryTracker: React.FC<CategoryTrackerProps> = ({ courses, completedCourses }) => {
  const stats = useMemo(() => {
    const categories: Record<string, { total: number; completed: number }> = {};

    courses.forEach(course => {
      const cat = course.category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = { total: 0, completed: 0 };
      }
      categories[cat].total++;
      if (completedCourses.has(course.id)) {
        categories[cat].completed++;
      }
    });

    return Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]));
  }, [courses, completedCourses]);

  if (stats.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-10 bg-gray-800/90 backdrop-blur-sm border border-gray-700 p-4 rounded-xl shadow-xl max-w-[280px] w-full animate-in fade-in slide-in-from-top-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex justify-between items-center border-b border-gray-700 pb-2">
        <span>Progress Breakdown</span>
        <span className="text-emerald-400 font-mono">{completedCourses.size}/{courses.length}</span>
      </h3>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {stats.map(([category, { total, completed }]) => {
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          const isComplete = total > 0 && completed === total;
          
          return (
            <div key={category}>
              <div className="flex justify-between text-xs mb-1.5 items-end">
                <span className={`font-medium truncate pr-2 ${isComplete ? 'text-emerald-300' : 'text-gray-300'}`}>
                  {category}
                </span>
                <span className="text-gray-500 font-mono text-[10px]">{completed} / {total}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isComplete ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
