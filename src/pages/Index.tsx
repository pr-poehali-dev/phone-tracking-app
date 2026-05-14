import Icon from "@/components/ui/icon";
import MapTab from "@/components/tracker/MapTab";

export default function Index() {

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c17] text-white select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 glass border-b border-white/5 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFB3] to-[#00C2FF] flex items-center justify-center glow-green">
            <Icon name="Navigation" size={16} className="text-[#080c17]" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Hunt<span className="neon-green">Nav</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/40 glass px-2 py-1 rounded-lg">
            🎣 Охота & Рыбалка
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === "map" && <MapTab />}
      </main>
    </div>
  );
}