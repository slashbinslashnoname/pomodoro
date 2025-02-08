'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function IMCPage() {
    const [weight, setWeight] = useState<number | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [imc, setImc] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');

    const calculateIMC = () => {
        if (weight !== null && height !== null && height > 0) {
            const heightInMeters = height / 100;
            const imcValue = weight / (heightInMeters * heightInMeters);
            setImc(imcValue);
            setInterpretation(interpretIMC(imcValue));
        } else {
            setImc(null);
            setInterpretation('Veuillez entrer un poids et une taille valides.');
        }
    };

    const interpretIMC = (imcValue: number): string => {
        if (imcValue < 18.5) {
            return 'Insuffisance pondérale';
        } else if (imcValue >= 18.5 && imcValue < 24.9) {
            return 'Poids normal';
        } else if (imcValue >= 25 && imcValue < 29.9) {
            return 'Surpoids';
        } else if (imcValue >= 30 && imcValue < 34.9) {
            return 'Obésité';
        } else if (imcValue >= 35) {
            return 'Obésité sévère';
        }
        return 'IMC non interprétable';
    };

    return (
        <div className="container max-w-[550px] w-[550px] mx-auto py-10">
            <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader className="flex flex-col items-center space-y-2 pb-4 pt-8">
                    <CardTitle className="text-2xl font-bold">Calculateur d&apos;IMC</CardTitle>
                    <p className="text-sm text-muted-foreground">Entrez votre poids et votre taille</p>
                </CardHeader>
                <CardContent className="grid gap-6 px-8 pb-8">
                    <div className="grid gap-2">
                        <Label htmlFor="weight" className="text-sm">Poids (kg)</Label>
                        <Input
                            type="number"
                            id="weight"
                            placeholder="e.g. 75"
                            className="shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={weight !== null ? weight.toString() : ''}
                            onChange={(e) => setWeight(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="height" className="text-sm">Taille (cm)</Label>
                        <Input
                            type="number"
                            id="height"
                            placeholder="e.g. 170"
                            className="shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={height !== null ? height.toString() : ''}
                            onChange={(e) => setHeight(parseFloat(e.target.value))}
                        />
                    </div>
                    <Button onClick={calculateIMC} className="w-full mt-2">
                        Calculer mon IMC
                    </Button>
                    {imc !== null && (
                        <div className="mt-8 p-4 rounded-md bg-muted text-center">
                            <p className="text-lg font-semibold">Votre IMC : <span className="font-bold text-primary">{imc.toFixed(2)}</span></p>
                            <p className={cn("text-sm",
                                imc < 18.5 ? "text-red-500" :
                                    imc < 25 ? "text-green-500" :
                                        "text-yellow-500"
                            )}>{interpretation}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 