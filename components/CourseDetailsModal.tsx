import React from 'react';
import { Course } from '../types';

interface CourseDetailsModalProps {
  course: Course | null;
  onClose: () => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ course, onClose }) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-mono text-blue-600 font-bold mb-1">{course.id}</div>
              <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
              {course.category && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700 font-medium">
                  {course.category}
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {course.description || "No description provided for this course."}
            </p>
          </div>

          {course.prerequisites.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {course.prerequisites.map(pre => (
                  <span key={pre} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600 font-medium">
                    {pre}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {course.objectives && course.objectives.length > 0 && (
            <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Learning Objectives</h3>
               <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                 {course.objectives.map((obj, i) => (
                   <li key={i}>{obj}</li>
                 ))}
               </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium text-sm shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};