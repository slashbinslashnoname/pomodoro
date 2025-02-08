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
import { History } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { SessionRecord } from "@/types";

interface SessionHistoryProps {
  sessions: SessionRecord[];
  onClearHistory: () => void;
}

export function SessionHistory({ sessions, onClearHistory }: SessionHistoryProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground">No sessions recorded yet</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex flex-col space-y-1 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {session.type === 'work' ? 'Work Session' : 'Break'}
                      </span>
                      <span className={`text-sm ${session.completed ? 'text-green-500' : 'text-red-500'}`}>
                        {session.completed ? 'Completed' : 'Interrupted'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duration: {formatDuration(session.duration)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClearHistory}
                >
                  Clear History
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}