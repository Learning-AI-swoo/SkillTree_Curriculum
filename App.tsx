import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { ControlPanel } from './components/ControlPanel';
import { CourseDetailsModal } from './components/CourseDetailsModal';
import { CategoryTracker } from './components/CategoryTracker';
import CourseNode from './components/CourseNode';
import { Course } from './types';

// --- HARDCODED DATA SECTION ---
// MBA Curriculum Data
const INITIAL_COURSES: Course[] = [
  { id: "MBA 601", title: "Business Statistics and Analytics", prerequisites: [], category: "Core - STEM", description: "Foundational training in statistical analysis and data-driven business reporting. Covers descriptive and inferential statistics, probability distributions, hypothesis testing, regression analysis, data visualization, and data ethics." },
  { id: "MBA 602", title: "Managerial Accounting and Financial Analysis", prerequisites: [], category: "Core - STEM", description: "Quantitative methods in accounting including measurement, analysis, and modeling of accounting information for management decision-making. Covers cost-volume-profit analysis, capital budgeting models, variance analysis, and performance measurement." },
  { id: "MBA 609", title: "Business Law Ethics and Regulatory Compliance", prerequisites: [], category: "Core - Non-STEM", description: "Legal and regulatory environment of business including contract law, employment law, corporate governance, and ethical decision-making frameworks." },
  { id: "MBA 603", title: "Financial Management and Modeling", prerequisites: ["MBA 602"], category: "Core - STEM", description: "Quantitative methods in corporate finance including financial modeling, valuation techniques, and analytical decision-making for resource allocation. Covers capital structure decisions, investment analysis, portfolio optimization, and risk management." },
  { id: "MBA 604", title: "Managerial Economics and Quantitative Analysis", prerequisites: ["MBA 601"], category: "Core - STEM", description: "Quantitative economic analysis and mathematical modeling for business decision-making. Covers econometric methods, optimization techniques, demand estimation, pricing optimization, and game theory applications." },
  { id: "MBA 608", title: "Business Information Systems and Technology Analytics", prerequisites: ["MBA 601"], category: "Core - STEM", description: "Information systems, database management, and technology analytics from a managerial perspective. Covers SQL, database design, business intelligence tools, data warehousing, cloud computing, and AI applications in business." },
  { id: "MBA 605", title: "Marketing Analytics and Data-Driven Strategy", prerequisites: ["MBA 601", "MBA 604"], category: "Core - STEM", description: "Marketing strategy with quantitative market research, customer analytics, and data-driven decision-making. Covers market segmentation, customer lifetime value modeling, marketing mix optimization, A/B testing, and ROI measurement." },
  { id: "MBA 611", title: "Operations Management and Process Analytics", prerequisites: ["MBA 601", "MBA 604"], category: "Core - STEM", description: "Quantitative methods and analytical techniques for operations management including process analysis, capacity planning, inventory optimization, supply chain modeling, and statistical process control." },
  { id: "MBA 606", title: "Organizational Behavior and Leadership", prerequisites: [], category: "Core - Non-STEM", description: "Analysis of individual and group behavior in organizations through understanding of organizational change management, leadership development, team dynamics, organizational culture, and leading diverse cross-cultural teams." },
  { id: "MBA 607", title: "Strategic Management and Competitive Analysis", prerequisites: ["MBA 602", "MBA 603", "MBA 605"], category: "Core - Non-STEM", description: "Integration of functional business areas with emphasis on strategic planning, competitive positioning, and strategy implementation. Covers industry analysis, organizational capabilities assessment, and strategy formulation." },
  { id: "MBA 610", title: "Global Business Management", prerequisites: ["MBA 604"], category: "Core - Non-STEM", description: "Cultural, economic, and political factors in international business. Covers global strategy development, cross-cultural management, international market entry modes, global supply chain, and ethical decision-making across cultural environments." },
  { id: "REQ_8CORE", title: "8 Core Courses Complete", prerequisites: [], category: "Milestone", description: "Check when you have completed any 8 of the 12 core courses (MBA 601-612)." },
  { id: "MBA 612", title: "Capstone Project Planning and Development", prerequisites: ["REQ_8CORE"], category: "Core - STEM", description: "Preparation for MBA capstone through applied business research methodology, quantitative analysis techniques, and strategic planning frameworks. Culminates in comprehensive capstone project proposal." },
  { id: "MBA 702", title: "Healthcare Finance and Quantitative Reimbursement Analysis", prerequisites: ["MBA 602", "MBA 603"], category: "Elective - STEM", description: "Quantitative financial analysis for healthcare organizations including reimbursement modeling, revenue cycle analytics, healthcare cost accounting, and financial forecasting." },
  { id: "MBA 703", title: "Healthcare Operations and Quality Analytics", prerequisites: ["MBA 611"], category: "Elective - STEM", description: "Operations research and statistical methods for healthcare operations including Lean Six Sigma, statistical process control, patient flow optimization, and quality metrics analysis." },
  { id: "MBA 704", title: "Healthcare Information Systems and Health Analytics", prerequisites: ["MBA 608"], category: "Elective - STEM", description: "Health information systems, EHR, and healthcare data analytics including clinical analytics, population health management, and healthcare business intelligence." },
  { id: "MBA 720", title: "Financial Markets and Investment Analysis", prerequisites: ["MBA 603"], category: "Elective - STEM", description: "Quantitative tools for securities analysis and portfolio management including asset valuation, portfolio theory, risk analytics, and investment strategies." },
  { id: "MBA 730", title: "International Trade Finance and Economic Modeling", prerequisites: ["MBA 603", "MBA 604"], category: "Elective - STEM", description: "Quantitative methods in international finance and trade economics including exchange rate modeling, international capital budgeting, and econometric analysis." },
  { id: "MBA 750", title: "Entrepreneurship and New Venture Analytics", prerequisites: [], category: "Elective - STEM", description: "Entrepreneurship through an analytical lens including venture evaluation, financial modeling for startups, market analysis, and startup metrics. Recommended elective." },
  { id: "MBA 701", title: "Healthcare Administration and Management Systems", prerequisites: [], category: "Elective - Non-STEM", description: "Healthcare delivery systems, organizational structures, and management practices including healthcare policy, regulatory compliance, and patient safety." },
  { id: "MBA 710", title: "Human Resource Management and Workforce Analytics", prerequisites: ["MBA 606"], category: "Elective - Non-STEM", description: "Human resource management including recruitment, training, performance management, compensation, and employee relations." },
  { id: "MBA 740", title: "Business Policy Strategic Planning and Competitive Analytics", prerequisites: ["REQ_8CORE"], category: "Elective - Non-STEM", description: "Integrative strategic analysis at the enterprise level including industry analysis, corporate strategy, and strategic implementation." },
  { id: "REQ_3ELEC", title: "3 Electives Complete", prerequisites: [], category: "Milestone", description: "Check when you have completed any 3 elective courses (minimum 12 credits from STEM electives required for program designation)." },
  { id: "MBA 795", title: "MBA Capstone Project", prerequisites: ["MBA 612", "REQ_3ELEC"], category: "Capstone - STEM", description: "Culminating academic experience integrating analytical methods, quantitative techniques, and strategic frameworks. Applied business research on real-world problems requiring statistical analysis and data-driven strategic recommendations." }
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
      setCenter(matchingNode.position.x + 140, matchingNode.position.y + 70, { zoom: 1.2, duration: 800 });
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
      {/* Light Gray Dots for Day Theme */}
      <Background color="#9ca3af" gap={24} size={1} />
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
  const [courses] = useState<Course[]>(INITIAL_COURSES);
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'next' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- FIXED RESET LOGIC ---
  // Using a ref ensures the 'handleResetProgress' function always has access 
  // to the latest 'completedCourses' state without triggering re-renders 
  // that might confuse the React Flow Controls component.
  const completedCoursesRef = useRef(completedCourses);
  useEffect(() => {
    completedCoursesRef.current = completedCourses;
  }, [completedCourses]);

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
    const count = completedCoursesRef.current.size;
    if (count === 0) {
      alert("No progress to reset.");
      return;
    }
    
    if (window.confirm(`Reset progress for ${count} courses?`)) {
      setCompletedCourses(new Set());
    }
  }, []); // Empty dependency array ensures the function identity never changes

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className="w-80 md:w-96 shrink-0 z-20 relative h-full shadow-lg">
        <ControlPanel 
          onSearch={setSearchQuery}
          onFilterChange={setFilterMode}
          currentFilter={filterMode}
        />
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 h-full relative">
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <h2 className="text-3xl font-black text-gray-900/10 select-none uppercase tracking-widest">
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