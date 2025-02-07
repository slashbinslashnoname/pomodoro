'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SettingsDialog } from "./settings-dialog";
import { SessionHistory } from "./session-history";
import { useLocalStorage } from '@/hooks/use-local-storage';

type TimerState = 'work' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

interface SessionRecord {
  type: 'work' | 'break';
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
}

export function PomodoroTimer() {
  // 1. Tous les états (useState et useRef)
  const [workDuration, setWorkDuration] = useLocalStorage('workDuration', 25 * 60);
  const [breakDuration, setBreakDuration] = useLocalStorage('breakDuration', 5 * 60);
  const [sessions, setSessions] = useLocalStorage<SessionRecord[]>('sessions', []);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', true);
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isMounted, setIsMounted] = useState(false);

  // Tous les useRef
  const workerRef = useRef<Worker>();
  const hasShownProgressNotification = useRef(false);
  const currentSessionStart = useRef<Date>();
  const { toast } = useToast();

  // 2. Tous les useCallback
  const sendNotification = useCallback((title: string, body: string) => {
    if (notificationPermission === 'granted' && notificationsEnabled) {
      new Notification(title, {
        body,
        icon: '/icon.png'
      });
      toast({
        title,
        description: body,
      });
    }
  }, [notificationPermission, notificationsEnabled, toast]);

  const handleSessionComplete = useCallback(() => {
    const newState = timerState === 'work' ? 'break' : 'work';
    
    // Enregistrer la session terminée
    if (currentSessionStart.current) {
      setSessions(prev => [{
        type: timerState,
        startTime: currentSessionStart.current!,
        endTime: new Date(),
        duration: timerState === 'work' ? workDuration : breakDuration,
        completed: true
      }, ...prev]);
    }

    setTimerState(newState);
    setStatus('idle');
    setTimeLeft(newState === 'work' ? workDuration : breakDuration);
    currentSessionStart.current = undefined;
    
    // Notification de fin de session
    sendNotification(
      `${timerState === 'work' ? 'Work' : 'Break'} session complete!`,
      `Time for a ${newState === 'work' ? 'work' : 'break'} session.`
    );

    toast({
      title: `${timerState === 'work' ? 'Work' : 'Break'} session complete!`,
      description: `Time for a ${newState === 'work' ? 'work' : 'break'} session.`,
    });
    
    hasShownProgressNotification.current = false;

    // Démarrer automatiquement la pause
    if (newState === 'break') {
      setTimeout(() => {
        startTimer();
      }, 500); // Petit délai pour laisser le temps à l'interface de se mettre à jour
    }
  }, [timerState, workDuration, breakDuration, toast, sendNotification]);
  
  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/timer.worker.ts', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      
      switch (type) {
        case 'TICK':
          setTimeLeft(payload);
          break;
        case 'COMPLETE':
          handleSessionComplete();
          break;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [handleSessionComplete]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  }, []);

  const handleWorkDurationChange = useCallback((newDuration: number) => {
    setWorkDuration(newDuration);
    if (timerState === 'work' && status === 'idle') {
      setTimeLeft(newDuration);
    }
  }, [timerState, status]);

  const handleBreakDurationChange = useCallback((newDuration: number) => {
    setBreakDuration(newDuration);
    if (timerState === 'break' && status === 'idle') {
      setTimeLeft(newDuration);
    }
  }, [timerState, status]);

  // 3. Tous les useEffect
  useEffect(() => {
    setIsMounted(true);
    setTimeLeft(workDuration);
  }, [workDuration]);

  // Vérification initiale des notifications (une seule fois)
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission !== 'granted') {
          setNotificationsEnabled(false);
        }
      });
    }
  }, []); // Dépendances vides pour n'exécuter qu'au montage

  // Surveiller les changements de notificationsEnabled
  useEffect(() => {
    if (notificationsEnabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    }
  }, [notificationsEnabled, requestNotificationPermission]);

  useEffect(() => {
    // Notification 5 secondes avant la fin de la pause
    if (timerState === 'break' && timeLeft === 5 && status === 'running') {
      sendNotification(
        'Break ending soon!',
        'Your break will end in 5 seconds. Get ready to work!'
      );
    }

    // Vérifier si on a atteint 20% du temps
    const totalDuration = timerState === 'work' ? workDuration : breakDuration;
    const threshold = totalDuration * 0.2;
    
    if (timeLeft <= threshold && !hasShownProgressNotification.current && status === 'running') {
      sendNotification(
        '20% of time remaining!',
        `${timeLeft} seconds left in your ${timerState} session.`
      );
      hasShownProgressNotification.current = true;
    }
  }, [timeLeft, timerState, workDuration, breakDuration, status, sendNotification]);

  // 4. Early return pour le montage
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

  // 5. Fonctions régulières
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Si on active les notifications, on demande la permission
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      if (granted) {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des notifications pour les événements importants.",
        });
      } else {
        toast({
          title: "Notifications non autorisées",
          description: "Veuillez autoriser les notifications dans les paramètres de votre navigateur.",
          variant: "destructive",
        });
      }
    } else {
      // Si on désactive les notifications
      setNotificationsEnabled(false);
      toast({
        title: "Notifications désactivées",
        description: "Vous ne recevrez plus de notifications.",
      });
    }
  };

  const startTimer = () => {
    setStatus('running');
    if (!currentSessionStart.current) {
      currentSessionStart.current = new Date();
    }
    workerRef.current?.postMessage({
      type: 'START',
      payload: { duration: timeLeft }
    });
  };

  const pauseTimer = () => {
    setStatus('paused');
    workerRef.current?.postMessage({ type: 'PAUSE' });
  };

  const resetTimer = () => {
    setStatus('idle');
    const duration = timerState === 'work' ? workDuration : breakDuration;
    setTimeLeft(duration);
    workerRef.current?.postMessage({
      type: 'RESET',
      payload: { duration }
    });
  };

  const handleReset = () => {
    if (status !== 'idle' && currentSessionStart.current) {
      setSessions(prev => [{
        type: timerState,
        startTime: currentSessionStart.current!,
        endTime: new Date(),
        duration: (timerState === 'work' ? workDuration : breakDuration) - timeLeft,
        completed: false
      }, ...prev]);
    }
    resetTimer();
    currentSessionStart.current = undefined;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 6. Variables calculées
  const progress = ((timerState === 'work' ? workDuration : breakDuration) - timeLeft) / 
                   (timerState === 'work' ? workDuration : breakDuration) * 100;

  // 7. JSX
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-center flex-1">
            {timerState === 'work' ? 'Work Session' : 'Break Time'}
          </CardTitle>
          <div className="flex gap-2">
            <SessionHistory sessions={sessions} />
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
        <div className="text-6xl font-bold text-center">
          {formatTime(timeLeft)}
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-center gap-4">
          {status === 'idle' && (
            <Button onClick={startTimer}>Start</Button>
          )}
          {status === 'running' && (
            <Button onClick={pauseTimer} variant="secondary">Pause</Button>
          )}
          {status === 'paused' && (
            <Button onClick={startTimer}>Resume</Button>
          )}
          <Button onClick={handleReset} variant="outline">Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
} 