import React from 'react';
import { Button } from "@/components/ui/button"
import Link from 'next/link';

export function TopLeftNav() {
  return (
    <nav className="absolute top-4 left-4 flex gap-2">
      <Link href="/">
        <Button variant="outline">Timer</Button>
      </Link>
      <Link href="/tasks">
        <Button variant="outline">Tasks</Button>
      </Link>
      <Link href="https://bitcoin-qrcode.vercel.app">
        <Button variant="outline">QR Code</Button>
      </Link>
     
    </nav>
  );
}
