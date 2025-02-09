'use client';

import { useState, useEffect, useCallback } from 'react';

const HISTORY_STORAGE_KEY = 'qrScanHistory';

export const useScanHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((scanResult: string) => {
    setHistory(prevHistory => [scanResult, ...prevHistory]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}; 