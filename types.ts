export interface Course {
  id: string; // Course Code (e.g., CS101)
  title: string;
  prerequisites: string[]; // List of Course IDs
  category?: string;
  description?: string;
  objectives?: string[]; // Optional learning objectives
}

export type CourseStatus = 'locked' | 'unlocked' | 'completed';

export interface CourseNodeData {
  course: Course;
  status: CourseStatus;
  isDimmed?: boolean; // For filtering visuals
  onToggle: (id: string) => void;
  onDetails: (course: Course) => void; // New handler for opening modal
}
