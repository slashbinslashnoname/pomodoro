import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScanHistoryProps {
  history: string[];
  onClear: () => void;
}

export const ScanHistory = ({ history, onClear }: ScanHistoryProps) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No scan history yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Scan History</CardTitle>
        <Button variant="destructive" size="sm" onClick={onClear}>Clear History</Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border">
          <div className="p-2 space-y-2">
            {history.map((scan, index) => (
              <div key={index} className="rounded-md border p-2 text-sm bg-muted">
                {scan}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 