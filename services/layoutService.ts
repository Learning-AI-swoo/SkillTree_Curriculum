import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';
import { Course, CourseStatus } from '../types';

const nodeWidth = 240;
const nodeHeight = 120; // Approximated height of our custom node

export const getLayoutedElements = (
  courses: Course[],
  completedCourses: Set<string>,
  filterMode: 'all' | 'next' | 'completed',
  onToggle: (id: string) => void,
  onDetails: (course: Course) => void
): { nodes: Node[]; edges: Edge[] } => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set layout direction (Top to Bottom)
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 });

  // 1. Determine Status for each course
  const courseStatusMap = new Map<string, CourseStatus>();
  
  const isUnlocked = (course: Course): boolean => {
    if (completedCourses.has(course.id)) return true; // Already done implies unlocked logic for internal checks
    if (course.prerequisites.length === 0) return true;
    return course.prerequisites.every((prereqId) => completedCourses.has(prereqId));
  };

  courses.forEach(course => {
    if (completedCourses.has(course.id)) {
      courseStatusMap.set(course.id, 'completed');
    } else if (isUnlocked(course)) {
      courseStatusMap.set(course.id, 'unlocked');
    } else {
      courseStatusMap.set(course.id, 'locked');
    }
  });

  // 2. Build Nodes and Edges for Dagre
  courses.forEach((course) => {
    dagreGraph.setNode(course.id, { width: nodeWidth, height: nodeHeight });
  });

  const edges: Edge[] = [];
  courses.forEach((course) => {
    course.prerequisites.forEach((prereqId) => {
      if (courses.find(c => c.id === prereqId)) {
        dagreGraph.setEdge(prereqId, course.id);
        
        const isPathActive = completedCourses.has(prereqId);
        const targetStatus = courseStatusMap.get(course.id);
        
        // Dim edge if nodes are dimmed? 
        // Simple logic: If filtering, dim edges connected to dimmed nodes
        let opacity = isPathActive ? 1 : 0.5;
        
        edges.push({
          id: `${prereqId}-${course.id}`,
          source: prereqId,
          target: course.id,
          type: 'smoothstep',
          animated: isPathActive,
          style: { 
            stroke: isPathActive ? '#10b981' : '#4b5563',
            strokeWidth: isPathActive ? 2 : 1,
            opacity: opacity
          },
        });
      }
    });
  });

  // 3. Compute Layout
  dagre.layout(dagreGraph);

  // 4. Map back to React Flow Nodes
  const nodes: Node[] = courses.map((course) => {
    const nodeWithPosition = dagreGraph.node(course.id);
    const status = courseStatusMap.get(course.id) || 'locked';

    // Calculate Visibility/Dimming based on filter
    let isDimmed = false;
    if (filterMode === 'completed') {
      isDimmed = status !== 'completed';
    } else if (filterMode === 'next') {
      // Show unlocked (next available) and completed (context). Dim locked.
      isDimmed = status === 'locked';
    }

    return {
      id: course.id,
      type: 'courseCard',
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: {
        course,
        status,
        isDimmed,
        onToggle,
        onDetails
      },
    };
  });

  return { nodes, edges };
};
