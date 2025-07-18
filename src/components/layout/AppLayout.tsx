import DialogueInterface from '@/components/dialogue/DialogueInterface';
import InventoryAndJournalPanel from '@/components/panels/InventoryAndJournalPanel';
import StatsPanel from '@/components/panels/StatsPanel';

export default function AppLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_320px] h-screen bg-background text-foreground font-body overflow-hidden">
      <StatsPanel />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <DialogueInterface />
      </main>
      <InventoryAndJournalPanel />
    </div>
  );
}
