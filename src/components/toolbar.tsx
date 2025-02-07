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

  const handleNotificationClick = useCallback(async () => {
    // Désactivation simple
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast({
        title: "Notifications désactivées",
        description: "Vous ne recevrez plus de notifications.",
      });
      return;
    }

    // Activation avec demande de permission
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new window.Notification("Notifications activées", {
            body: "Vous recevrez des notifications pour les événements importants.",
            icon: '/bell.png'
          });
        } else {
          toast({
            title: "Notifications non autorisées",
            description: "Veuillez autoriser les notifications dans les paramètres de votre navigateur.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'activation des notifications.",
          variant: "destructive",
        });
      }
    }
  }, [notificationsEnabled, setNotificationsEnabled, toast]);

  useEffect(() => {
    setMounted(true);
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, [setNotificationsEnabled]);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleNotificationClick}
        title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
      >
        {notificationsEnabled ? '🔔' : '🔕'}
      </Button>
      <ThemeToggle />
    </div>
  );
} 