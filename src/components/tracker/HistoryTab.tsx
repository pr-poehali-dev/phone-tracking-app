import Icon from "@/components/ui/icon";
import { historyData } from "./types";
import type { HistoryEntry } from "./types";

interface HistoryTabProps {
  selectedHistory: HistoryEntry | null;
  setSelectedHistory: (h: HistoryEntry) => void;
}

export default function HistoryTab({ selectedHistory, setSelectedHistory }: HistoryTabProps) {
  return (
    <div className="h-full flex animate-fade-in overflow-hidden">
      <div className="w-44 shrink-0 border-r border-white/5 overflow-y-auto py-4 px-3 space-y-2">
        <p className="text-[10px] text-white/30 px-2 uppercase tracking-widest mb-3">Маршруты</p>
        {historyData.map(h => (
          <button key={h.id} className={`w-full text-left rounded-xl p-3 transition-all ${selectedHistory?.id === h.id ? 'glass border border-white/10' : 'hover:bg-white/4'}`}
            onClick={() => setSelectedHistory(h)}>
            <div className="w-6 h-1.5 rounded-full mb-2" style={{ backgroundColor: h.contactColor }} />
            <p className="text-xs font-medium text-white/80 leading-tight">{h.contactName.split(' ')[0]}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{h.date}</p>
            <div className="flex gap-2 mt-1.5">
              <span className="text-[10px] text-white/50">{h.distance}</span>
              <span className="text-[10px] text-white/30">·</span>
              <span className="text-[10px] text-white/50">{h.duration}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 relative map-grid">
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs><pattern id="g3" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00FFB3" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#g3)" />
        </svg>

        {selectedHistory && (
          <>
            <svg className="absolute inset-0 w-full h-full">
              <polyline points={selectedHistory.path.map(p => `${p.x}%,${p.y}%`).join(' ')}
                fill="none" stroke={selectedHistory.contactColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.12" />
              <polyline points={selectedHistory.path.map(p => `${p.x}%,${p.y}%`).join(' ')}
                fill="none" stroke={selectedHistory.contactColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
              {selectedHistory.path.map((p, i) => (
                <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`}
                  r={i === 0 || i === selectedHistory.path.length - 1 ? 7 : 4}
                  fill={selectedHistory.contactColor}
                  fillOpacity={i === 0 || i === selectedHistory.path.length - 1 ? 1 : 0.5}
                  stroke="white" strokeWidth="1.5" strokeOpacity="0.4"
                />
              ))}
            </svg>

            <div className="absolute top-4 right-4 space-y-2">
              {[
                { icon: "Route", label: "Расстояние", val: selectedHistory.distance, color: "#00FFB3" },
                { icon: "Clock", label: "Время", val: selectedHistory.duration, color: "#B44DFF" },
                { icon: "MapPin", label: "Точек", val: String(selectedHistory.points), color: "#00C2FF" },
              ].map(item => (
                <div key={item.label} className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                  <Icon name={item.icon} size={14} style={{ color: item.color }} />
                  <div>
                    <p className="text-[10px] text-white/40">{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: item.color }}>{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-3">
              <p className="text-xs text-white/50">{selectedHistory.date}</p>
              <p className="font-semibold text-sm">{selectedHistory.contactName}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
