"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

export function Toolbar() {
  const [mounted, setMounted] = useState(false);
  const [localNotificationsEnabled, setLocalNotificationsEnabled] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('notificationsEnabled');
    return storedValue ? JSON.parse(storedValue) : false;
  });
  const [ , setNotificationsEnabledLocalStorage ] = useLocalStorage('notificationsEnabled', false);
  const { toast } = useToast();

  const handleNotificationClick = useCallback(async () => {
    console.log("handleNotificationClick - localNotificationsEnabled before:", localNotificationsEnabled);

    const nextNotificationsEnabled = !localNotificationsEnabled;
    setLocalNotificationsEnabled(nextNotificationsEnabled);

    setNotificationsEnabledLocalStorage(nextNotificationsEnabled);

    if (nextNotificationsEnabled) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new window.Notification("Notifications activées", {
              body: "Vous recevrez des notifications pour les événements importants.",
              icon: '/bell.png'
            });
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
        } catch (error) {
          console.error('Error:', error);
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'activation des notifications.",
            variant: "destructive",
          });
        }
      }
      console.log("handleNotificationClick - Notifications activées (or attempted)");
      console.log("handleNotificationClick - localNotificationsEnabled after:", nextNotificationsEnabled);
    } else {
      toast({
        title: "Notifications désactivées",
        description: "Vous ne recevrez plus de notifications.",
      });
      console.log("handleNotificationClick - Notifications désactivées");
      console.log("handleNotificationClick - localNotificationsEnabled after:", nextNotificationsEnabled);
    }
  }, [localNotificationsEnabled, setNotificationsEnabledLocalStorage, toast]);

  useEffect(() => {
    setMounted(true);
    if ('Notification' in window) {
      setLocalNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  if (!mounted) return null;

  console.log("Toolbar Render - localNotificationsEnabled:", localNotificationsEnabled);

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleNotificationClick}
        title={localNotificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
      >
        {localNotificationsEnabled ? '🔔' : '🔕'}
      </Button>
      <ThemeToggle />
    </div>
  );
} 