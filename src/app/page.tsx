import AppLayout from "@/components/layout/AppLayout";
import { GameProvider } from "@/context/GameContext";
import { LocalizationProvider } from "@/context/LocalizationContext";

export default function Home() {
  return (
    <LocalizationProvider>
      <GameProvider>
        <AppLayout />
      </GameProvider>
    </LocalizationProvider>
  );
}
