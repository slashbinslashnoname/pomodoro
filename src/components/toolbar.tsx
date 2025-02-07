'use client';

import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from 'react';

export function Toolbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rendu initial côté serveur
  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 flex gap-2">
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <ThemeToggle />
    </div>
  );
} 