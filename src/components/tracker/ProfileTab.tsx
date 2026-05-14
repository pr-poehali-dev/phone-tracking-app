import Icon from "@/components/ui/icon";
import type { Notification, PrivacySettings } from "./types";

interface ProfileTabProps {
  notifList: Notification[];
  markAllRead: () => void;
  privacySettings: PrivacySettings;
  setPrivacySettings: React.Dispatch<React.SetStateAction<PrivacySettings>>;
}

export default function ProfileTab({ notifList, markAllRead, privacySettings, setPrivacySettings }: ProfileTabProps) {
  return (
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
                  style={{ background: privacySettings[item.key as keyof PrivacySettings] ? `${item.color}30` : 'rgba(255,255,255,0.08)', border: `1px solid ${privacySettings[item.key as keyof PrivacySettings] ? item.color + '60' : 'transparent'}` }}
                  onClick={() => setPrivacySettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof PrivacySettings] }))}>
                  <div className="absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300"
                    style={{ left: privacySettings[item.key as keyof PrivacySettings] ? '26px' : '2px', background: privacySettings[item.key as keyof PrivacySettings] ? item.color : '#555' }} />
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
  );
}
