import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "map" | "contacts" | "zones" | "history" | "profile";

interface Contact {
  id: number;
  name: string;
  phone: string;
  status: "online" | "offline" | "away";
  location: string;
  lastSeen: string;
  battery: number;
  x: number;
  y: number;
  color: string;
}

interface Zone {
  id: number;
  name: string;
  address: string;
  radius: number;
  active: boolean;
  color: string;
  x: number;
  y: number;
  triggers: number;
}

interface HistoryEntry {
  id: number;
  contactName: string;
  contactColor: string;
  date: string;
  points: number;
  distance: string;
  duration: string;
  path: { x: number; y: number }[];
}

interface Notification {
  id: number;
  type: "enter" | "exit" | "low_battery" | "request";
  contact: string;
  zone?: string;
  time: string;
  read: boolean;
}

const contacts: Contact[] = [
  { id: 1, name: "Анна Смирнова", phone: "+7 916 123-45-67", status: "online", location: "Москва, Арбат", lastSeen: "сейчас", battery: 78, x: 38, y: 35, color: "#00FFB3" },
  { id: 2, name: "Дмитрий Козлов", phone: "+7 926 987-65-43", status: "online", location: "Москва, Центр", lastSeen: "сейчас", battery: 45, x: 60, y: 45, color: "#B44DFF" },
  { id: 3, name: "Мария Петрова", phone: "+7 985 555-12-34", status: "away", location: "Москва, Сокол", lastSeen: "5 мин назад", battery: 92, x: 45, y: 62, color: "#00C2FF" },
  { id: 4, name: "Сергей Иванов", phone: "+7 903 777-88-99", status: "offline", location: "Москва, Войковская", lastSeen: "2 часа назад", battery: 15, x: 70, y: 30, color: "#FF6B35" },
];

const zones: Zone[] = [
  { id: 1, name: "Дом", address: "ул. Тверская, 12", radius: 200, active: true, color: "#00FFB3", x: 38, y: 35, triggers: 24 },
  { id: 2, name: "Работа", address: "Новый Арбат, 36", radius: 300, active: true, color: "#B44DFF", x: 60, y: 48, triggers: 18 },
  { id: 3, name: "Школа", address: "ул. Садовая, 5", radius: 150, active: false, color: "#00C2FF", x: 30, y: 65, triggers: 7 },
];

const historyData: HistoryEntry[] = [
  { id: 1, contactName: "Анна Смирнова", contactColor: "#00FFB3", date: "Сегодня, 14 мая", points: 12, distance: "8.4 км", duration: "1ч 23м", path: [{x:20,y:70},{x:30,y:55},{x:38,y:35},{x:50,y:28},{x:65,y:40},{x:72,y:60}] },
  { id: 2, contactName: "Дмитрий Козлов", contactColor: "#B44DFF", date: "Вчера, 13 мая", points: 8, distance: "5.1 км", duration: "0ч 47м", path: [{x:25,y:30},{x:40,y:42},{x:60,y:45},{x:75,y:55}] },
  { id: 3, contactName: "Мария Петрова", contactColor: "#00C2FF", date: "12 мая", points: 15, distance: "12.7 км", duration: "2ч 08м", path: [{x:15,y:80},{x:30,y:65},{x:45,y:62},{x:60,y:50},{x:80,y:35}] },
];

const initialNotifs: Notification[] = [
  { id: 1, type: "enter", contact: "Анна", zone: "Дом", time: "5 мин назад", read: false },
  { id: 2, type: "exit", contact: "Дмитрий", zone: "Работа", time: "23 мин назад", read: false },
  { id: 3, type: "low_battery", contact: "Сергей", time: "1 час назад", read: false },
  { id: 4, type: "enter", contact: "Мария", zone: "Школа", time: "2 часа назад", read: true },
  { id: 5, type: "request", contact: "Новый контакт", time: "3 часа назад", read: true },
];

const statusColor: Record<string, string> = {
  online: "#00FFB3",
  away: "#FFB800",
  offline: "#666",
};

const statusLabel: Record<string, string> = {
  online: "Онлайн",
  away: "Отошёл",
  offline: "Офлайн",
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(historyData[0]);
  const [notifList, setNotifList] = useState(initialNotifs);
  const [privacySettings, setPrivacySettings] = useState({
    shareLocation: true,
    allowRequests: true,
    showBattery: true,
    historyDays: 30,
  });
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [zoneList, setZoneList] = useState(zones);
  const unreadCount = notifList.filter(n => !n.read).length;

  const markAllRead = () => setNotifList(prev => prev.map(n => ({ ...n, read: true })));
  const toggleZone = (id: number) => setZoneList(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));

  const tabs = [
    { id: "map" as Tab, icon: "Map", label: "Карта" },
    { id: "contacts" as Tab, icon: "Users", label: "Контакты" },
    { id: "zones" as Tab, icon: "Shield", label: "Геозоны" },
    { id: "history" as Tab, icon: "Route", label: "История" },
    { id: "profile" as Tab, icon: "User", label: "Профиль" },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c17] text-white select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 glass border-b border-white/5 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFB3] to-[#00C2FF] flex items-center justify-center glow-green">
            <Icon name="Locate" size={16} className="text-[#080c17]" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Track<span className="neon-green">Me</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative w-9 h-9 rounded-xl glass flex items-center justify-center glass-hover"
            onClick={() => { setActiveTab("profile"); markAllRead(); }}
          >
            <Icon name="Bell" size={16} className="text-white/70" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B44DFF] text-[10px] font-bold flex items-center justify-center glow-purple">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B44DFF] to-[#00C2FF] flex items-center justify-center text-sm font-bold">
            ВА
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden relative">

        {/* MAP TAB */}
        {activeTab === "map" && (
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
        )}

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
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
        )}

        {/* ZONES TAB */}
        {activeTab === "zones" && (
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
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
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
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="h-full overflow-y-auto animate-fade-in">
            <div className="px-5 pt-6 pb-6 space-y-4">
              <div className="glass rounded-3xl p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#B44DFF]/10 to-transparent" />
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B44DFF] to-[#00C2FF] flex items-center justify-center text-3xl font-bold mx-auto mb-3 animate-float"
                    style={{ boxShadow: '0 0 30px #B44DFF50' }}>
                    ВА
                  </div>
                  <h2 className="text-xl font-bold">Василий Андреев</h2>
                  <p className="text-white/50 text-sm">+7 916 000-11-22</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-[#00FFB3] animate-blink" />
                    <span className="text-xs text-[#00FFB3]">Отслеживание включено</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold" style={{ fontFamily: 'Oswald, sans-serif' }}>Уведомления</h3>
                  <button className="text-xs text-[#00FFB3]" onClick={markAllRead}>Прочитать все</button>
                </div>
                <div className="space-y-2">
                  {notifList.slice(0, 5).map(n => (
                    <div key={n.id} className={`glass rounded-xl p-3 flex items-start gap-3 transition-all ${!n.read ? 'border-l-2' : ''}`}
                      style={{ borderLeftColor: !n.read ? (n.type === "enter" ? "#00FFB3" : n.type === "exit" ? "#FF6B35" : n.type === "low_battery" ? "#FF4444" : "#B44DFF") : undefined }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: n.type === "enter" ? '#00FFB320' : n.type === "exit" ? '#FF6B3520' : n.type === "low_battery" ? '#FF444420' : '#B44DFF20' }}>
                        <Icon
                          name={n.type === "enter" ? "LogIn" : n.type === "exit" ? "LogOut" : n.type === "low_battery" ? "BatteryLow" : "UserPlus"}
                          size={14}
                          className={n.type === "enter" ? "text-[#00FFB3]" : n.type === "exit" ? "text-[#FF6B35]" : n.type === "low_battery" ? "text-red-400" : "text-[#B44DFF]"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-relaxed">
                          {n.type === "enter" && <><span className="text-[#00FFB3]">{n.contact}</span> вошёл в зону «{n.zone}»</>}
                          {n.type === "exit" && <><span className="text-[#FF6B35]">{n.contact}</span> покинул зону «{n.zone}»</>}
                          {n.type === "low_battery" && <><span className="text-red-400">{n.contact}</span> — низкий заряд батареи</>}
                          {n.type === "request" && <><span className="text-[#B44DFF]">{n.contact}</span> запрашивает доступ</>}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB3] shrink-0 mt-1" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3" style={{ fontFamily: 'Oswald, sans-serif' }}>Конфиденциальность</h3>
                <div className="glass rounded-2xl overflow-hidden mb-3">
                  {[
                    { key: "shareLocation", label: "Делиться геолокацией", desc: "Разрешить отслеживание", color: "#00FFB3" },
                    { key: "allowRequests", label: "Принимать запросы", desc: "От новых контактов", color: "#B44DFF" },
                    { key: "showBattery", label: "Показывать заряд", desc: "Виден всем контактам", color: "#00C2FF" },
                  ].map((item, i) => (
                    <div key={item.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < 2 ? 'border-b border-white/5' : ''}`}>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-white/40">{item.desc}</p>
                      </div>
                      <button
                        className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
                        style={{ background: privacySettings[item.key as keyof typeof privacySettings] ? `${item.color}30` : 'rgba(255,255,255,0.08)', border: `1px solid ${privacySettings[item.key as keyof typeof privacySettings] ? item.color + '60' : 'transparent'}` }}
                        onClick={() => setPrivacySettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof privacySettings] }))}>
                        <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300"
                          style={{ left: privacySettings[item.key as keyof typeof privacySettings] ? '26px' : '2px', background: privacySettings[item.key as keyof typeof privacySettings] ? item.color : '#555' }} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="glass rounded-2xl p-4 flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">История маршрутов</p>
                    <p className="text-xs text-white/40">Хранить {privacySettings.historyDays} дней</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center text-white/50"
                      onClick={() => setPrivacySettings(p => ({ ...p, historyDays: Math.max(7, p.historyDays - 7) }))}>
                      <Icon name="Minus" size={14} />
                    </button>
                    <span className="text-[#00FFB3] font-bold w-8 text-center">{privacySettings.historyDays}</span>
                    <button className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center text-white/50"
                      onClick={() => setPrivacySettings(p => ({ ...p, historyDays: Math.min(90, p.historyDays + 7) }))}>
                      <Icon name="Plus" size={14} />
                    </button>
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl glass text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                  <Icon name="LogOut" size={16} />
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="glass border-t border-white/5 shrink-0 px-2 py-2 z-10">
        <div className="flex justify-around">
          {tabs.map(tab => (
            <button key={tab.id}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-white/6' : 'hover:bg-white/4'}`}
              onClick={() => setActiveTab(tab.id)}>
              <Icon name={tab.icon} size={20}
                className={`transition-all duration-200 ${activeTab === tab.id ? '' : 'text-white/35'}`}
                style={activeTab === tab.id ? { color: '#00FFB3', filter: 'drop-shadow(0 0 6px #00FFB370)' } : undefined}
              />
              <span className={`text-[10px] font-medium transition-colors ${activeTab === tab.id ? 'text-[#00FFB3]' : 'text-white/35'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}