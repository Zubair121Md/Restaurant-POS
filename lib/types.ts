export type Language = "en" | "es" | "fr" | "zh" | "ru" | "pt";
export type BusinessType = "restaurant" | "cafe";
export type DataProvider = "supabase" | "firebase" | "local";
export type StaffRole =
  | "owner"
  | "regional_manager"
  | "branch_manager"
  | "cashier"
  | "waiter"
  | "chef"
  | "kitchen"
  | "store_manager"
  | "accountant"
  | "procurement"
  | "delivery_manager";
export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled";
export const TABLE_STATUSES = ["available", "occupied", "reserved", "billing", "dirty"] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number] | string;
export type KitchenStation = "grill" | "fry" | "salad" | "bar" | "dessert" | "general";

export type InstallState = {
  language: Language;
  businessType: BusinessType;
  restaurantName: string;
  username: string;
  password: string;
  provider: DataProvider;
};

export type Branch = {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  taxId?: string;
  isActive: boolean;
};

export type SessionUser = {
  id: string;
  username: string;
  role: StaffRole;
  restaurantName: string;
  branchId: string;
  staffId?: string;
};

export type PosSettings = {
  currency: string;
  taxRate: number;
  tipEnabled: boolean;
  gstEnabled: boolean;
  gstRate: number;
  serviceChargeRate: number;
  allowDiscounts: boolean;
  maxDiscountPercent: number;
  offlineMode: boolean;
};

export type MenuCategory = { id: string; name: string; sortOrder: number };

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  sku?: string;
  barcode?: string;
  station: KitchenStation;
  prepMinutes: number;
  recipeId?: string;
  costPrice?: number;
  isActive: boolean;
};

export type DiningTable = {
  id: string;
  branchId: string;
  label: string;
  seats: number;
  zone: string;
  status: TableStatus;
  activeOrderId?: string;
  x?: number;
  y?: number;
  shape?: "round" | "square" | "rectangle";
};

export type Reservation = {
  id: string;
  branchId: string;
  tableId?: string;
  guestName: string;
  phone: string;
  partySize: number;
  scheduledAt: string;
  status: "booked" | "seated" | "completed" | "cancelled" | "no_show";
  notes?: string;
};

export type WaitlistEntry = {
  id: string;
  branchId: string;
  guestName: string;
  phone: string;
  partySize: number;
  createdAt: string;
  status: "waiting" | "seated" | "left";
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
  station?: KitchenStation;
  kotSentAt?: string;
  preparedAt?: string;
  priority?: "normal" | "rush" | "vip";
};

export type Payment = {
  id: string;
  method: "cash" | "card" | "upi" | "qr" | "wallet";
  amount: number;
  paidAt: string;
};

export type Order = {
  id: string;
  branchId: string;
  orderNumber: string;
  tableId?: string;
  tableLabel?: string;
  customerId?: string;
  waiterId?: string;
  type: "dine_in" | "takeaway" | "delivery";
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  discount: number;
  discountReason?: string;
  discountApprovedBy?: string;
  couponCode?: string;
  splitGroupId?: string;
  mergedFrom?: string[];
  taxRate: number;
  tip: number;
  gstAmount?: number;
  serviceCharge?: number;
  payments: Payment[];
  /** @deprecated Read the payments array for new integrations. */
  paymentMethod?: Payment["method"];
  kotPriority: "normal" | "rush" | "vip";
  isOffline?: boolean;
};

export type Ingredient = {
  id: string;
  branchId: string;
  name: string;
  unit: "kg" | "g" | "l" | "ml" | "pcs";
  stockQty: number;
  reorderLevel: number;
  costPerUnit: number;
  expiryDate?: string;
  batchNo?: string;
  category: "raw" | "packaging" | "finished";
};

export type Recipe = {
  id: string;
  menuItemId: string;
  yieldPortions: number;
  ingredients: { ingredientId: string; qty: number; wastePercent: number }[];
  laborMinutes?: number;
};

export type StockMovement = {
  id: string;
  branchId: string;
  ingredientId: string;
  type: "purchase" | "sale_deduct" | "wastage" | "adjustment" | "transfer_in" | "transfer_out" | "audit";
  qty: number;
  note?: string;
  createdAt: string;
  createdBy: string;
  refId?: string;
};

export type PurchaseOrder = {
  id: string;
  branchId: string;
  vendorId: string;
  status: "draft" | "sent" | "partial" | "received" | "cancelled";
  items: { ingredientId: string; qty: number; unitCost: number }[];
  createdAt: string;
  expectedAt?: string;
  receivedAt?: string;
};

export type Vendor = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  products: string[];
  rating: number;
  creditLimit: number;
  paymentTermsDays: number;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "leave" | "half_day";
};

export type StaffMember = {
  id: string;
  branchId: string;
  name: string;
  username: string;
  role: StaffRole;
  phone?: string;
  pin?: string;
  hourlyRate?: number;
  active: boolean;
  joinDate: string;
  attendance: AttendanceRecord[];
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  totalSpend: number;
  loyaltyPoints: number;
  birthday?: string;
  notes?: string;
  lastVisitAt?: string;
  tags?: string[];
};

export type Feedback = {
  id: string;
  customerId?: string;
  orderId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
  status: "open" | "resolved";
};

export type LedgerEntry = {
  id: string;
  branchId: string;
  type: "sale" | "purchase" | "expense" | "refund" | "payroll" | "transfer";
  category: string;
  amount: number;
  note?: string;
  refId?: string;
  createdAt: string;
  createdBy: string;
};

export type Expense = {
  id: string;
  branchId: string;
  category: string;
  amount: number;
  note: string;
  createdAt: string;
};

export type Alert = {
  id: string;
  severity: "info" | "warning" | "critical";
  module: string;
  title: string;
  message: string;
  createdAt: string;
  resolved: boolean;
  meta?: Record<string, unknown>;
};

export type Transfer = {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  ingredientId: string;
  qty: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
};

export type PosStore = {
  version: 2;
  install: InstallState & { installedAt: string };
  settings: PosSettings;
  branches: Branch[];
  activeBranchId: string;
  categories: MenuCategory[];
  menu: MenuItem[];
  tables: DiningTable[];
  reservations: Reservation[];
  waitlist: WaitlistEntry[];
  orders: Order[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  movements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  staff: StaffMember[];
  customers: Customer[];
  feedback: Feedback[];
  ledger: LedgerEntry[];
  expenses: Expense[];
  alerts: Alert[];
  transfers: Transfer[];
  orderSeq: number;
};
