import { useEffect, useRef } from "react";
import L from "leaflet";
import Icon from "@/components/ui/icon";
import { contacts, statusColor } from "./types";
import type { Contact, Zone } from "./types";

interface MapTabProps {
  zoneList: Zone[];
  selectedContact: Contact | null;
  setSelectedContact: (c: Contact | null) => void;
}

const MY_LAT = 55.7600;
const MY_LNG = 37.6050;

function createContactIcon(contact: Contact): L.DivIcon {
  const isOffline = contact.status === "offline";
  const pulse = contact.status === "online"
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;background:${contact.color}25;animation:ping-slow 2.5s ease-out infinite;"></div>`
    : "";
  return L.divIcon({
    className: "",
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    html: `
      <div style="position:relative;width:40px;height:48px;display:flex;flex-direction:column;align-items:center;">
        ${pulse}
        <div style="
          width:40px;height:40px;border-radius:50%;
          background:${isOffline ? "#333" : contact.color};
          box-shadow:${isOffline ? "none" : `0 0 16px ${contact.color}60`};
          display:flex;align-items:center;justify-content:center;
          font-weight:700;font-size:15px;color:#080c17;
          font-family:'Golos Text',sans-serif;
          position:relative;z-index:1;
          border:2px solid rgba(255,255,255,0.15);
          ${isOffline ? "opacity:0.5;" : ""}
        ">${contact.name.charAt(0)}</div>
        <div style="
          width:8px;height:8px;border-radius:50%;margin-top:-2px;
          background:${statusColor[contact.status]};
          border:2px solid #080c17;
          box-shadow:0 0 6px ${statusColor[contact.status]};
          position:relative;z-index:1;
        "></div>
      </div>
    `,
  });
}

function createMyIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:-20px;border-radius:50%;background:#00FFB320;animation:pulse-ring 2s ease-out infinite;"></div>
        <div style="width:20px;height:20px;border-radius:50%;background:#00FFB3;border:2px solid white;box-shadow:0 0 20px #00FFB380;animation:float 3s ease-in-out infinite;"></div>
      </div>
    `,
  });
}

export default function MapTab({ zoneList, selectedContact, setSelectedContact }: MapTabProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const zonesRef = useRef<Map<number, L.Circle>>(new Map());
  const popupRef = useRef<L.Popup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [MY_LAT, MY_LNG],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.marker([MY_LAT, MY_LNG], { icon: createMyIcon(), zIndexOffset: 1000 }).addTo(map);

    contacts.forEach(c => {
      const marker = L.marker([c.lat, c.lng], { icon: createContactIcon(c) });
      marker.on("click", () => {
        setSelectedContact(c);
      });
      marker.addTo(map);
      markersRef.current.set(c.id, marker);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    zonesRef.current.forEach(circle => circle.remove());
    zonesRef.current.clear();

    zoneList.forEach(z => {
      if (!z.active) return;
      const circle = L.circle([z.lat, z.lng], {
        radius: z.radius,
        color: z.color,
        fillColor: z.color,
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: "6 4",
        opacity: 0.5,
      });
      circle.bindTooltip(z.name, {
        permanent: true,
        direction: "center",
        className: "zone-tooltip",
      });
      circle.addTo(map);
      zonesRef.current.set(z.id, circle);
    });
  }, [zoneList]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    if (selectedContact) {
      map.panTo([selectedContact.lat, selectedContact.lng], { animate: true, duration: 0.5 });
    }
  }, [selectedContact]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleCenter = () => mapRef.current?.panTo([MY_LAT, MY_LNG], { animate: true, duration: 0.5 });

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex-1 relative overflow-hidden">
        <style>{`
          .zone-tooltip {
            background: rgba(8,12,23,0.85) !important;
            border: none !important;
            box-shadow: none !important;
            color: #fff !important;
            font-size: 10px !important;
            font-family: 'Golos Text', sans-serif !important;
            font-weight: 600 !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
          }
          .zone-tooltip::before { display:none !important; }
          .leaflet-container { background: #080c17; }
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.8; }
            70% { transform: scale(1.8); opacity: 0; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        `}</style>

        <div ref={containerRef} className="w-full h-full" />

        {/* Contact popup */}
        {selectedContact && (
          <div className="absolute glass rounded-2xl p-4 w-60 animate-slide-up z-[1000] top-4 left-4"
            style={{ borderColor: selectedContact.color + '40', borderWidth: 1 }}>
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

        {/* Zoom controls */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-[1000]">
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover" onClick={handleZoomIn}>
            <Icon name="Plus" size={18} className="text-[#00FFB3]" />
          </button>
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover" onClick={handleZoomOut}>
            <Icon name="Minus" size={18} className="text-white/50" />
          </button>
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover mt-1" onClick={handleCenter}>
            <Icon name="Crosshair" size={18} className="text-[#00C2FF]" />
          </button>
        </div>

        {/* Online count */}
        <div className="absolute left-4 bottom-4 glass rounded-2xl px-4 py-2 flex items-center gap-2 z-[1000]">
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
