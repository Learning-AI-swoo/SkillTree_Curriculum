import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import ReactFlow, { 
  Background, 
  Controls, 
  ControlButton,
  useNodesState, 
  useEdgesState, 
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import { getLayoutedElements } from './services/layoutService';
import { generateCurriculum } from './services/geminiService';
import { ControlPanel } from './components/ControlPanel';
import { CourseDetailsModal } from './components/CourseDetailsModal';
import { CategoryTracker } from './components/CategoryTracker';
import CourseNode from './components/CourseNode';
import { Course } from './types';

// Initial dummy data
const INITIAL_COURSES: Course[] = [
  { id: "ADV100", title: "Novice Adventuring", prerequisites: [], category: "Basics", description: "The beginning of your journey." },
  { id: "MAG100", title: "Mana Control", prerequisites: ["ADV100"], category: "Magic", description: "Learn to sense the flow of mana." },
  { id: "SWD100", title: "Sword Basics", prerequisites: ["ADV100"], category: "Combat", description: "Keep the pointy end away from you." },
  { id: "REQ_BASICS", title: "Basic Training Complete", prerequisites: [], category: "Milestone", description: "Check this box when you have finished ANY 2 basic courses." },
  { id: "MAG200", title: "Fireball Casting", prerequisites: ["MAG100", "REQ_BASICS"], category: "Magic", description: "It's getting hot in here." },
  { id: "SWD200", title: "Dual Wielding", prerequisites: ["SWD100", "REQ_BASICS"], category: "Combat", description: "Two swords are better than one." },
  { id: "ULT300", title: "Spellblade Mastery", prerequisites: ["MAG200", "SWD200"], category: "Ultimate", description: "The ultimate fusion of steel and sorcery." },
];

const nodeTypes = {
  courseCard: CourseNode,
};

// Wrapper for ReactFlow hooks usage
const FlowArea = ({ 
  courses, 
  completedCourses, 
  filterMode, 
  onToggleCourse, 
  onOpenDetails,
  onResetProgress,
  searchQuery 
}: any) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, setCenter } = useReactFlow();

  // Recalculate Layout
  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(
      courses,
      completedCourses,
      filterMode,
      onToggleCourse,
      onOpenDetails
    );
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [courses, completedCourses, filterMode, onToggleCourse, onOpenDetails, setNodes, setEdges]);

  // Handle Search Zoom
  useEffect(() => {
    if (!searchQuery) return;
    
    const matchingNode = nodes.find(n => 
      n.data.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.data.course.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingNode) {
      setCenter(matchingNode.position.x + 120, matchingNode.position.y + 60, { zoom: 1.2, duration: 800 });
    }
  }, [searchQuery, nodes, setCenter]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-right"
      minZoom={0.2}
      maxZoom={2.0}
    >
      <Background color="#374151" gap={24} size={2} />
      <Controls>
        <ControlButton onClick={onResetProgress} title="Reset Progress">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </ControlButton>
      </Controls>
    </ReactFlow>
  );
};

const App = () => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'next' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleCourse = useCallback((courseId: string) => {
    setCompletedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }, []);

  const handleResetProgress = useCallback(() => {
    // Provide feedback if there's nothing to reset, otherwise the button feels broken
    if (completedCourses.size === 0) {
      alert("No progress to reset.");
      return;
    }
    if (window.confirm("Reset all progress? This will uncheck all completed courses.")) {
      setCompletedCourses(new Set());
    }
  }, [completedCourses]);

  const handleLoadData = (newCourses: Course[]) => {
    setCourses(newCourses);
    setCompletedCourses(new Set());
  };

  const handleGenerate = async (topic: string) => {
    setIsGenerating(true);
    try {
      const generatedCourses = await generateCurriculum(topic);
      if (generatedCourses.length > 0) {
        setCourses(generatedCourses);
        setCompletedCourses(new Set());
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate. Check console/API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 md:w-96 shrink-0 z-20 relative h-full">
        <ControlPanel 
          onLoadData={handleLoadData} 
          onGenerate={handleGenerate}
          onSearch={setSearchQuery}
          onFilterChange={setFilterMode}
          currentFilter={filterMode}
          isGenerating={isGenerating}
        />
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 h-full relative">
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <h2 className="text-3xl font-black text-gray-800/20 select-none uppercase tracking-widest">
            Map View
          </h2>
        </div>

        <CategoryTracker courses={courses} completedCourses={completedCourses} />
        
        <FlowArea 
          courses={courses}
          completedCourses={completedCourses}
          filterMode={filterMode}
          onToggleCourse={handleToggleCourse}
          onOpenDetails={setSelectedCourse}
          onResetProgress={handleResetProgress}
          searchQuery={searchQuery}
        />
      </div>

      {/* Modal Overlay */}
      <CourseDetailsModal 
        course={selectedCourse} 
        onClose={() => setSelectedCourse(null)} 
      />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
);

export default App;