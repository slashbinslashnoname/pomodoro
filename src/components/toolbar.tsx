'use client';

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

export function Toolbar() {
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', false);
  const { toast } = useToast();

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
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
      return permission === 'granted';
    }
    return false;
  }, [setNotificationsEnabled, toast]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rendu initial côté serveur
  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 flex gap-2">
        <Button variant="outline" size="icon">
          <span>🔕</span>
        </Button>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={requestNotificationPermission}
        title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
      >
        {notificationsEnabled ? '🔔' : '🔕'}
      </Button>
      <ThemeToggle />
    </div>
  );
} 