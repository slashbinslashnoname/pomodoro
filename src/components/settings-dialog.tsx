'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings2 } from "lucide-react";

interface SettingsDialogProps {
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (value: number) => void;
  onBreakDurationChange: (value: number) => void;
}

export function SettingsDialog({
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Work Duration (minutes)</Label>
            <Slider
              value={[workDuration / 60]}
              onValueChange={([value]) => onWorkDurationChange(value * 60)}
              min={1}
              max={60}
              step={1}
            />
            <p className="text-sm text-muted-foreground text-right">
              {Math.floor(workDuration / 60)} minutes
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Break Duration (minutes)</Label>
            <Slider
              value={[breakDuration / 60]}
              onValueChange={([value]) => onBreakDurationChange(value * 60)}
              min={1}
              max={15}
              step={1}
            />
            <p className="text-sm text-muted-foreground text-right">
              {Math.floor(breakDuration / 60)} minutes
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 