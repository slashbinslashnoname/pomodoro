'use client';

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState, useEffect } from 'react';

export function Toolbar() {
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', true);
  const { toast } = useToast();

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

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

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
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
      setNotificationsEnabled(false);
      toast({
        title: "Notifications désactivées",
        description: "Vous ne recevrez plus de notifications.",
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleNotifications}
        className={!notificationsEnabled ? 'opacity-50' : ''}
        title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
      >
        {notificationsEnabled ? '🔔' : '🔕'}
      </Button>
      <ThemeToggle />
    </div>
  );
} 