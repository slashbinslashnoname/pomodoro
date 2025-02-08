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
import { SessionRecord } from '@/types';


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
  const currentSessionStart = useRef<Date>(new Date());
  const { toast } = useToast();

  const handleStart = useCallback(() => {
    console.log('handleStart function called');
    setStatus('running');
    currentSessionStart.current = new Date();
    if (status === 'idle') {
      setTime(timerState === 'work' ? workDuration : breakDuration);
      console.log('handleStart - setTime called with:', timerState === 'work' ? workDuration : breakDuration);
    }
    startTimer();
  }, [setStatus, status, setTime, timerState, workDuration, breakDuration, startTimer]);

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
        console.error('Notification API availability:', 'Notification' in window); // Check if Notification API is available
        console.error('Notification permission status:', Notification.permission); // Check permission status
      }
    }
    toast({
      title,
      description: body,
    });
  }, [toast]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        setNotificationsEnabled(true); // Update local storage if granted
      } else if (permission === 'denied') {
        console.log('Notification permission denied.');
        setNotificationsEnabled(false); // Update local storage if denied
        toast({
          title: 'Notifications Denied',
          description: 'Please enable notifications in your browser settings to receive timer alerts.',
        });
      } else {
        console.log('Notification permission default or prompt.');
      }
    }
  }, [setNotificationsEnabled, toast]);

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

    setTimerState(newState);
    setTime(newState === 'work' ? workDuration : breakDuration);
    currentSessionStart.current = new Date();

  }, [timerState, workDuration, breakDuration, sendNotification, setSessions, setTimerState, setTime]);

  useEffect(() => {
    setIsMounted(true);
    if (notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted') {
      requestNotificationPermission(); // Request permission on mount if enabled in settings but not granted
    }
  }, [isMounted, notificationsEnabled, requestNotificationPermission]);

  useEffect(() => {
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
    <Card className="w-[350px] mx-auto container">
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
