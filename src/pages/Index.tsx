import { useState } from "react";
import Icon from "@/components/ui/icon";
import { contacts, historyData, initialNotifs, initialZones } from "@/components/tracker/types";
import type { Tab, Contact, HistoryEntry, Notification, PrivacySettings } from "@/components/tracker/types";
import MapTab from "@/components/tracker/MapTab";
import ContactsTab from "@/components/tracker/ContactsTab";
import ZonesTab from "@/components/tracker/ZonesTab";
import HistoryTab from "@/components/tracker/HistoryTab";
import ProfileTab from "@/components/tracker/ProfileTab";

const tabs = [
  { id: "map" as Tab, icon: "Map", label: "Карта" },
  { id: "contacts" as Tab, icon: "Users", label: "Контакты" },
  { id: "zones" as Tab, icon: "Shield", label: "Геозоны" },
  { id: "history" as Tab, icon: "Route", label: "История" },
  { id: "profile" as Tab, icon: "User", label: "Профиль" },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(historyData[0]);
  const [notifList, setNotifList] = useState<Notification[]>(initialNotifs);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareLocation: true,
    allowRequests: true,
    showBattery: true,
    historyDays: 30,
  });
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [zoneList, setZoneList] = useState(initialZones);

  const unreadCount = notifList.filter(n => !n.read).length;
  const markAllRead = () => setNotifList(prev => prev.map(n => ({ ...n, read: true })));
  const toggleZone = (id: number) => setZoneList(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));

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
        {activeTab === "map" && (
          <MapTab
            zoneList={zoneList}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
          />
        )}
        {activeTab === "contacts" && (
          <ContactsTab
            setActiveTab={setActiveTab}
            setSelectedContact={setSelectedContact}
            showAddContact={showAddContact}
            setShowAddContact={setShowAddContact}
          />
        )}
        {activeTab === "zones" && (
          <ZonesTab
            zoneList={zoneList}
            toggleZone={toggleZone}
            showAddZone={showAddZone}
            setShowAddZone={setShowAddZone}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab
            selectedHistory={selectedHistory}
            setSelectedHistory={setSelectedHistory}
          />
        )}
        {activeTab === "profile" && (
          <ProfileTab
            notifList={notifList}
            markAllRead={markAllRead}
            privacySettings={privacySettings}
            setPrivacySettings={setPrivacySettings}
          />
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
