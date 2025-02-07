'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionRecord {
  type: 'work' | 'break';
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
}

interface SessionHistoryProps {
  sessions: SessionRecord[];
  onClearHistory?: () => void;
}

export function SessionHistory({ sessions, onClearHistory }: SessionHistoryProps) {
  const formatTime = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getTotalWorkTime = () => {
    return sessions
      .filter(s => s.type === 'work' && s.completed)
      .reduce((acc, session) => acc + session.duration, 0);
  };

  const getCompletedSessions = () => {
    return sessions.filter(s => s.type === 'work' && s.completed).length;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Historique des sessions">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Session History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Work Time</p>
              <p className="text-2xl font-bold">{formatDuration(getTotalWorkTime())}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
              <p className="text-2xl font-bold">{getCompletedSessions()}</p>
            </div>
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {session.type === 'work' ? '🎯 Work' : '☕ Break'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDuration(session.duration)}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.completed ? '✅ Completed' : '⏹️ Stopped'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        {sessions.length > 0 && (
          <Button 
            variant="destructive" 
            size="icon"
            onClick={onClearHistory}
            title="Effacer l'historique"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
} 