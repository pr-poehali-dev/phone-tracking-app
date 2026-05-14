import Icon from "@/components/ui/icon";
import { contacts, statusColor } from "./types";
import type { Contact, Zone } from "./types";

interface MapTabProps {
  zoneList: Zone[];
  selectedContact: Contact | null;
  setSelectedContact: (c: Contact | null) => void;
}

export default function MapTab({ zoneList, selectedContact, setSelectedContact }: MapTabProps) {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex-1 relative map-grid overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00FFB3" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {contacts.filter(c => c.status !== "offline").map(c => (
            <line key={c.id} x1="50%" y1="50%" x2={`${c.x}%`} y2={`${c.y}%`}
              stroke={c.color} strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
          ))}
          {selectedContact && (
            <polyline
              points={`${selectedContact.x - 10}%,${selectedContact.y + 15}% ${selectedContact.x - 5}%,${selectedContact.y + 8}% ${selectedContact.x}%,${selectedContact.y}%`}
              fill="none" stroke={selectedContact.color} strokeWidth="2" className="route-line"
            />
          )}
        </svg>

        {zoneList.filter(z => z.active).map(z => (
          <div key={z.id} className="absolute zone-circle flex items-center justify-center"
            style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.radius * 0.28}px`, height: `${z.radius * 0.28}px`, transform: 'translate(-50%, -50%)', borderColor: z.color + '55', boxShadow: `0 0 30px ${z.color}18` }}>
            <span className="text-[10px] font-medium opacity-60" style={{ color: z.color }}>{z.name}</span>
          </div>
        ))}

        {contacts.map(c => (
          <button key={c.id} className="absolute group"
            style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => setSelectedContact(selectedContact?.id === c.id ? null : c)}>
            {c.status === "online" && (
              <div className="absolute inset-0 rounded-full animate-ping-slow" style={{ backgroundColor: c.color + '30', width: 40, height: 40 }} />
            )}
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#080c17] transition-all duration-200 group-hover:scale-110"
              style={{ backgroundColor: c.color, boxShadow: `0 0 16px ${c.color}60` }}>
              {c.name.charAt(0)}
              {c.status === "offline" && <div className="absolute inset-0 rounded-full bg-black/50" />}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-[#080c17]"
              style={{ backgroundColor: statusColor[c.status] }} />
          </button>
        ))}

        <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="absolute rounded-full animate-pulse-ring bg-[#00FFB3]/20"
            style={{ width: 60, height: 60, top: -20, left: -20 }} />
          <div className="w-5 h-5 rounded-full bg-[#00FFB3] border-2 border-white animate-float"
            style={{ boxShadow: '0 0 20px #00FFB380' }} />
        </div>

        {selectedContact && (
          <div className="absolute glass rounded-2xl p-4 w-60 animate-slide-up z-10"
            style={{ left: `${Math.min(selectedContact.x + 6, 55)}%`, top: `${Math.max(selectedContact.y - 22, 4)}%`, borderColor: selectedContact.color + '40', borderWidth: 1 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#080c17] shrink-0"
                style={{ backgroundColor: selectedContact.color }}>
                {selectedContact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{selectedContact.name}</p>
                <p className="text-xs text-white/50">{selectedContact.phone}</p>
              </div>
              <button className="text-white/40 hover:text-white shrink-0" onClick={() => setSelectedContact(null)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Icon name="MapPin" size={12} className="text-[#00FFB3] shrink-0" />
                <span>{selectedContact.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Icon name="Clock" size={12} className="text-[#B44DFF] shrink-0" />
                <span>{selectedContact.lastSeen}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Icon name="Battery" size={12} className={selectedContact.battery < 20 ? "text-red-400 shrink-0" : "text-[#00C2FF] shrink-0"} />
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${selectedContact.battery}%`, backgroundColor: selectedContact.battery < 20 ? '#FF4444' : selectedContact.color }} />
                </div>
                <span className="text-white/50">{selectedContact.battery}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover">
            <Icon name="Plus" size={18} className="text-[#00FFB3]" />
          </button>
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover">
            <Icon name="Minus" size={18} className="text-white/50" />
          </button>
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover mt-1">
            <Icon name="Crosshair" size={18} className="text-[#00C2FF]" />
          </button>
        </div>

        <div className="absolute left-4 bottom-4 glass rounded-2xl px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FFB3] animate-blink" />
          <span className="text-xs text-white/70">
            <span className="text-[#00FFB3] font-bold">{contacts.filter(c => c.status === "online").length}</span>
            /{contacts.length} онлайн
          </span>
        </div>
      </div>
    </div>
  );
}
