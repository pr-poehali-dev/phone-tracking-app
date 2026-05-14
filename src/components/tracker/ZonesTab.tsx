import Icon from "@/components/ui/icon";
import type { Zone } from "./types";

interface ZonesTabProps {
  zoneList: Zone[];
  toggleZone: (id: number) => void;
  showAddZone: boolean;
  setShowAddZone: (v: boolean) => void;
}

export default function ZonesTab({ zoneList, toggleZone, showAddZone, setShowAddZone }: ZonesTabProps) {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Геозоны</h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B44DFF] text-white text-sm font-semibold hover:scale-105 transition-transform glow-purple"
            onClick={() => setShowAddZone(true)}>
            <Icon name="Plus" size={14} />
            Новая зона
          </button>
        </div>
        <div className="glass rounded-2xl overflow-hidden h-36 relative map-grid mb-4">
          <svg className="absolute inset-0 w-full h-full opacity-5">
            <defs><pattern id="g2" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00FFB3" strokeWidth="0.5"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#g2)" />
          </svg>
          {zoneList.map(z => (
            <div key={z.id} className="absolute" style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)' }}>
              {z.active && (
                <div className="rounded-full zone-circle flex items-center justify-center"
                  style={{ width: z.radius * 0.2, height: z.radius * 0.2, borderColor: z.color + '60' }}>
                  <span className="text-[8px] font-bold" style={{ color: z.color }}>{z.name.charAt(0)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
        {zoneList.map((z, i) => (
          <div key={z.id} className="glass rounded-2xl p-4 glass-hover animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${z.color}20`, border: `1.5px solid ${z.color}60` }}>
                <Icon name="Shield" size={20} style={{ color: z.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{z.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: z.color + '20', color: z.color }}>{z.radius}м</span>
                </div>
                <p className="text-xs text-white/50 truncate">{z.address}</p>
                <p className="text-xs text-white/30 mt-0.5">{z.triggers} срабатываний</p>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <button className="relative w-12 h-6 rounded-full transition-all duration-300"
                  style={{ background: z.active ? `${z.color}30` : 'rgba(255,255,255,0.08)', border: `1px solid ${z.active ? z.color + '60' : 'transparent'}` }}
                  onClick={() => toggleZone(z.id)}>
                  <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300"
                    style={{ left: z.active ? '26px' : '2px', background: z.active ? z.color : '#555' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddZone && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end z-20" onClick={() => setShowAddZone(false)}>
          <div className="w-full glass rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>Новая геозона</h3>
            <div className="space-y-3">
              <div className="glass rounded-xl px-4 py-3">
                <input type="text" placeholder="Название зоны (Дом, Работа...)" className="bg-transparent text-sm outline-none text-white placeholder-white/30 w-full" />
              </div>
              <div className="glass rounded-xl px-4 py-3">
                <input type="text" placeholder="Адрес или координаты" className="bg-transparent text-sm outline-none text-white placeholder-white/30 w-full" />
              </div>
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-sm text-white/50 shrink-0">Радиус:</span>
                <input type="range" min="50" max="1000" defaultValue="200" className="flex-1 accent-[#B44DFF]" />
                <span className="text-sm text-[#B44DFF] w-14 text-right shrink-0">200 м</span>
              </div>
              <button className="w-full py-3 rounded-xl bg-[#B44DFF] text-white font-semibold glow-purple hover:scale-[1.02] transition-transform" onClick={() => setShowAddZone(false)}>
                Создать зону
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
