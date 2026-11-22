// ============================================================
// SUVORA Seller Portal — Core Types
// ============================================================

// ---- Store ----
export interface Store {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  email: string;
  phone: string;
  address: StoreAddress;
  operatingHours: OperatingHours[];
  deliverySettings: DeliverySettings;
  status: "online" | "offline" | "suspended";
  verified: boolean;
  createdAt: string;
}

export interface StoreAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface DeliverySettings {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryRadius: number;
  minimumOrder: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
}

// ---- Seller ----
export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: StaffRole;
  storeId: string;
}

// ---- Product ----
export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  sku: string;
  category: string;
  categoryId: string;
  brand: string;
  images: string[];
  price: number;
  mrp: number;
  discount: number;
  taxRate: number;
  variants: ProductVariant[];
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  status: "active" | "inactive" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

// ---- Category ----
export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

// ---- Inventory ----
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  available: number;
  reserved: number;
  total: number;
  lowStockThreshold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  lastUpdated: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: "add" | "reduce" | "adjust";
  quantity: number;
  reason: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// ---- Order ----
export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "upi" | "card" | "cod" | "wallet";
export type DeliveryType = "delivery" | "pickup";

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  deliveryAddress?: StoreAddress;
  notes?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
}

export interface OrderTimeline {
  status: OrderStatus | string;
  timestamp: string;
  note?: string;
}

// ---- Customer ----
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  joinedAt: string;
}

// ---- Offers ----
export type DiscountType = "percentage" | "fixed";

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrder: number;
  maxUsage: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "disabled";
  createdAt: string;
}

// ---- Earnings ----
export interface EarningsSummary {
  totalSales: number;
  grossRevenue: number;
  platformCommission: number;
  refunds: number;
  netEarnings: number;
  pendingSettlements: number;
  completedPayouts: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  type: "sale" | "refund" | "commission" | "payout";
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  description: string;
}

export interface Settlement {
  id: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  period: string;
  transactionCount: number;
  paidAt?: string;
  createdAt: string;
}

// ---- Notifications ----
export type NotificationType =
  | "order"
  | "inventory"
  | "payment"
  | "platform"
  | "general";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ---- Staff ----
export type StaffRole =
  | "owner"
  | "store_manager"
  | "inventory_manager"
  | "order_manager";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: StaffRole;
  status: "active" | "inactive";
  permissions: Permission[];
  invitedAt: string;
  joinedAt?: string;
}

export interface Permission {
  module: string;
  actions: ("view" | "create" | "edit" | "delete")[];
}

// ---- Analytics ----
export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface KPIMetric {
  label: string;
  value: number | string;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  icon: string;
  sparkline?: number[];
  prefix?: string;
  suffix?: string;
}

// ---- Activity ----
export interface ActivityItem {
  id: string;
  type: "order" | "product" | "customer" | "payment" | "inventory";
  title: string;
  description: string;
  avatar?: string;
  timestamp: string;
}

// ---- Auth ----
export interface AuthState {
  isAuthenticated: boolean;
  seller: Seller | null;
  store: Store | null;
  loading: boolean;
}

// ---- Common ----
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  column: string;
  direction: SortDirection;
}

export type DateRange = "today" | "7days" | "30days" | "90days" | "custom";

