import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TopLeftNav } from "@/components/top-left-nav";
import { TimerProvider } from '@/context/timer-context';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro.love by Slashbin",
  description: "Boostez votre productivité avec ce Pomodoro Timer simple et efficace. Gérez votre temps de travail et de pause pour une meilleure concentration.",
  keywords: ['Pomodoro Timer', 'Productivité', 'Gestion du temps', 'Focus', 'Travail', 'Pause', 'Timer en ligne'],
  authors: [{ name: 'Slashbin' }],
  openGraph: {
    title: 'Pomodoro.love - Focus & Boost Productivity',
    description: 'Boostez votre productivité avec ce Pomodoro Timer simple et efficace.',
    url: 'https://pomodoro.love',
    siteName: 'Pomodoro Timer App',
    images: [
      {
        url: '/twitter.png',
        width: 1200,
        height: 630,
        alt: 'Pomodoro.love',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': 'standard',
      'max-snippet': 100,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TimerProvider>
            <main className="min-h-screen flex items-center justify-center bg-background">
              <TopLeftNav />
              {children}
            </main>
            <Toaster />
          </TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
