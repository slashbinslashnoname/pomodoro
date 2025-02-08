"use client" 
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Define your Timer Context type
interface TimerContextType {
    time: number;
    isRunning: boolean;
    status: TimerStatus;
    timerState: TimerState;
    workDuration: number;
    breakDuration: number;
    setTime: (time: number) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setWorkDuration: (duration: number) => void;
    setBreakDuration: (duration: number) => void;
    setStatus: (status: TimerStatus) => void;
    setTimerState: (timerState: TimerState) => void;
    setTimeState: React.Dispatch<React.SetStateAction<number>>;
    setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

type TimerState = 'work' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

// Create the Timer Context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Create the Timer Provider
export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
    const [time, setTimeState] = useState<number>(1500); // 25 minutes
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [timerState, setTimerState] = useState<TimerState>('work');
    const [workDuration, setWorkDuration] = useLocalStorage('workDuration', 1500); // 25 minutes
    const [breakDuration, setBreakDuration] = useLocalStorage('breakDuration', 300); // 5 minutes
    const workerRef = useRef<Worker | null>(null); // Ref for worker

    useEffect(() => {
        // Initialize worker on component mount
        workerRef.current = new Worker(new URL('../lib/timer.worker.js', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (e) => {
            const { type, payload } = e.data;
            switch (type) {
                case 'TICK':
                    setTimeState(payload);
                    break;
                case 'COMPLETE':
                    setIsRunning(false);
                    setStatus('idle');
                    setTimerState(timerState === 'work' ? 'break' : 'work');
                    setTimeState(timerState === 'work' ? breakDuration : workDuration);
                    // Show notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(payload.title, {
                            body: payload.body,
                            icon: '/bell.png',
                            tag: 'pomodoro-notification',
                            requireInteraction: true
                        });
                    }
                    break;
            }
        };

        workerRef.current.onerror = (error) => {
            console.error('Worker error:', error);
            console.error('Worker error (full):', error);
        };

        // Terminate worker on unmount
        return () => {
            workerRef.current?.terminate();
        };
    }, [timerState, workDuration, breakDuration, setIsRunning, setStatus, setTimerState, setTimeState]);

    const setTime = useCallback((newTime: number) => {
        setTimeState(newTime);
    }, []);

    const startTimer = useCallback(() => {
        setIsRunning(true);
        setStatus('running');
        workerRef.current?.postMessage({
            type: 'START',
            payload: { duration: time, timerState }
        });
    }, [isRunning, status, time, timerState, setIsRunning, setStatus]);

    const pauseTimer = useCallback(() => {
        setIsRunning(false);
        setStatus('paused');
        workerRef.current?.postMessage({ type: 'PAUSE' });
    }, [setIsRunning, setStatus]);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setStatus('idle');
        workerRef.current?.postMessage({
            type: 'RESET',
            payload: { duration: timerState === 'work' ? workDuration : breakDuration, timerState }
        });
        setTimeState(timerState === 'work' ? workDuration : breakDuration);
    }, [timerState, workDuration, breakDuration, setIsRunning, setStatus, setTimeState]);

    useEffect(() => {
        setTimeState(timerState === 'work' ? workDuration : breakDuration);
    }, [timerState, workDuration, breakDuration]);

    const contextValue: TimerContextType = {
        time,
        isRunning,
        status,
        timerState,
        workDuration,
        breakDuration,
        setTime,
        startTimer,
        pauseTimer,
        resetTimer,
        setWorkDuration,
        setBreakDuration,
        setStatus,
        setTimerState,
        setTimeState,
        setIsRunning,
    };

    return (
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
};

// Custom hook to use the Timer Context
export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error("useTimer must be used within a TimerProvider");
    }
    return context;
}; 