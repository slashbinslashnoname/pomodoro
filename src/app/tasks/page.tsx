'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Badge } from "@/components/ui/badge"
import { PlayIcon } from '@radix-ui/react-icons';
import { PauseIcon } from '@radix-ui/react-icons';
import { useTimer } from '@/context/timer-context';
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  category?: string;
  pomodoros?: number;
}

function SortableTask({ task, onToggle, onDelete, onStartTaskTimer, onPauseTaskTimer, isCurrentTask }: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartTaskTimer: (task: Task) => void;
  onPauseTaskTimer: (task: Task) => void;
  isCurrentTask: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">

        {isCurrentTask ? (
          <Button
            variant="ghost"
            size="icon"
            className="p-0 hover:bg-accent mr-2"
            onClick={() => onPauseTaskTimer(task)}
          >
            <PauseIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="p-0 hover:bg-accent mr-2"
            onClick={() => onStartTaskTimer(task)}
          >
            <PlayIcon className="h-4 w-4" />
          </Button>
        )}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
        />
        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
          {task.text}
        </span>
        {task.category && (
          <Badge
            variant="secondary"
            className="ml-2 text-sm"
          >
            {task.category}
          </Badge>
        )}
        {task.pomodoros && (
          <span className="ml-2 text-sm text-muted-foreground">
            - {task.pomodoros} Pomodoros
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(event) => {
          console.log('Simplified SortableTask: Delete button clicked for task ID:', task.id);
          console.log('onDelete callback in SortableTask called with ID:', task.id);
          onDelete(task.id);
          event.stopPropagation();
        }}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function TasksPage() {

    const {
        startTimer,
        pauseTimer,
        resetTimer,
        workDuration,
        setTime,
        setStatus,
        setTimerState,
        setCurrentTaskId,
        currentTaskId
      } = useTimer();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const localStorageTasks = useLocalStorage<Task[]>('tasks', []);

  useEffect(() => {
    setTasks(localStorageTasks[0] || []);
  }, [localStorageTasks]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date(),
        category: (document.getElementById('task-category') as HTMLInputElement)?.value.trim() || undefined,
        pomodoros: parseInt((document.getElementById('task-pomodoros') as HTMLInputElement)?.value) || 1,
      };
      setTasks(prev => [newTask, ...prev]);
      localStorageTasks[1]([newTask, ...tasks]);
      setNewTaskText('');
      (document.getElementById('task-category') as HTMLInputElement).value = '';
      (document.getElementById('task-pomodoros') as HTMLInputElement).value = '1';
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    localStorageTasks[1](tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    console.log('deleteTask called for taskId:', taskId);
    setTasks(prevTasks => {
      console.log('Current tasks before deletion:', prevTasks);
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      console.log('Updated tasks after deletion:', updatedTasks);
      localStorageTasks[1](updatedTasks);
      console.log('localStorage updated with:', updatedTasks);
      return updatedTasks;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const handleStartTaskTimer = (task: Task) => {
    console.log('Timer started for task:', task.text, workDuration);
    resetTimer(workDuration);
    setStatus('running');
    setTimerState('work');
    setTime(workDuration);
    startTimer();
    setCurrentTaskId(task.id);
  };
 
  const handlePauseTaskTimer = (task: Task) => {
    pauseTimer();
    setStatus('paused');
    setCurrentTaskId(null);
  };

  return (
    <div className="container max-w-full md:max-w-2xl lg:max-w-4xl w-full mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-col md:flex-row">
            <Input
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full md:w-auto"
            />
            <Input
              placeholder="Category"
              className="w-32 md:w-auto"
              id="task-category"
            />
            <Input
              placeholder="Pomodoros"
              className="w-24 md:w-auto"
              id="task-pomodoros"
              type="number"
              defaultValue={1}
              min={1}
            />
            <Button onClick={addTask}>Add</Button>
          </div>

          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-center text-muted-foreground">No tasks yet</p>
            ) : (
              tasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onStartTaskTimer={handleStartTaskTimer}
                  onPauseTaskTimer={handlePauseTaskTimer}
                  isCurrentTask={task.id === currentTaskId}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
} 