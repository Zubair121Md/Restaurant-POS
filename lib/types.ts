export type Language = "en" | "es" | "fr" | "zh" | "ru" | "pt";
export type BusinessType = "restaurant" | "cafe";
export type DataProvider = "supabase" | "firebase" | "local";
export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled";
export type TableStatus = "available" | "occupied" | "reserved" | "billing";
export type StaffRole = "admin" | "manager" | "cashier" | "waiter" | "kitchen";

export type InstallState = {
  language: Language;
  businessType: BusinessType;
  restaurantName: string;
  username: string;
  password: string;
  provider: DataProvider;
};

export type MenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

export type DiningTable = {
  id: string;
  label: string;
  seats: number;
  zone: string;
  status: TableStatus;
  activeOrderId?: string;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

export type Order = {
  id: string;
  tableId?: string;
  tableLabel?: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  discount: number;
  taxRate: number;
  tip: number;
  paymentMethod?: "cash" | "card" | "qr";
};

export type SessionUser = {
  username: string;
  role: StaffRole;
  restaurantName: string;
};

export type PosSettings = {
  currency: string;
  taxRate: number;
  tipEnabled: boolean;
};

export type PosStore = {
  version: 1;
  install: InstallState & { installedAt: string };
  settings: PosSettings;
  categories: MenuCategory[];
  menu: MenuItem[];
  tables: DiningTable[];
  orders: Order[];
};
