export type Tab = "map" | "contacts" | "zones" | "history" | "profile";

export interface Contact {
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

export interface Zone {
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

export interface HistoryEntry {
  id: number;
  contactName: string;
  contactColor: string;
  date: string;
  points: number;
  distance: string;
  duration: string;
  path: { x: number; y: number }[];
}

export interface Notification {
  id: number;
  type: "enter" | "exit" | "low_battery" | "request";
  contact: string;
  zone?: string;
  time: string;
  read: boolean;
}

export interface PrivacySettings {
  shareLocation: boolean;
  allowRequests: boolean;
  showBattery: boolean;
  historyDays: number;
}

export const contacts: Contact[] = [
  { id: 1, name: "Анна Смирнова", phone: "+7 916 123-45-67", status: "online", location: "Москва, Арбат", lastSeen: "сейчас", battery: 78, x: 38, y: 35, color: "#00FFB3" },
  { id: 2, name: "Дмитрий Козлов", phone: "+7 926 987-65-43", status: "online", location: "Москва, Центр", lastSeen: "сейчас", battery: 45, x: 60, y: 45, color: "#B44DFF" },
  { id: 3, name: "Мария Петрова", phone: "+7 985 555-12-34", status: "away", location: "Москва, Сокол", lastSeen: "5 мин назад", battery: 92, x: 45, y: 62, color: "#00C2FF" },
  { id: 4, name: "Сергей Иванов", phone: "+7 903 777-88-99", status: "offline", location: "Москва, Войковская", lastSeen: "2 часа назад", battery: 15, x: 70, y: 30, color: "#FF6B35" },
];

export const initialZones: Zone[] = [
  { id: 1, name: "Дом", address: "ул. Тверская, 12", radius: 200, active: true, color: "#00FFB3", x: 38, y: 35, triggers: 24 },
  { id: 2, name: "Работа", address: "Новый Арбат, 36", radius: 300, active: true, color: "#B44DFF", x: 60, y: 48, triggers: 18 },
  { id: 3, name: "Школа", address: "ул. Садовая, 5", radius: 150, active: false, color: "#00C2FF", x: 30, y: 65, triggers: 7 },
];

export const historyData: HistoryEntry[] = [
  { id: 1, contactName: "Анна Смирнова", contactColor: "#00FFB3", date: "Сегодня, 14 мая", points: 12, distance: "8.4 км", duration: "1ч 23м", path: [{x:20,y:70},{x:30,y:55},{x:38,y:35},{x:50,y:28},{x:65,y:40},{x:72,y:60}] },
  { id: 2, contactName: "Дмитрий Козлов", contactColor: "#B44DFF", date: "Вчера, 13 мая", points: 8, distance: "5.1 км", duration: "0ч 47м", path: [{x:25,y:30},{x:40,y:42},{x:60,y:45},{x:75,y:55}] },
  { id: 3, contactName: "Мария Петрова", contactColor: "#00C2FF", date: "12 мая", points: 15, distance: "12.7 км", duration: "2ч 08м", path: [{x:15,y:80},{x:30,y:65},{x:45,y:62},{x:60,y:50},{x:80,y:35}] },
];

export const initialNotifs: Notification[] = [
  { id: 1, type: "enter", contact: "Анна", zone: "Дом", time: "5 мин назад", read: false },
  { id: 2, type: "exit", contact: "Дмитрий", zone: "Работа", time: "23 мин назад", read: false },
  { id: 3, type: "low_battery", contact: "Сергей", time: "1 час назад", read: false },
  { id: 4, type: "enter", contact: "Мария", zone: "Школа", time: "2 часа назад", read: true },
  { id: 5, type: "request", contact: "Новый контакт", time: "3 часа назад", read: true },
];

export const statusColor: Record<string, string> = {
  online: "#00FFB3",
  away: "#FFB800",
  offline: "#666",
};

export const statusLabel: Record<string, string> = {
  online: "Онлайн",
  away: "Отошёл",
  offline: "Офлайн",
};
