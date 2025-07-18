"use client";

import { GameProvider } from "@/context/GameContext";
import { LocalizationProvider } from "@/context/LocalizationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </LocalizationProvider>
  );
}
