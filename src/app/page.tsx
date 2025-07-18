import AppLayout from "@/components/layout/AppLayout";
import { GameProvider } from "@/context/GameContext";

export default function Home() {
  return (
    <GameProvider>
      <AppLayout />
    </GameProvider>
  );
}
