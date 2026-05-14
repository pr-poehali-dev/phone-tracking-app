import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const SESSION_ID = "nav-default";

interface Marker {
  id?: number;
  name: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  color: string;
  icon: string;
}

interface TrackPoint {
  lat: number;
  lng: number;
  ts: number;
}

interface SavedTrack {
  id: number;
  name: string;
  points: TrackPoint[];
  distance_m: number;
  duration_s: number;
  created_at: string;
}

const CATEGORIES = [
  { id: "fishing", label: "Рыбалка", icon: "Fish", color: "#00C2FF" },
  { id: "hunting", label: "Охота", icon: "Target", color: "#FF6B35" },
  { id: "camp", label: "Лагерь", icon: "Tent", color: "#00FFB3" },
  { id: "danger", label: "Опасность", icon: "AlertTriangle", color: "#FF4444" },
  { id: "road", label: "Дорога", icon: "Route", color: "#B44DFF" },
  { id: "general", label: "Метка", icon: "MapPin", color: "#FFB800" },
];

const MAP_LAYERS = [
  { id: "dark", label: "Ночная", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" },
  { id: "osm", label: "Стандарт", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
  { id: "topo", label: "Топо", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
  { id: "satellite", label: "Спутник", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
];

function calcDistance(pts: TrackPoint[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    const R = 6371000;
    const dLat = (pts[i].lat - pts[i - 1].lat) * Math.PI / 180;
    const dLng = (pts[i].lng - pts[i - 1].lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(pts[i - 1].lat * Math.PI / 180) * Math.cos(pts[i].lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    d += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return d;
}

function formatDist(m: number): string {
  return m < 1000 ? `${Math.round(m)} м` : `${(m / 1000).toFixed(2)} км`;
}

function formatDur(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}ч ${m}м` : m > 0 ? `${m}м ${sec}с` : `${sec}с`;
}

function createMarkerIcon(cat: typeof CATEGORIES[0]): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:36px;height:36px;border-radius:50%;background:${cat.color};box-shadow:0 0 12px ${cat.color}80;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.2);">
        <span style="font-size:16px;">
          ${{ fishing: "🎣", hunting: "🎯", camp: "⛺", danger: "⚠️", road: "🛣️", general: "📍" }[cat.id] || "📍"}
        </span>
      </div>
      <div style="width:2px;height:8px;background:${cat.color};"></div>
    </div>`,
  });
}

function createMyIcon(heading: number | null): L.DivIcon {
  const arrow = heading !== null
    ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%) rotate(${heading}deg);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:14px solid #00FFB3;"></div>`
    : "";
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;inset:-16px;border-radius:50%;background:#00FFB318;animation:pulse-ring 2s ease-out infinite;"></div>
      <div style="width:24px;height:24px;border-radius:50%;background:#00FFB3;border:3px solid white;box-shadow:0 0 20px #00FFB380;"></div>
      ${arrow}
    </div>`,
  });
}

export default function MapTab() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const myMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const trackLineRef = useRef<L.Polyline | null>(null);
  const leafletMarkersRef = useRef<Map<number | string, L.Marker>>(new Map());

  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [tracks, setTracks] = useState<SavedTrack[]>([]);

  const [isTracking, setIsTracking] = useState(false);
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([]);
  const [trackStart, setTrackStart] = useState<Date | null>(null);
  const trackPointsRef = useRef<TrackPoint[]>([]);

  const [panel, setPanel] = useState<"none" | "markers" | "tracks" | "layers" | "cache" | "add_marker">("none");
  const [activeLayer, setActiveLayer] = useState("dark");
  const [cacheStatus, setCacheStatus] = useState<string>("");
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [followMe, setFollowMe] = useState(true);

  const [newMarker, setNewMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [newMarkerName, setNewMarkerName] = useState("");
  const [newMarkerDesc, setNewMarkerDesc] = useState("");
  const [newMarkerCat, setNewMarkerCat] = useState("fishing");

  const watchIdRef = useRef<number | null>(null);
  const swRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    navigator.serviceWorker?.register('/sw.js').then(reg => {
      swRef.current = reg.active || reg.installing || reg.waiting;
      reg.addEventListener('updatefound', () => {
        swRef.current = reg.installing;
      });
    });
  }, []);

  useEffect(() => {
    loadMarkers();
    loadTracks();
  }, []);

  async function loadMarkers() {
    try {
      const res = await fetch(`${func2url.markers}?session_id=${SESSION_ID}`);
      const data = await res.json();
      setMarkers(data.markers || []);
    } catch (e) { console.warn('markers load', e); }
  }

  async function loadTracks() {
    try {
      const res = await fetch(`${func2url.tracks}?session_id=${SESSION_ID}`);
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (e) { console.warn('tracks load', e); }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [55.76, 37.64],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    const layer = MAP_LAYERS.find(l => l.id === activeLayer) || MAP_LAYERS[0];
    const tl = L.tileLayer(layer.url, { maxZoom: 19 });
    tl.addTo(map);
    tileLayerRef.current = tl;

    map.on('click', (e: L.LeafletMouseEvent) => {
      setNewMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
      setNewMarkerName("");
      setNewMarkerDesc("");
      setNewMarkerCat("fishing");
      setPanel("add_marker");
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const layer = MAP_LAYERS.find(l => l.id === activeLayer) || MAP_LAYERS[0];
    tileLayerRef.current.setUrl(layer.url);
  }, [activeLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    leafletMarkersRef.current.forEach(m => m.remove());
    leafletMarkersRef.current.clear();

    markers.forEach(mk => {
      const cat = CATEGORIES.find(c => c.id === mk.category) || CATEGORIES[5];
      const lm = L.marker([mk.lat, mk.lng], { icon: createMarkerIcon(cat) });
      lm.bindPopup(`
        <div style="color:#fff;font-family:'Golos Text',sans-serif;min-width:160px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${mk.name}</div>
          ${mk.description ? `<div style="font-size:12px;opacity:0.7;margin-bottom:6px;">${mk.description}</div>` : ""}
          <div style="font-size:11px;opacity:0.5;">${mk.lat.toFixed(6)}, ${mk.lng.toFixed(6)}</div>
          <button onclick="window._deleteMarker(${mk.id})" style="margin-top:8px;background:#FF444440;border:1px solid #FF4444;color:#FF4444;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;">Удалить</button>
        </div>
      `, { className: "nav-popup" });
      lm.addTo(map);
      if (mk.id) leafletMarkersRef.current.set(mk.id, lm);
    });

    (window as unknown as Record<string, unknown>)._deleteMarker = async (id: number) => {
      await fetch(`${func2url.markers}?id=${id}`, { method: 'DELETE' });
      setMarkers(prev => prev.filter(m => m.id !== id));
      map.closePopup();
    };
  }, [markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (trackLineRef.current) { trackLineRef.current.remove(); trackLineRef.current = null; }
    if (trackPoints.length > 1) {
      const line = L.polyline(trackPoints.map(p => [p.lat, p.lng]), {
        color: '#00FFB3', weight: 3, opacity: 0.8, dashArray: isTracking ? undefined : '8 4'
      });
      line.addTo(map);
      trackLineRef.current = line;
    }
  }, [trackPoints, isTracking]);

  useEffect(() => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed: spd, heading: hdg } = pos.coords;
        setMyPos({ lat: latitude, lng: longitude });
        setGpsAccuracy(Math.round(accuracy));
        setSpeed(spd ? Math.round(spd * 3.6) : null);
        if (hdg !== null) setHeading(hdg);

        const map = mapRef.current;
        if (!myMarkerRef.current && map) {
          myMarkerRef.current = L.marker([latitude, longitude], {
            icon: createMyIcon(hdg),
            zIndexOffset: 1000
          }).addTo(map);
        } else if (myMarkerRef.current) {
          myMarkerRef.current.setLatLng([latitude, longitude]);
          myMarkerRef.current.setIcon(createMyIcon(hdg));
        }

        if (followMe && map) {
          map.panTo([latitude, longitude], { animate: true, duration: 0.3 });
        }

        if (isTracking) {
          const pt: TrackPoint = { lat: latitude, lng: longitude, ts: Date.now() };
          trackPointsRef.current = [...trackPointsRef.current, pt];
          setTrackPoints([...trackPointsRef.current]);
        }
      },
      (err) => console.warn('GPS:', err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [followMe, isTracking]);

  const startTracking = () => {
    trackPointsRef.current = [];
    setTrackPoints([]);
    setTrackStart(new Date());
    setIsTracking(true);
  };

  const stopTracking = async () => {
    setIsTracking(false);
    const pts = trackPointsRef.current;
    if (pts.length < 2) return;
    const dist = calcDistance(pts);
    const dur = trackStart ? Math.round((Date.now() - trackStart.getTime()) / 1000) : 0;
    const name = `Трек ${new Date().toLocaleDateString('ru')} ${new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
    await fetch(func2url.tracks, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: SESSION_ID, name, points: pts, distance_m: dist, duration_s: dur, started_at: trackStart?.toISOString(), finished_at: new Date().toISOString() })
    });
    loadTracks();
  };

  const saveMarker = async () => {
    if (!newMarker || !newMarkerName.trim()) return;
    const cat = CATEGORIES.find(c => c.id === newMarkerCat) || CATEGORIES[5];
    await fetch(func2url.markers, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: SESSION_ID, name: newMarkerName, description: newMarkerDesc, category: newMarkerCat, lat: newMarker.lat, lng: newMarker.lng, color: cat.color, icon: cat.icon })
    });
    setPanel("none");
    setNewMarker(null);
    loadMarkers();
  };

  const cacheTiles = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const sw = navigator.serviceWorker?.controller;
    if (!sw) { setCacheStatus("Service Worker не активен"); return; }

    setCacheLoading(true);
    setCacheStatus("Генерирую список тайлов...");

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const minZ = Math.max(zoom - 2, 1);
    const maxZ = Math.min(zoom + 2, 17);
    const layer = MAP_LAYERS.find(l => l.id === activeLayer) || MAP_LAYERS[0];

    const tiles: string[] = [];
    for (let z = minZ; z <= maxZ; z++) {
      const ne = bounds.getNorthEast();
      const sw2 = bounds.getSouthWest();
      const x1 = Math.floor((sw2.lng + 180) / 360 * Math.pow(2, z));
      const x2 = Math.floor((ne.lng + 180) / 360 * Math.pow(2, z));
      const lat1r = ne.lat * Math.PI / 180;
      const lat2r = sw2.lat * Math.PI / 180;
      const y1 = Math.floor((1 - Math.log(Math.tan(lat1r) + 1 / Math.cos(lat1r)) / Math.PI) / 2 * Math.pow(2, z));
      const y2 = Math.floor((1 - Math.log(Math.tan(lat2r) + 1 / Math.cos(lat2r)) / Math.PI) / 2 * Math.pow(2, z));
      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
          const url = layer.url
            .replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
            .replace('{s}', ['a', 'b', 'c'][Math.floor(Math.random() * 3)])
            .replace('{r}', '@2x');
          tiles.push(url);
        }
      }
    }

    const limited = tiles.slice(0, 500);
    setCacheStatus(`Скачиваю ${limited.length} тайлов...`);

    const ch = new MessageChannel();
    ch.port1.onmessage = (e) => {
      if (e.data.type === 'CACHE_DONE') {
        setCacheLoading(false);
        setCacheStatus(`Готово! Сохранено ${e.data.cached} тайлов`);
        setCacheCount(prev => prev + e.data.cached);
      }
    };
    sw.postMessage({ type: 'CACHE_TILES', tiles: limited }, [ch.port2]);
  }, [activeLayer]);

  const centerOnMe = () => {
    if (myPos && mapRef.current) {
      mapRef.current.panTo([myPos.lat, myPos.lng], { animate: true, duration: 0.5 });
      setFollowMe(true);
    }
  };

  const showTrack = (track: SavedTrack) => {
    const map = mapRef.current;
    if (!map) return;
    if (trackLineRef.current) { trackLineRef.current.remove(); trackLineRef.current = null; }
    if (track.points && track.points.length > 1) {
      const line = L.polyline(track.points.map((p: TrackPoint) => [p.lat, p.lng]), { color: '#B44DFF', weight: 3, opacity: 0.9 });
      line.addTo(map);
      trackLineRef.current = line;
      map.fitBounds(line.getBounds(), { padding: [40, 40] });
    }
    setPanel("none");
  };

  const deleteTrack = async (id: number) => {
    await fetch(`${func2url.tracks}?id=${id}`, { method: 'DELETE' });
    setTracks(prev => prev.filter(t => t.id !== id));
  };

  const trackDist = calcDistance(trackPoints);
  const trackDur = trackStart ? Math.round((Date.now() - trackStart.getTime()) / 1000) : 0;

  return (
    <div className="h-full flex flex-col relative animate-fade-in">
      <style>{`
        .nav-popup .leaflet-popup-content-wrapper {
          background: rgba(8,12,23,0.92) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 0 24px rgba(0,255,179,0.15) !important;
        }
        .nav-popup .leaflet-popup-tip { background: rgba(8,12,23,0.92) !important; }
        .leaflet-container { background: #0a0e1a; }
        @keyframes ping-slow { 0%{transform:scale(1);opacity:.8} 70%{transform:scale(2);opacity:0} 100%{transform:scale(2);opacity:0} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2.5);opacity:0} }
      `}</style>

      <div ref={containerRef} className="w-full h-full" onClick={() => mapRef.current && setFollowMe(false)} />

      {/* GPS Info Bar */}
      <div className="absolute top-2 left-2 right-2 z-[1000] pointer-events-none">
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-3 text-xs">
          <div className={`w-2 h-2 rounded-full ${myPos ? 'bg-[#00FFB3]' : 'bg-yellow-500 animate-blink'}`} />
          <span className="text-white/60">{myPos ? `${myPos.lat.toFixed(5)}, ${myPos.lng.toFixed(5)}` : 'Поиск GPS...'}</span>
          {gpsAccuracy && <span className="text-white/40">±{gpsAccuracy}м</span>}
          {speed !== null && speed > 0 && <span className="text-[#00FFB3] ml-auto">{speed} км/ч</span>}
        </div>
      </div>

      {/* Track Recording Bar */}
      {isTracking && (
        <div className="absolute top-12 left-2 right-2 z-[1000]">
          <div className="glass rounded-xl px-3 py-2 flex items-center gap-3 border border-[#00FFB3]/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-blink" />
            <span className="text-xs text-[#00FFB3] font-medium">Запись трека</span>
            <span className="text-xs text-white/50 ml-auto">{formatDist(trackDist)}</span>
            <span className="text-xs text-white/50">{formatDur(trackDur)}</span>
            <button onClick={stopTracking} className="text-xs bg-red-500/20 border border-red-500/40 text-red-400 px-2 py-1 rounded-lg">Стоп</button>
          </div>
        </div>
      )}

      {/* Right Controls */}
      <div className="absolute right-3 bottom-20 flex flex-col gap-2 z-[1000]">
        <button onClick={() => mapRef.current?.zoomIn()} className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover">
          <Icon name="Plus" size={18} className="text-white/70" />
        </button>
        <button onClick={() => mapRef.current?.zoomOut()} className="w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover">
          <Icon name="Minus" size={18} className="text-white/70" />
        </button>
        <button onClick={centerOnMe} className={`w-10 h-10 glass rounded-xl flex items-center justify-center glass-hover ${followMe ? 'border border-[#00FFB3]/50' : ''}`}>
          <Icon name="Crosshair" size={18} className={followMe ? "text-[#00FFB3]" : "text-white/70"} />
        </button>
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-2 left-2 right-2 z-[1000]">
        <div className="glass rounded-2xl p-2 flex items-center justify-around">
          <button onClick={() => setPanel(panel === "markers" ? "none" : "markers")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${panel === "markers" ? "bg-[#00FFB3]/10" : ""}`}>
            <Icon name="MapPin" size={18} className={panel === "markers" ? "text-[#00FFB3]" : "text-white/50"} />
            <span className={`text-[9px] ${panel === "markers" ? "text-[#00FFB3]" : "text-white/40"}`}>Метки ({markers.length})</span>
          </button>
          <button onClick={() => { if (!isTracking) startTracking(); else stopTracking(); }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isTracking ? "bg-red-500/10" : ""}`}>
            <Icon name={isTracking ? "Square" : "Play"} size={18} className={isTracking ? "text-red-400" : "text-white/50"} />
            <span className={`text-[9px] ${isTracking ? "text-red-400" : "text-white/40"}`}>{isTracking ? "Стоп" : "Трек"}</span>
          </button>
          <button onClick={() => setPanel(panel === "tracks" ? "none" : "tracks")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${panel === "tracks" ? "bg-[#B44DFF]/10" : ""}`}>
            <Icon name="Route" size={18} className={panel === "tracks" ? "text-[#B44DFF]" : "text-white/50"} />
            <span className={`text-[9px] ${panel === "tracks" ? "text-[#B44DFF]" : "text-white/40"}`}>Треки ({tracks.length})</span>
          </button>
          <button onClick={() => setPanel(panel === "layers" ? "none" : "layers")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${panel === "layers" ? "bg-[#00C2FF]/10" : ""}`}>
            <Icon name="Layers" size={18} className={panel === "layers" ? "text-[#00C2FF]" : "text-white/50"} />
            <span className={`text-[9px] ${panel === "layers" ? "text-[#00C2FF]" : "text-white/40"}`}>Карта</span>
          </button>
          <button onClick={() => setPanel(panel === "cache" ? "none" : "cache")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${panel === "cache" ? "bg-[#FFB800]/10" : ""}`}>
            <Icon name="Download" size={18} className={panel === "cache" ? "text-[#FFB800]" : "text-white/50"} />
            <span className={`text-[9px] ${panel === "cache" ? "text-[#FFB800]" : "text-white/40"}`}>Офлайн</span>
          </button>
        </div>
      </div>

      {/* Add Marker Panel */}
      {panel === "add_marker" && newMarker && (
        <div className="absolute inset-x-3 bottom-24 z-[2000] glass rounded-2xl p-4 animate-slide-up border border-[#00FFB3]/20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Новая метка</span>
            <button onClick={() => { setPanel("none"); setNewMarker(null); }} className="text-white/40 hover:text-white">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="text-xs text-white/40 mb-3">{newMarker.lat.toFixed(5)}, {newMarker.lng.toFixed(5)}</div>
          <input value={newMarkerName} onChange={e => setNewMarkerName(e.target.value)}
            placeholder="Название метки"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 mb-2 outline-none focus:border-[#00FFB3]/40" />
          <input value={newMarkerDesc} onChange={e => setNewMarkerDesc(e.target.value)}
            placeholder="Описание (необязательно)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 mb-3 outline-none focus:border-[#00FFB3]/40" />
          <div className="grid grid-cols-3 gap-2 mb-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setNewMarkerCat(cat.id)}
                className={`py-2 rounded-lg text-xs font-medium transition-all border ${newMarkerCat === cat.id ? 'border-opacity-60' : 'border-white/10 bg-white/5 text-white/50'}`}
                style={newMarkerCat === cat.id ? { borderColor: cat.color, background: cat.color + '20', color: cat.color } : {}}>
                {cat.label}
              </button>
            ))}
          </div>
          <button onClick={saveMarker} disabled={!newMarkerName.trim()}
            className="w-full py-2.5 bg-[#00FFB3]/20 border border-[#00FFB3]/40 text-[#00FFB3] rounded-xl font-medium text-sm disabled:opacity-30">
            Сохранить метку
          </button>
        </div>
      )}

      {/* Markers Panel */}
      {panel === "markers" && (
        <div className="absolute inset-x-3 bottom-24 z-[2000] glass rounded-2xl p-4 max-h-72 flex flex-col animate-slide-up border border-[#00FFB3]/20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-[#00FFB3]">Метки ({markers.length})</span>
            <button onClick={() => setPanel("none")} className="text-white/40"><Icon name="X" size={16} /></button>
          </div>
          <div className="overflow-y-auto flex-1 space-y-2 text-sm">
            {markers.length === 0 && <p className="text-white/30 text-center py-4 text-xs">Нажми на карту чтобы добавить метку</p>}
            {markers.map(mk => {
              const cat = CATEGORIES.find(c => c.id === mk.category) || CATEGORIES[5];
              return (
                <div key={mk.id} className="flex items-center gap-3 glass rounded-xl p-2.5 cursor-pointer hover:bg-white/5"
                  onClick={() => { mapRef.current?.panTo([mk.lat, mk.lng]); setPanel("none"); }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background: cat.color + '20', border: `1px solid ${cat.color}40` }}>
                    {{ fishing: "🎣", hunting: "🎯", camp: "⛺", danger: "⚠️", road: "🛣️", general: "📍" }[cat.id] || "📍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{mk.name}</div>
                    {mk.description && <div className="text-xs text-white/40 truncate">{mk.description}</div>}
                    <div className="text-xs text-white/30">{mk.lat.toFixed(4)}, {mk.lng.toFixed(4)}</div>
                  </div>
                  <button onClick={async (e) => { e.stopPropagation(); await fetch(`${func2url.markers}?id=${mk.id}`, { method: 'DELETE' }); loadMarkers(); }}
                    className="text-red-400/50 hover:text-red-400 shrink-0">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracks Panel */}
      {panel === "tracks" && (
        <div className="absolute inset-x-3 bottom-24 z-[2000] glass rounded-2xl p-4 max-h-72 flex flex-col animate-slide-up border border-[#B44DFF]/20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-[#B44DFF]">Треки ({tracks.length})</span>
            <button onClick={() => setPanel("none")} className="text-white/40"><Icon name="X" size={16} /></button>
          </div>
          <div className="overflow-y-auto flex-1 space-y-2">
            {tracks.length === 0 && <p className="text-white/30 text-center py-4 text-xs">Нажми "Трек" чтобы начать запись</p>}
            {tracks.map(track => (
              <div key={track.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <div onClick={() => showTrack(track)} className="flex-1 cursor-pointer">
                  <div className="font-medium text-sm truncate">{track.name}</div>
                  <div className="flex gap-3 mt-1 text-xs text-white/40">
                    <span><Icon name="Route" size={10} className="inline mr-1" />{formatDist(track.distance_m)}</span>
                    <span><Icon name="Clock" size={10} className="inline mr-1" />{formatDur(track.duration_s)}</span>
                  </div>
                </div>
                <button onClick={() => deleteTrack(track.id)} className="text-red-400/50 hover:text-red-400 shrink-0">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layers Panel */}
      {panel === "layers" && (
        <div className="absolute inset-x-3 bottom-24 z-[2000] glass rounded-2xl p-4 animate-slide-up border border-[#00C2FF]/20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-[#00C2FF]">Слой карты</span>
            <button onClick={() => setPanel("none")} className="text-white/40"><Icon name="X" size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MAP_LAYERS.map(layer => (
              <button key={layer.id} onClick={() => { setActiveLayer(layer.id); setPanel("none"); }}
                className={`py-3 rounded-xl text-sm font-medium border transition-all ${activeLayer === layer.id ? 'border-[#00C2FF]/60 bg-[#00C2FF]/10 text-[#00C2FF]' : 'border-white/10 bg-white/5 text-white/50'}`}>
                {layer.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cache Panel */}
      {panel === "cache" && (
        <div className="absolute inset-x-3 bottom-24 z-[2000] glass rounded-2xl p-4 animate-slide-up border border-[#FFB800]/20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-[#FFB800]">Офлайн-карта</span>
            <button onClick={() => setPanel("none")} className="text-white/40"><Icon name="X" size={16} /></button>
          </div>
          <p className="text-xs text-white/50 mb-4">Сохранить текущую область карты для работы без интернета. Настрой нужный масштаб и нажми кнопку.</p>
          {cacheStatus && <p className="text-xs text-[#FFB800] mb-3">{cacheStatus}</p>}
          {cacheCount > 0 && <p className="text-xs text-white/40 mb-3">Сохранено тайлов: {cacheCount}</p>}
          <button onClick={cacheTiles} disabled={cacheLoading}
            className="w-full py-2.5 bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] rounded-xl font-medium text-sm disabled:opacity-50 mb-2">
            {cacheLoading ? "Скачиваю..." : "Скачать текущую область"}
          </button>
          <p className="text-[10px] text-white/25 text-center">Сохраняется до {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ru')}</p>
        </div>
      )}
    </div>
  );
}