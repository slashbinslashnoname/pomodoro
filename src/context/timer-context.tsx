"use client" 
import React, {
    createContext,
    useContext,
    // useState,
    useEffect,
    useCallback,
} from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Define your Timer Context type
interface TimerContextType {
    time: number;
    isRunning: boolean;
    timerState: 'work' | 'break';
    status: 'idle' | 'running' | 'paused';
    workDuration: number;
    breakDuration: number;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setWorkDuration: (duration: number) => void;
    setBreakDuration: (duration: number) => void;
    setTime: (time: number) => void;
    setTimerState: (timerState: 'work' | 'break') => void;
    setStatus: (status: 'idle' | 'running' | 'paused') => void;
}

// Create the Timer Context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Create the Timer Provider
export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
    const [time, setTimeState] = useLocalStorage('time', 25 * 60);
    const [isRunning, setIsRunning] = useLocalStorage('isRunning', false);
    const [timerState, setTimerState] = useLocalStorage<'work' | 'break'>('timerState', 'work');
    const [status, setStatus] = useLocalStorage<'idle' | 'running' | 'paused'>('status', 'idle');
    const [workDuration, setWorkDuration] = useLocalStorage('workDuration', 25 * 60);
    const [breakDuration, setBreakDuration] = useLocalStorage('breakDuration', 5 * 60);

    const setTime = useCallback((newTime: number) => {
        console.log('TimerContext: setTime called with:', newTime);
        setTimeState(newTime);
    }, [setTimeState]);

    const startTimer = useCallback(() => {
        setIsRunning(true);
        setStatus('running');
    }, [setIsRunning, setStatus]);

    const pauseTimer = useCallback(() => {
        setIsRunning(false);
        setStatus('paused');
    }, [setIsRunning, setStatus]);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setStatus('idle');
        setTime(timerState === 'work' ? workDuration : breakDuration);
    }, [timerState, workDuration, breakDuration, setTime, setIsRunning, setStatus]);

    // Timer logic using useEffect
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (isRunning && status === 'running') {
            intervalId = setInterval(() => {
                setTimeState((prevTime) => {
                    if (prevTime <= 0) {
                        if (intervalId) clearInterval(intervalId);
                        setIsRunning(false);
                        setStatus('idle');
                        // Switch between work and break
                        setTimerState(timerState === 'work' ? 'break' : 'work');
                        return timerState === 'work' ? breakDuration : workDuration;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning, status, timerState, workDuration, breakDuration, setTimeState, setIsRunning, setStatus, setTimerState]);

    const contextValue: TimerContextType = {
        time,
        isRunning,
        timerState,
        status,
        workDuration,
        breakDuration,
        startTimer,
        pauseTimer,
        resetTimer,
        setWorkDuration,
        setBreakDuration,
        setTime,
        setTimerState,
        setStatus,
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