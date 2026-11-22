import type {
  Store, Seller, Product, Category, Order, Customer,
  Offer, InventoryItem, StockAdjustment, Notification,
  StaffMember, Transaction, Settlement, ActivityItem,
  KPIMetric, ChartDataPoint,
} from "@/types";

// ---- Seller & Store ----
export const mockSeller: Seller = {
  id: "seller-001",
  name: "Rajesh Kumar",
  email: "rajesh@freshmart.in",
  phone: "+91 98765 43210",
  avatar: "",
  role: "owner",
  storeId: "store-001",
};

export const mockStore: Store = {
  id: "store-001",
  name: "FreshMart General Store",
  description: "Your neighbourhood one-stop shop for fresh groceries, daily essentials, snacks and household items. Serving the community since 2018.",
  logo: "",
  banner: "",
  email: "store@freshmart.in",
  phone: "+91 98765 43210",
  address: { line1: "Shop No. 12, Sunrise Complex", line2: "MG Road, Koramangala", city: "Bangalore", state: "Karnataka", pincode: "560034", landmark: "Near SBI Bank" },
  operatingHours: [
    { day: "Monday", open: "08:00", close: "21:00", isOpen: true },
    { day: "Tuesday", open: "08:00", close: "21:00", isOpen: true },
    { day: "Wednesday", open: "08:00", close: "21:00", isOpen: true },
    { day: "Thursday", open: "08:00", close: "21:00", isOpen: true },
    { day: "Friday", open: "08:00", close: "21:00", isOpen: true },
    { day: "Saturday", open: "08:00", close: "22:00", isOpen: true },
    { day: "Sunday", open: "09:00", close: "20:00", isOpen: true },
  ],
  deliverySettings: { deliveryEnabled: true, pickupEnabled: true, deliveryRadius: 5, minimumOrder: 200, deliveryFee: 30, freeDeliveryAbove: 500 },
  status: "online",
  verified: true,
  createdAt: "2024-01-15T10:00:00Z",
};

// ---- Products ----
const productNames = [
  { name: "Basmati Rice (5kg)", sku: "FM-RIC-001", cat: "Grocery", catId: "cat-001", brand: "India Gate", price: 450, mrp: 520, desc: "Premium aged basmati rice, perfect for biryani and pulao" },
  { name: "Toor Dal (1kg)", sku: "FM-DAL-001", cat: "Grocery", catId: "cat-001", brand: "Tata Sampann", price: 160, mrp: 180, desc: "Unpolished toor dal, rich in protein and fibre" },
  { name: "Amul Butter (500g)", sku: "FM-DRY-001", cat: "Dairy", catId: "cat-002", brand: "Amul", price: 275, mrp: 290, desc: "Pasteurized fresh butter, made from real cream" },
  { name: "Whole Wheat Atta (10kg)", sku: "FM-ATA-001", cat: "Grocery", catId: "cat-001", brand: "Aashirvaad", price: 420, mrp: 480, desc: "100% whole wheat flour for soft rotis" },
  { name: "Sunflower Oil (5L)", sku: "FM-OIL-001", cat: "Grocery", catId: "cat-001", brand: "Fortune", price: 650, mrp: 720, desc: "Refined sunflower oil, heart-healthy cooking oil" },
  { name: "Fresh Paneer (200g)", sku: "FM-DRY-002", cat: "Dairy", catId: "cat-002", brand: "Amul", price: 90, mrp: 95, desc: "Fresh cottage cheese, soft and crumbly" },
  { name: "Maggi Noodles (12 Pack)", sku: "FM-SNK-001", cat: "Snacks", catId: "cat-003", brand: "Nestle", price: 168, mrp: 192, desc: "2-minute instant noodles family pack" },
  { name: "Surf Excel Liquid (1L)", sku: "FM-HOM-001", cat: "Home Care", catId: "cat-004", brand: "HUL", price: 220, mrp: 249, desc: "Top-load and front-load washing machine liquid detergent" },
  { name: "Organic Honey (500g)", sku: "FM-HLT-001", cat: "Health", catId: "cat-005", brand: "Dabur", price: 280, mrp: 320, desc: "100% pure organic honey, no added sugar" },
  { name: "Colgate MaxFresh (150g)", sku: "FM-PER-001", cat: "Personal Care", catId: "cat-006", brand: "Colgate", price: 110, mrp: 125, desc: "Gel toothpaste with cooling crystals" },
  { name: "Milk Full Cream (1L)", sku: "FM-DRY-003", cat: "Dairy", catId: "cat-002", brand: "Nandini", price: 60, mrp: 62, desc: "Fresh full cream milk, pasteurized and homogenized" },
  { name: "Green Tea (100 bags)", sku: "FM-BEV-001", cat: "Beverages", catId: "cat-007", brand: "Lipton", price: 350, mrp: 400, desc: "Pure green tea bags for a refreshing cup" },
  { name: "Sugar (5kg)", sku: "FM-GRO-002", cat: "Grocery", catId: "cat-001", brand: "Uttam", price: 240, mrp: 260, desc: "Refined white sugar, fine grain" },
  { name: "Dove Soap (3+1)", sku: "FM-PER-002", cat: "Personal Care", catId: "cat-006", brand: "Dove", price: 230, mrp: 260, desc: "Moisturizing beauty bar with 1/4 cream" },
  { name: "Biscuits Variety Pack", sku: "FM-SNK-002", cat: "Snacks", catId: "cat-003", brand: "Britannia", price: 180, mrp: 200, desc: "Assorted biscuit pack with 6 flavours" },
  { name: "Dettol Handwash (900ml)", sku: "FM-HOM-002", cat: "Home Care", catId: "cat-004", brand: "Dettol", price: 185, mrp: 210, desc: "Liquid handwash refill, pH balanced" },
  { name: "Mixed Dal Pack (1kg)", sku: "FM-GRO-003", cat: "Grocery", catId: "cat-001", brand: "Tata Sampann", price: 180, mrp: 200, desc: "Blend of 5 premium dals" },
  { name: "Ghee (1L)", sku: "FM-DRY-004", cat: "Dairy", catId: "cat-002", brand: "Amul", price: 580, mrp: 620, desc: "Pure cow ghee, rich aroma and taste" },
  { name: "Coffee Powder (200g)", sku: "FM-BEV-002", cat: "Beverages", catId: "cat-007", brand: "Bru", price: 220, mrp: 250, desc: "Instant coffee powder, smooth and rich" },
  { name: "Potato Chips (Party Pack)", sku: "FM-SNK-003", cat: "Snacks", catId: "cat-003", brand: "Lay's", price: 95, mrp: 100, desc: "Classic salted potato chips, 200g party pack" },
];

export const mockProducts: Product[] = productNames.map((p, i) => ({
  id: `prod-${String(i + 1).padStart(3, "0")}`,
  name: p.name,
  shortDescription: p.desc.slice(0, 60),
  description: p.desc,
  sku: p.sku,
  category: p.cat,
  categoryId: p.catId,
  brand: p.brand,
  images: [`/products/${p.sku.toLowerCase()}.jpg`],
  price: p.price,
  mrp: p.mrp,
  discount: Math.round(((p.mrp - p.price) / p.mrp) * 100),
  taxRate: 5,
  variants: [],
  stock: ((i * 37 + 23) % 150) + 12, // 100% deterministic stock
  lowStockThreshold: 10,
  trackInventory: true,
  status: i < 18 ? "active" : "draft",
  createdAt: new Date(2024, 0, 15 + i * 3).toISOString(),
  updatedAt: new Date(2024, 10, 1 + i).toISOString(),
}));

// ---- Categories ----
export const mockCategories: Category[] = [
  { id: "cat-001", name: "Grocery", description: "Rice, dal, flour, oil and daily cooking essentials", image: "", productCount: 7, status: "active", createdAt: "2024-01-15T10:00:00Z" },
  { id: "cat-002", name: "Dairy", description: "Milk, paneer, butter, ghee and fresh dairy products", image: "", productCount: 4, status: "active", createdAt: "2024-01-15T10:00:00Z" },
  { id: "cat-003", name: "Snacks", description: "Biscuits, chips, noodles and packaged snacks", image: "", productCount: 3, status: "active", createdAt: "2024-01-15T10:00:00Z" },
  { id: "cat-004", name: "Home Care", description: "Detergents, cleaners and household essentials", image: "", productCount: 2, status: "active", createdAt: "2024-01-15T10:00:00Z" },
  { id: "cat-005", name: "Health", description: "Honey, supplements and health-focused products", image: "", productCount: 1, status: "active", createdAt: "2024-01-16T10:00:00Z" },
  { id: "cat-006", name: "Personal Care", description: "Soaps, toothpaste, shampoo and grooming", image: "", productCount: 2, status: "active", createdAt: "2024-01-16T10:00:00Z" },
  { id: "cat-007", name: "Beverages", description: "Tea, coffee, juices and drinks", image: "", productCount: 2, status: "active", createdAt: "2024-01-17T10:00:00Z" },
  { id: "cat-008", name: "Frozen Foods", description: "Ready-to-eat frozen meals and ice cream", image: "", productCount: 0, status: "inactive", createdAt: "2024-02-01T10:00:00Z" },
];

// ---- Orders ----
const customerNames = ["Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh", "Anjali Nair", "Deepak Joshi", "Meera Gupta", "Karthik Raman", "Pooja Verma", "Suresh Iyer"];
const orderStatuses: Order["status"][] = ["new", "accepted", "preparing", "ready", "completed", "completed", "completed", "cancelled", "new", "accepted"];
const payStatuses: Order["paymentStatus"][] = ["paid", "paid", "paid", "paid", "paid", "paid", "pending", "refunded", "paid", "pending"];

// 100% Deterministic mock orders (no Math.random to prevent SSR hydration mismatches)
export const mockOrders: Order[] = Array.from({ length: 25 }, (_, i) => {
  const custIdx = i % 10;
  const itemCount = (i % 3) + 1; // Deterministic count: 1, 2, or 3 items
  const items = Array.from({ length: itemCount }, (_, j) => {
    const prod = mockProducts[(i * 3 + j) % mockProducts.length];
    const qty = ((i + j) % 2) + 1; // Deterministic quantity: 1 or 2
    return {
      id: `oi-${i}-${j}`,
      productId: prod.id,
      productName: prod.name,
      image: prod.images[0],
      quantity: qty,
      price: prod.price,
      total: prod.price * qty,
    };
  });
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const tax = Math.round(subtotal * 0.05);
  const status = orderStatuses[i % 10];
  return {
    id: `ord-${String(i + 1).padStart(3, "0")}`,
    orderNumber: `SUV-${String(10200 + i)}`,
    customer: { id: `cust-${String(custIdx + 1).padStart(3, "0")}`, name: customerNames[custIdx], phone: `+91 9${String(8000000000 + custIdx * 111111111).slice(1)}`, avatar: "" },
    items,
    subtotal,
    deliveryFee,
    discount: i % 3 === 0 ? 50 : 0,
    tax,
    total: subtotal + deliveryFee + tax - (i % 3 === 0 ? 50 : 0),
    status,
    paymentStatus: payStatuses[i % 10],
    paymentMethod: (["upi", "card", "cod", "wallet"] as const)[i % 4],
    deliveryType: i % 3 === 0 ? "pickup" : "delivery",
    deliveryAddress: i % 3 !== 0 ? { line1: `${100 + i}, MG Road`, city: "Bangalore", state: "Karnataka", pincode: "560001" } : undefined,
    notes: i % 5 === 0 ? "Please deliver before 6 PM" : undefined,
    timeline: [
      { status: "new", timestamp: new Date(2024, 10, 20, 9 + i, 30).toISOString() },
      ...(["accepted", "preparing", "ready", "completed"].includes(status)
        ? [{ status: "accepted" as const, timestamp: new Date(2024, 10, 20, 9 + i, 35).toISOString() }] : []),
      ...(["preparing", "ready", "completed"].includes(status)
        ? [{ status: "preparing" as const, timestamp: new Date(2024, 10, 20, 9 + i, 45).toISOString() }] : []),
      ...(["ready", "completed"].includes(status)
        ? [{ status: "ready" as const, timestamp: new Date(2024, 10, 20, 10 + i, 0).toISOString() }] : []),
      ...(status === "completed"
        ? [{ status: "completed" as const, timestamp: new Date(2024, 10, 20, 10 + i, 15).toISOString() }] : []),
      ...(status === "cancelled"
        ? [{ status: "cancelled" as const, timestamp: new Date(2024, 10, 20, 9 + i, 40).toISOString(), note: "Customer requested cancellation" }] : []),
    ],
    createdAt: new Date(2024, 10, 20, 9 + i, 30).toISOString(),
    updatedAt: new Date(2024, 10, 20, 10 + i, 15).toISOString(),
  };
});

// ---- Customers ----
export const mockCustomers: Customer[] = customerNames.map((name, i) => ({
  id: `cust-${String(i + 1).padStart(3, "0")}`,
  name,
  phone: `+91 9${String(8000000000 + i * 111111111).slice(1)}`,
  email: `${name.toLowerCase().replace(" ", ".")}@email.com`,
  avatar: "",
  totalOrders: 4 + ((i * 7) % 24),
  totalSpent: 2800 + ((i * 1450) % 20000),
  lastOrderDate: new Date(2024, 10, 20 - i).toISOString(),
  joinedAt: new Date(2024, 0, 15 + i * 7).toISOString(),
}));

// ---- Offers ----
export const mockOffers: Offer[] = [
  { id: "off-001", title: "Welcome Offer", description: "Flat 15% off on your first order", code: "WELCOME15", discountType: "percentage", discountValue: 15, minimumOrder: 300, maxUsage: 500, usedCount: 234, startDate: "2024-10-01T00:00:00Z", endDate: "2025-03-31T23:59:59Z", status: "active", createdAt: "2024-10-01T00:00:00Z" },
  { id: "off-002", title: "Weekend Special", description: "₹100 off on orders above ₹700", code: "WEEKEND100", discountType: "fixed", discountValue: 100, minimumOrder: 700, maxUsage: 200, usedCount: 89, startDate: "2024-11-01T00:00:00Z", endDate: "2025-01-31T23:59:59Z", status: "active", createdAt: "2024-11-01T00:00:00Z" },
  { id: "off-003", title: "Festive Sale", description: "20% off on grocery items", code: "FESTIVE20", discountType: "percentage", discountValue: 20, minimumOrder: 500, maxUsage: 1000, usedCount: 1000, startDate: "2024-10-15T00:00:00Z", endDate: "2024-11-15T23:59:59Z", status: "expired", createdAt: "2024-10-15T00:00:00Z" },
  { id: "off-004", title: "Free Delivery", description: "Free delivery on orders above ₹400", code: "FREEDEL", discountType: "fixed", discountValue: 30, minimumOrder: 400, maxUsage: 300, usedCount: 156, startDate: "2024-11-10T00:00:00Z", endDate: "2025-02-28T23:59:59Z", status: "active", createdAt: "2024-11-10T00:00:00Z" },
];

// ---- Inventory ----
export const mockInventory: InventoryItem[] = mockProducts.map((p, i) => {
  const available = p.stock;
  const reserved = (p.stock > 10 ? (i % 4) + 1 : 0);
  let status: InventoryItem["status"] = "in_stock";
  if (available === 0) status = "out_of_stock";
  else if (available <= p.lowStockThreshold) status = "low_stock";
  return {
    id: `inv-${p.id}`,
    productId: p.id,
    productName: p.name,
    sku: p.sku,
    image: p.images[0],
    available,
    reserved,
    total: available + reserved,
    lowStockThreshold: p.lowStockThreshold,
    status,
    lastUpdated: p.updatedAt,
  };
});

export const mockStockHistory: StockAdjustment[] = [
  { id: "adj-001", productId: "prod-001", productName: "Basmati Rice (5kg)", type: "add", quantity: 50, reason: "Supplier delivery", notes: "Invoice #INV-4521", createdAt: "2024-11-18T14:30:00Z", createdBy: "Rajesh Kumar" },
  { id: "adj-002", productId: "prod-003", productName: "Amul Butter (500g)", type: "reduce", quantity: 5, reason: "Damaged stock", notes: "Expired batch", createdAt: "2024-11-17T11:00:00Z", createdBy: "Rajesh Kumar" },
  { id: "adj-003", productId: "prod-007", productName: "Maggi Noodles (12 Pack)", type: "add", quantity: 100, reason: "Supplier delivery", createdAt: "2024-11-16T09:15:00Z", createdBy: "Amit (Staff)" },
  { id: "adj-004", productId: "prod-011", productName: "Milk Full Cream (1L)", type: "adjust", quantity: 30, reason: "Stock count correction", createdAt: "2024-11-15T16:45:00Z", createdBy: "Rajesh Kumar" },
];

// ---- Notifications (Static timestamps to avoid hydration mismatch) ----
export const mockNotifications: Notification[] = [
  { id: "notif-001", type: "order", title: "New Order Received", message: "Order SUV-10200 from Priya Sharma — ₹1,250", read: false, actionUrl: "/orders/ord-001", createdAt: "2024-11-20T10:15:00Z" },
  { id: "notif-002", type: "order", title: "New Order Received", message: "Order SUV-10201 from Amit Patel — ₹890", read: false, actionUrl: "/orders/ord-002", createdAt: "2024-11-20T10:05:00Z" },
  { id: "notif-003", type: "inventory", title: "Low Stock Alert", message: "Amul Butter (500g) is running low — 8 units left", read: false, actionUrl: "/inventory", createdAt: "2024-11-20T09:30:00Z" },
  { id: "notif-004", type: "payment", title: "Payment Received", message: "Settlement of ₹12,450 has been processed", read: true, createdAt: "2024-11-20T08:00:00Z" },
  { id: "notif-005", type: "platform", title: "Platform Update", message: "New analytics features are now available in your dashboard", read: true, createdAt: "2024-11-19T14:00:00Z" },
  { id: "notif-006", type: "inventory", title: "Out of Stock", message: "Fresh Paneer (200g) is out of stock", read: false, actionUrl: "/inventory", createdAt: "2024-11-20T07:45:00Z" },
  { id: "notif-007", type: "order", title: "Order Cancelled", message: "Order SUV-10208 was cancelled by customer", read: true, createdAt: "2024-11-19T18:20:00Z" },
  { id: "notif-008", type: "general", title: "Welcome to SUVORA", message: "Complete your store setup to start receiving orders", read: true, createdAt: "2024-11-15T10:00:00Z" },
];

// ---- Staff ----
export const mockStaff: StaffMember[] = [
  { id: "staff-001", name: "Rajesh Kumar", email: "rajesh@freshmart.in", phone: "+91 98765 43210", role: "owner", status: "active", permissions: [{ module: "all", actions: ["view", "create", "edit", "delete"] }], invitedAt: "2024-01-15T10:00:00Z", joinedAt: "2024-01-15T10:00:00Z" },
  { id: "staff-002", name: "Amit Sharma", email: "amit@freshmart.in", phone: "+91 98765 43211", role: "store_manager", status: "active", permissions: [{ module: "orders", actions: ["view", "create", "edit"] }, { module: "products", actions: ["view", "create", "edit"] }, { module: "inventory", actions: ["view", "edit"] }], invitedAt: "2024-03-10T10:00:00Z", joinedAt: "2024-03-10T12:00:00Z" },
  { id: "staff-003", name: "Priya Menon", email: "priya.m@freshmart.in", phone: "+91 98765 43212", role: "inventory_manager", status: "active", permissions: [{ module: "inventory", actions: ["view", "create", "edit"] }, { module: "products", actions: ["view"] }], invitedAt: "2024-05-20T10:00:00Z", joinedAt: "2024-05-21T09:00:00Z" },
  { id: "staff-004", name: "Suresh Rajan", email: "suresh@freshmart.in", phone: "+91 98765 43213", role: "order_manager", status: "inactive", permissions: [{ module: "orders", actions: ["view", "edit"] }], invitedAt: "2024-06-15T10:00:00Z", joinedAt: "2024-06-16T11:00:00Z" },
];

// ---- Transactions (Deterministic) ----
export const mockTransactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
  id: `txn-${String(i + 1).padStart(3, "0")}`,
  orderId: `ord-${String((i % 25) + 1).padStart(3, "0")}`,
  type: (["sale", "sale", "sale", "commission", "refund", "payout"] as const)[i % 6],
  amount: 280 + ((i * 175) % 1800),
  status: (["completed", "completed", "pending"] as const)[i % 3],
  date: new Date(2024, 10, 20 - i).toISOString(),
  description: `${(["Sale", "Sale", "Sale", "Platform commission", "Refund", "Payout"] as const)[i % 6]} for order #SUV-${10200 + (i % 25)}`,
}));

// ---- Settlements ----
export const mockSettlements: Settlement[] = [
  { id: "stl-001", amount: 45200, status: "completed", period: "Nov 11-17, 2024", transactionCount: 42, paidAt: "2024-11-18T10:00:00Z", createdAt: "2024-11-17T23:59:59Z" },
  { id: "stl-002", amount: 38750, status: "completed", period: "Nov 4-10, 2024", transactionCount: 35, paidAt: "2024-11-11T10:00:00Z", createdAt: "2024-11-10T23:59:59Z" },
  { id: "stl-003", amount: 52100, status: "processing", period: "Nov 18-24, 2024", transactionCount: 48, createdAt: "2024-11-24T23:59:59Z" },
  { id: "stl-004", amount: 31600, status: "pending", period: "Oct 28 - Nov 3, 2024", transactionCount: 28, createdAt: "2024-11-03T23:59:59Z" },
];

// ---- Activities (Static timestamps) ----
export const mockActivities: ActivityItem[] = [
  { id: "act-001", type: "order", title: "New order received", description: "Order SUV-10200 from Priya Sharma — ₹1,250", timestamp: "2024-11-20T10:15:00Z" },
  { id: "act-002", type: "inventory", title: "Stock updated", description: "Added 50 units of Basmati Rice (5kg)", timestamp: "2024-11-20T10:05:00Z" },
  { id: "act-003", type: "order", title: "Order accepted", description: "Order SUV-10198 marked as accepted", timestamp: "2024-11-20T09:45:00Z" },
  { id: "act-004", type: "payment", title: "Payment received", description: "Settlement of ₹12,450 processed to bank account", timestamp: "2024-11-20T09:00:00Z" },
  { id: "act-005", type: "customer", title: "New customer registered", description: "Deepak Joshi placed their first order", timestamp: "2024-11-20T08:30:00Z" },
  { id: "act-006", type: "product", title: "Product updated", description: "Price updated for Amul Butter (500g)", timestamp: "2024-11-20T08:00:00Z" },
  { id: "act-007", type: "order", title: "Order completed", description: "Order SUV-10195 delivered successfully", timestamp: "2024-11-20T07:30:00Z" },
  { id: "act-008", type: "inventory", title: "Low stock alert", description: "Fresh Paneer (200g) — only 3 units remaining", timestamp: "2024-11-20T06:45:00Z" },
];

// ---- Dashboard KPIs ----
export const mockKPIs: KPIMetric[] = [
  { label: "Total Revenue", value: "₹2,84,500", change: 12.5, changeType: "positive", icon: "IndianRupee", sparkline: [18, 25, 22, 30, 28, 35, 32, 40], prefix: "₹" },
  { label: "Total Orders", value: "342", change: 8.2, changeType: "positive", icon: "ShoppingBag", sparkline: [30, 35, 28, 42, 38, 45, 40, 48] },
  { label: "Total Customers", value: "156", change: 5.4, changeType: "positive", icon: "Users", sparkline: [10, 12, 15, 14, 18, 20, 22, 25] },
  { label: "Avg Order Value", value: "₹832", change: 3.1, changeType: "positive", icon: "TrendingUp", sparkline: [700, 750, 780, 800, 820, 830, 840, 832] },
  { label: "Pending Orders", value: "12", change: -15.0, changeType: "negative", icon: "Clock", sparkline: [20, 18, 15, 14, 16, 13, 12, 12] },
  { label: "Products Listed", value: "20", change: 0, changeType: "neutral", icon: "Package" },
  { label: "Inventory Value", value: "₹3,42,800", change: 4.8, changeType: "positive", icon: "Warehouse", prefix: "₹" },
  { label: "Low Stock Products", value: "3", change: 200, changeType: "negative", icon: "AlertTriangle" },
];

// ---- Chart Data ----
export const revenueChartData: ChartDataPoint[] = [
  { name: "Mon", value: 32000, secondary: 28000 },
  { name: "Tue", value: 38000, secondary: 31000 },
  { name: "Wed", value: 35000, secondary: 34000 },
  { name: "Thu", value: 42000, secondary: 36000 },
  { name: "Fri", value: 48000, secondary: 40000 },
  { name: "Sat", value: 58000, secondary: 46000 },
  { name: "Sun", value: 52000, secondary: 42000 },
];

export const salesPerformanceData: ChartDataPoint[] = [
  { name: "Week 1", value: 180000, secondary: 220 },
  { name: "Week 2", value: 210000, secondary: 260 },
  { name: "Week 3", value: 195000, secondary: 245 },
  { name: "Week 4", value: 245000, secondary: 310 },
];

export const orderStatusDistribution = [
  { name: "Delivered", value: 245, color: "#18B978" },
  { name: "Processing", value: 42, color: "#7656E8" },
  { name: "Ready", value: 28, color: "#27A9E8" },
  { name: "Cancelled", value: 15, color: "#F05A55" },
  { name: "Pending", value: 12, color: "#F5A623" },
];

export const earningsChartData: ChartDataPoint[] = [
  { name: "Jun", value: 185000, secondary: 18500 },
  { name: "Jul", value: 210000, secondary: 21000 },
  { name: "Aug", value: 198000, secondary: 19800 },
  { name: "Sep", value: 245000, secondary: 24500 },
  { name: "Oct", value: 268000, secondary: 26800 },
  { name: "Nov", value: 284500, secondary: 28450 },
];

export const analyticsRevenueData: ChartDataPoint[] = [
  { name: "1 Nov", value: 8500 },
  { name: "3 Nov", value: 9200 },
  { name: "5 Nov", value: 7800 },
  { name: "7 Nov", value: 11200 },
  { name: "9 Nov", value: 10400 },
  { name: "11 Nov", value: 13500 },
  { name: "13 Nov", value: 12800 },
  { name: "15 Nov", value: 15200 },
  { name: "17 Nov", value: 14100 },
  { name: "19 Nov", value: 16800 },
];

export const categoryPerformanceData = [
  { name: "Grocery", value: 124500, count: 142 },
  { name: "Dairy", value: 68200, count: 86 },
  { name: "Snacks", value: 34100, count: 52 },
  { name: "Home Care", value: 28400, count: 34 },
  { name: "Beverages", value: 18600, count: 22 },
  { name: "Personal Care", value: 10700, count: 16 },
];

export const customerGrowthData: ChartDataPoint[] = [
  { name: "Jun", value: 45, secondary: 38 },
  { name: "Jul", value: 68, secondary: 52 },
  { name: "Aug", value: 89, secondary: 71 },
  { name: "Sep", value: 112, secondary: 88 },
  { name: "Oct", value: 138, secondary: 105 },
  { name: "Nov", value: 156, secondary: 122 },
];

export const monthlySalesData = earningsChartData;
export const categoryPerformance = categoryPerformanceData;
export const orderStatusData = [
  { name: "Delivered", value: 245, fill: "#18B978" },
  { name: "Processing", value: 42, fill: "#7656E8" },
  { name: "Ready", value: 28, fill: "#27A9E8" },
  { name: "Cancelled", value: 15, fill: "#F05A55" },
  { name: "Pending", value: 12, fill: "#F5A623" },
];
export const topProducts = [
  { name: "Basmati Rice (5kg)", category: "Grocery", sold: 48, revenue: 21600, stock: 72 },
  { name: "Whole Wheat Atta (10kg)", category: "Grocery", sold: 34, revenue: 14280, stock: 24 },
  { name: "Sunflower Oil (5L)", category: "Grocery", sold: 22, revenue: 14300, stock: 8 },
  { name: "Amul Fresh Butter (500g)", category: "Dairy", sold: 28, revenue: 7700, stock: 14 },
  { name: "Surf Excel Liquid (1L)", category: "Home Care", sold: 19, revenue: 4180, stock: 19 },
];
