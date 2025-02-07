'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function DisclaimerDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="About Slashbin">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>À propos de Slashbin</DialogTitle>
          <DialogDescription>
            Ce Pomodoro Timer a été créé par Slashbin.
            <br />
            <br />
            Slashbin est un développeur passionné par la création d&apos;outils simples et efficaces pour améliorer la productivité et le bien-être.
            <br />
            <br />
            Vous pouvez retrouver Slashbin sur :
            <ul className="list-disc pl-5 mt-2">
              <li>
                <a href="https://slashbin.xyz" target="_blank" rel="noopener noreferrer" className="underline">
                  slashbin.xyz
                </a>
              </li>
              <li>
                <a href="https://github.com/slashbinslashnoname" target="_blank" rel="noopener noreferrer" className="underline">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://twitter.com/slashbin_fr" target="_blank" rel="noopener noreferrer" className="underline">
                  Twitter
                </a>
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 