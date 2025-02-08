"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SettingsDialog } from "./settings-dialog";
import { SessionHistory } from "./session-history";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTimer } from '@/context/timer-context';

type TimerState = 'work' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

interface SessionRecord {
  type: 'work' | 'break';
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
}

let workerInitialized = false;

export default function PomodoroTimer() {
  const {
    time,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    workDuration,
    breakDuration,
    setWorkDuration,
    setBreakDuration,
    setTime,
    status,
    setStatus,
    timerState,
    setTimerState,
  } = useTimer();
  const [sessions, setSessions] = useLocalStorage<SessionRecord[]>('sessions', []);
  const [isMounted, setIsMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', false);
  const workerRef = useRef<Worker | null>(null);
  const hasShownProgressNotification = useRef(false);
  const currentSessionStart = useRef<Date>(new Date());
  const { toast } = useToast();

  const handleStart = () => {
    console.log('handleStart function called');
    setStatus('running');
    currentSessionStart.current = new Date();
    if (status === 'idle') {
      setTime(timerState === 'work' ? workDuration : breakDuration);
      console.log('handleStart - setTime called with:', timerState === 'work' ? workDuration : breakDuration);
    }
    workerRef.current?.postMessage({
      type: 'START',
      payload: { duration: time, timerState }
    });
    startTimer();
  };

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new window.Notification(title, {
          body,
          icon: '/bell.png',
          tag: 'pomodoro-notification',
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }
    toast({
      title,
      description: body,
    });
  }, [toast]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!notificationsEnabled) {
      toast({
        title,
        description: body,
      });
      return;
    }
    showNotification(title, body);
  }, [notificationsEnabled, showNotification, toast]);

  const handleSessionComplete = useCallback(() => {
    const newState = timerState === 'work' ? 'break' : 'work';

    if (currentSessionStart.current) {
      setSessions(prev => [{
        type: timerState,
        startTime: currentSessionStart.current!,
        endTime: new Date(),
        duration: timerState === 'work' ? workDuration : breakDuration,
        completed: true
      }, ...prev]);
    }

    sendNotification(
      `${timerState === 'work' ? 'Work' : 'Break'} session complete!`,
      `Time for a ${newState === 'work' ? 'work' : 'break'} session.`
    );

    hasShownProgressNotification.current = false;

    setTimerState(newState);
    setTime(newState === 'work' ? workDuration : breakDuration);
    currentSessionStart.current = new Date();

    workerRef.current?.postMessage({
      type: 'START',
      payload: { duration: newState === 'work' ? workDuration : breakDuration, timerState: newState }
    });

  }, [timerState, workDuration, breakDuration, sendNotification, setSessions, setTimerState, setTime]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !workerInitialized) {
      console.log('PomodoroTimer: useEffect - window is defined, about to create worker');
      workerRef.current = new Worker(new URL('../lib/timer.worker.ts', import.meta.url));
      console.log('PomodoroTimer: useEffect - worker created', workerRef.current);
      workerInitialized = true;

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
      };

      workerRef.current.onmessage = (e) => {
        const { type, payload } = e.data;
        console.log('Main thread received message:', type, payload);

        switch (type) {
          case 'TICK':
            setTime(payload);
            break;
          case 'COMPLETE':
            handleSessionComplete();
            if (payload && payload.title && payload.body) {
              toast({
                title: payload.title,
                description: payload.body,
              });
            }
            break;
          case 'NOTIFICATION':
            if (payload && payload.title && payload.body) {
              toast({
                title: payload.title,
                description: payload.body,
              });
            }
            break;
        }
      };

      return () => {
        workerRef.current?.terminate();
      };
    }
    if (status === 'running' && isMounted && !isRunning) {
      console.log('PomodoroTimer: useEffect - status is running, restarting timer');
      handleStart();
    }
  }, [status, isMounted, setTime, isRunning, handleSessionComplete, handleStart]);

  const handleDurationChange = useCallback(
    (newDuration: number, setDuration: (duration: number) => void) => {
      setDuration(newDuration);
      resetTimer();
      setTime(newDuration);
    },
    [resetTimer, setTime]
  );

  const handleWorkDurationChange = useCallback(
    (newDuration: number) => handleDurationChange(newDuration, setWorkDuration),
    [handleDurationChange, setWorkDuration]
  );

  const handleBreakDurationChange = useCallback(
    (newDuration: number) => handleDurationChange(newDuration, setBreakDuration),
    [handleDurationChange, setBreakDuration]
  );

    useEffect(() => {
    if (timerState === 'break' && time === 5 && status === 'running') {
      sendNotification(
        'Break ending soon!',
        'Your break will end in 5 seconds. Get ready to work!'
      );
    }

    const totalDuration = timerState === 'work' ? workDuration : breakDuration;
    const threshold = totalDuration * 0.2;

    if (time <= threshold && !hasShownProgressNotification.current && status === 'running') {
      sendNotification(
        '20% of time remaining!',
        `${time} seconds left in your ${timerState} session.`
      );
      hasShownProgressNotification.current = true;
    }
  }, [time, timerState, workDuration, breakDuration, status, sendNotification]);

  if (!isMounted) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-center flex-1">Loading...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-center">00:00</div>
          <Progress value={0} className="h-2" />
        </CardContent>
      </Card>
    );
  }

  const handleReset = () => {
    if (status !== 'idle' && currentSessionStart.current) {
      setSessions(prev => [{
        type: timerState,
        startTime: currentSessionStart.current!,
        endTime: new Date(),
        duration: (timerState === 'work' ? workDuration : breakDuration) - time,
        completed: false
      }, ...prev]);
    }
    resetTimer();
    setStatus('idle');
    setTime(timerState === 'work' ? workDuration : breakDuration);
    workerRef.current?.postMessage({
      type: 'RESET',
      payload: { duration: timerState === 'work' ? workDuration : breakDuration, timerState }
    });
    currentSessionStart.current = new Date();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((timerState === 'work' ? workDuration : breakDuration) - time) /
                   (timerState === 'work' ? workDuration : breakDuration) * 100;

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-center flex-1">
            {timerState === 'work' ? 'Work Session' : 'Break Time'}
          </CardTitle>
          <div className="flex gap-2">
            <SessionHistory sessions={sessions} onClearHistory={() => setSessions([])} />
            <SettingsDialog
              workDuration={workDuration}
              breakDuration={breakDuration}
              onWorkDurationChange={handleWorkDurationChange}
              onBreakDurationChange={handleBreakDurationChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <>
          <div className="text-6xl font-bold text-center">
            {formatTime(time)}
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex justify-center gap-4">
            {status === 'idle' && (
              <Button onClick={handleStart}>Start</Button>
            )}
            {status === 'running' && (
              <Button onClick={() => { pauseTimer(); setStatus('paused'); }} variant="secondary">Pause</Button>
            )}
            {status === 'paused' && (
              <Button onClick={handleStart}>Resume</Button>
            )}
            <Button onClick={handleReset} variant="outline">Reset</Button>
          </div>
        </>
      </CardContent>
    </Card>
  );
} 