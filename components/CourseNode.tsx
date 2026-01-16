import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CourseNodeData } from '../types';

// Icons
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const UnlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CourseNode = ({ data }: NodeProps<CourseNodeData>) => {
  const { course, status, onToggle, onDetails, isDimmed } = data;

  const isMilestone = course.category?.toLowerCase() === 'milestone' || 
                     course.category?.toLowerCase() === 'requirement';

  // Style configurations based on status
  const styles = {
    locked: {
      wrapper: "bg-gray-800 border-gray-600 text-gray-500",
      icon: <LockIcon />,
      glow: "shadow-none",
    },
    unlocked: {
      wrapper: "bg-gray-800 border-blue-500 text-blue-100 hover:border-blue-400",
      icon: <UnlockIcon />,
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    },
    completed: {
      wrapper: "bg-emerald-900 border-emerald-500 text-emerald-100",
      icon: <CheckIcon />,
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    }
  };

  const currentStyle = styles[status];
  
  // Overrides for Milestone/Requirement
  const milestoneClass = isMilestone 
    ? "border-dashed !border-purple-500 !bg-gray-900"
    : "";
  
  const milestoneGlow = (isMilestone && status === 'unlocked') 
    ? "shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
    : currentStyle.glow;

  // Handler for clicking the Checkbox/Status Icon
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (status !== 'locked') {
      onToggle(course.id);
    }
  };

  // Handler for clicking the body
  const handleBodyClick = () => {
    onDetails(course);
  };

  return (
    <div 
      className={`relative w-[240px] rounded-lg border-2 p-3 transition-all duration-300 group
        ${currentStyle.wrapper} ${milestoneGlow} ${milestoneClass}
        ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}
        ${status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={handleBodyClick}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3 -mt-2" />
      
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-mono font-bold uppercase tracking-wider opacity-75 ${isMilestone ? 'text-purple-400' : ''}`}>
          {course.id}
        </span>
        
        {/* Toggle Button */}
        <div 
          onClick={handleToggleClick}
          className={`p-1 rounded-full transition-transform active:scale-90 z-10 
            ${status === 'completed' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-700 hover:bg-gray-600'}
            ${status === 'locked' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          {isMilestone && status !== 'completed' ? <StarIcon /> : currentStyle.icon}
        </div>
      </div>
      
      <h3 className="text-sm font-bold leading-tight mb-2 min-h-[2.5em] flex items-center">
        {course.title}
      </h3>

      <div className="flex justify-between items-center mt-2">
        {course.category && (
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${isMilestone ? 'bg-purple-900/50 text-purple-200' : 'bg-black/30'}`}>
            {course.category}
          </span>
        )}
        <div className="text-gray-400 group-hover:text-white transition-colors">
            <InfoIcon />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3 -mb-2" />
    </div>
  );
};

export default memo(CourseNode);
