"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Store,
  Seller,
  Product,
  Category,
  Order,
  OrderStatus,
  Customer,
  Offer,
  InventoryItem,
  StockAdjustment,
  Notification,
  StaffMember,
  Transaction,
  Settlement,
  ActivityItem,
} from "@/types";

// ---- Auth Store ----
export function normalizeStore(rawStore: any): Store | null {
  if (!rawStore) return null;
  return {
    id: rawStore.id,
    name: rawStore.name || "My Store",
    description: rawStore.description || "",
    logo: rawStore.logo || undefined,
    banner: rawStore.banner || undefined,
    email: rawStore.email || "",
    phone: rawStore.phone || "",
    address: {
      line1: rawStore.addressLine1 || rawStore.address?.line1 || "",
      line2: rawStore.addressLine2 || rawStore.address?.line2 || "",
      city: rawStore.city || rawStore.address?.city || "Bangalore",
      state: rawStore.state || rawStore.address?.state || "Karnataka",
      pincode: rawStore.pincode || rawStore.address?.pincode || "",
      landmark: rawStore.landmark || rawStore.address?.landmark || "",
    },
    operatingHours: rawStore.operatingHours || [
      { day: "Monday", open: "07:00", close: "22:30", isOpen: true },
      { day: "Tuesday", open: "07:00", close: "22:30", isOpen: true },
      { day: "Wednesday", open: "07:00", close: "22:30", isOpen: true },
      { day: "Thursday", open: "07:00", close: "22:30", isOpen: true },
      { day: "Friday", open: "07:00", close: "22:30", isOpen: true },
      { day: "Saturday", open: "07:00", close: "22:30", isOpen: true },
      { day: "Sunday", open: "07:00", close: "22:30", isOpen: true },
    ],
    deliverySettings: {
      deliveryEnabled: rawStore.deliveryEnabled ?? rawStore.deliverySettings?.deliveryEnabled ?? true,
      pickupEnabled: rawStore.pickupEnabled ?? rawStore.deliverySettings?.pickupEnabled ?? true,
      deliveryRadius: rawStore.deliveryRadiusKm ?? rawStore.deliverySettings?.deliveryRadius ?? 5,
      minimumOrder: rawStore.minimumOrderValue ?? rawStore.deliverySettings?.minimumOrder ?? 199,
      deliveryFee: rawStore.deliveryFee ?? rawStore.deliverySettings?.deliveryFee ?? 29,
      freeDeliveryAbove: rawStore.freeDeliveryAbove ?? rawStore.deliverySettings?.freeDeliveryAbove ?? 499,
    },
    status: (rawStore.status === "offline" ? "offline" : rawStore.status === "suspended" ? "suspended" : "online"),
    verified: rawStore.verificationStatus === "approved" || rawStore.verified === true,
    gstNumber: rawStore.gstNumber || "",
    panNumber: rawStore.panNumber || "",
    fssaiNumber: rawStore.fssaiNumber || "",
    createdAt: rawStore.createdAt ? String(rawStore.createdAt) : new Date().toISOString(),
  };
}

interface AuthStore {
  isAuthenticated: boolean;
  seller: Seller | null;
  store: Store | null;
  login: (seller?: any, store?: any) => void;
  logout: () => void;
  updateStore: (data: Partial<Store>) => void;
  updateSeller: (data: Partial<Seller>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      seller: null,
      store: null,
      login: (seller, store) =>
        set((state) => ({
          isAuthenticated: true,
          seller: seller || state.seller,
          store: store ? normalizeStore(store) : state.store,
        })),
      logout: () => {
        try {
          fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        } catch {}
        set({
          isAuthenticated: false,
          seller: null,
          store: null,
        });
      },
      updateStore: (data) =>
        set((state) => ({
          store: state.store ? { ...state.store, ...data } : null,
        })),
      updateSeller: (data) =>
        set((state) => ({
          seller: state.seller ? { ...state.seller, ...data } : null,
        })),
    }),
    {
      name: "suvora-seller-auth",
    }
  )
);

// ---- Products Store ----
interface ProductsStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStatus: (id: string) => void;
}

export const useProductsStore = create<ProductsStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  toggleStatus: (id) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      ),
    })),
}));

// ---- Categories Store ----
interface CategoriesStore {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => ({ categories: [category, ...state.categories] })),
  updateCategory: (id, data) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}));

// ---- Orders Store ----
interface OrdersStore {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrdersByStatus: (status: OrderStatus | "all") => Order[];
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              timeline: [
                ...o.timeline,
                { status, timestamp: new Date().toISOString() },
              ],
              updatedAt: new Date().toISOString(),
            }
          : o
      ),
    })),
  getOrdersByStatus: (status) => {
    const orders = get().orders;
    if (status === "all") return orders;
    return orders.filter((o) => o.status === status);
  },
}));

// ---- Customers Store ----
interface CustomersStore {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export const useCustomersStore = create<CustomersStore>((set) => ({
  customers: [],
  setCustomers: (customers) => set({ customers }),
}));

// ---- Offers Store ----
interface OffersStore {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  addOffer: (offer: Offer) => void;
  updateOffer: (id: string, data: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  toggleOffer: (id: string) => void;
}

export const useOffersStore = create<OffersStore>((set) => ({
  offers: [],
  setOffers: (offers) => set({ offers }),
  addOffer: (offer) =>
    set((state) => ({ offers: [offer, ...state.offers] })),
  updateOffer: (id, data) =>
    set((state) => ({
      offers: state.offers.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
    })),
  deleteOffer: (id) =>
    set((state) => ({
      offers: state.offers.filter((o) => o.id !== id),
    })),
  toggleOffer: (id) =>
    set((state) => ({
      offers: state.offers.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "active" ? "disabled" : "active" }
          : o
      ),
    })),
}));

// ---- Inventory Store ----
interface InventoryStore {
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  stockHistory: StockAdjustment[];
  adjustStock: (productId: string, type: "add" | "reduce" | "adjust", quantity: number, reason: string, notes?: string) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  inventory: [],
  setInventory: (items) => set({ inventory: items }),
  stockHistory: [],
  adjustStock: (productId, type, quantity, reason, notes) =>
    set((state) => {
      const adjustment: StockAdjustment = {
        id: `adj-${state.stockHistory.length + 1}`,
        productId,
        productName: state.inventory.find((i) => i.productId === productId)?.productName || "",
        type,
        quantity,
        reason,
        notes,
        createdAt: new Date().toISOString(),
        createdBy: "Store Owner",
      };

      const updatedInventory = state.inventory.map((item) => {
        if (item.productId !== productId) return item;
        let newAvailable = item.available;
        if (type === "add") newAvailable += quantity;
        else if (type === "reduce") newAvailable = Math.max(0, newAvailable - quantity);
        else newAvailable = quantity;

        const total = newAvailable + item.reserved;
        let status: InventoryItem["status"] = "in_stock";
        if (newAvailable === 0) status = "out_of_stock";
        else if (newAvailable <= item.lowStockThreshold) status = "low_stock";

        return { ...item, available: newAvailable, total, status, lastUpdated: new Date().toISOString() };
      });

      return {
        inventory: updatedInventory,
        stockHistory: [adjustment, ...state.stockHistory],
      };
    }),
}));

// ---- Notifications Store ----
interface NotificationsStore {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));

// ---- Staff Store ----
interface StaffStore {
  staff: StaffMember[];
  setStaff: (staff: StaffMember[]) => void;
  addStaff: (member: StaffMember) => void;
  updateStaff: (id: string, data: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;
  toggleStatus: (id: string) => void;
}

export const useStaffStore = create<StaffStore>((set) => ({
  staff: [],
  setStaff: (staff) => set({ staff }),
  addStaff: (member) =>
    set((state) => ({ staff: [member, ...state.staff] })),
  updateStaff: (id, data) =>
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  removeStaff: (id) =>
    set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),
  toggleStatus: (id) =>
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s
      ),
    })),
}));

// ---- Finance Store ----
interface FinanceStore {
  transactions: Transaction[];
  settlements: Settlement[];
}

export const useFinanceStore = create<FinanceStore>(() => ({
  transactions: [],
  settlements: [],
}));

// ---- Activity Store ----
interface ActivityStore {
  activities: ActivityItem[];
}

export const useActivityStore = create<ActivityStore>(() => ({
  activities: [],
}));

// ---- UI Store ----
interface UIStore {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
}));

