import Icon from "@/components/ui/icon";
import { contacts, statusColor, statusLabel } from "./types";
import type { Contact, Tab } from "./types";

interface ContactsTabProps {
  setActiveTab: (tab: Tab) => void;
  setSelectedContact: (c: Contact | null) => void;
  showAddContact: boolean;
  setShowAddContact: (v: boolean) => void;
}

export default function ContactsTab({ setActiveTab, setSelectedContact, showAddContact, setShowAddContact }: ContactsTabProps) {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Контакты</h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00FFB3] text-[#080c17] text-sm font-semibold hover:scale-105 transition-transform glow-green"
            onClick={() => setShowAddContact(true)}>
            <Icon name="UserPlus" size={14} />
            Добавить
          </button>
        </div>
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <Icon name="Search" size={16} className="text-white/30" />
          <input type="text" placeholder="Поиск контактов..." className="bg-transparent text-sm outline-none text-white placeholder-white/30 w-full" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
        {contacts.map((c, i) => (
          <div key={c.id} className="glass rounded-2xl p-4 glass-hover animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-[#080c17]"
                  style={{ backgroundColor: c.color, boxShadow: `0 0 12px ${c.color}50` }}>
                  {c.name.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#080c17]"
                  style={{ backgroundColor: statusColor[c.status] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-xs text-white/50 truncate">{c.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: statusColor[c.status] }}>{statusLabel[c.status]}</span>
                  <span className="text-xs text-white/30">·</span>
                  <span className="text-xs text-white/40">{c.lastSeen}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Icon name="Battery" size={12} className={c.battery < 20 ? "text-red-400" : "text-white/40"} />
                  <span className={c.battery < 20 ? "text-red-400" : ""}>{c.battery}%</span>
                </div>
                <button className="text-xs text-[#00FFB3] hover:underline" onClick={() => { setActiveTab("map"); setSelectedContact(c); }}>
                  Карта →
                </button>
              </div>
            </div>
            {c.status !== "offline" && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-white/50">
                <Icon name="MapPin" size={11} className="text-[#00FFB3] shrink-0" />
                <span>{c.location}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddContact && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end z-20" onClick={() => setShowAddContact(false)}>
          <div className="w-full glass rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>Добавить контакт</h3>
            <div className="space-y-3">
              <div className="glass rounded-xl px-4 py-3">
                <input type="text" placeholder="Имя" className="bg-transparent text-sm outline-none text-white placeholder-white/30 w-full" />
              </div>
              <div className="glass rounded-xl px-4 py-3">
                <input type="tel" placeholder="+7 (___) ___-__-__" className="bg-transparent text-sm outline-none text-white placeholder-white/30 w-full" />
              </div>
              <p className="text-xs text-white/40 text-center">Человеку придёт запрос на подтверждение отслеживания</p>
              <button className="w-full py-3 rounded-xl bg-[#00FFB3] text-[#080c17] font-semibold glow-green hover:scale-[1.02] transition-transform" onClick={() => setShowAddContact(false)}>
                Отправить запрос
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
