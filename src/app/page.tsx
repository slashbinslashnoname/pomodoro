import { PomodoroTimer } from '@/components/pomodoro-timer';
import { Toolbar } from '@/components/toolbar';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <Toolbar />
      <PomodoroTimer />
    </main>
  );
}
