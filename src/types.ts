export interface SessionRecord {
  type: 'work' | 'break';
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
} 