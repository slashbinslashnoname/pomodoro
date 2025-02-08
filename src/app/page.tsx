"use client";

import { PomodoroTimer } from '@/components/pomodoro-timer';
import { Toolbar } from '@/components/toolbar';

export default function Home() {
  return (
    <>
      <header>
        <Toolbar />
      </header>
      <article>
        <PomodoroTimer />
      </article>
    </>
  );
}
