import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SUVORA Seller Hub database seed...");

  // 1. Create or update Seller Owner
  const passwordHash = await bcrypt.hash("password123", 10);
  const seller = await prisma.seller.upsert({
    where: { email: "rajesh@freshmart.in" },
    update: {},
    create: {
      name: "Rajesh Kumar",
      email: "rajesh@freshmart.in",
      phone: "+91 98765 43210",
      passwordHash,
      role: "owner",
      isVerified: true,
    },
  });

  console.log(`✅ Seeded Seller: ${seller.name}`);

  // 2. Create Store
  const store = await prisma.store.upsert({
    where: { slug: "freshmart-koramangala" },
    update: {},
    create: {
      sellerId: seller.id,
      name: "FreshMart General Store",
      slug: "freshmart-koramangala",
      description: "Quick-commerce local essentials, grocery staples and fresh farm produce.",
      email: "orders@freshmart.in",
      phone: "+91 98765 43210",
      status: "online",
      verificationStatus: "approved",
      addressLine1: "Shop #14, 80 Feet Road, 4th Block",
      addressLine2: "Near Sony World Signal",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      deliveryRadiusKm: 5.0,
      minimumOrderValue: 199.0,
      deliveryFee: 29.0,
      freeDeliveryAbove: 499.0,
      gstNumber: "29AABCS1429B1ZB",
      panNumber: "AABCS1429B",
      fssaiNumber: "11223344556677",
    },
  });

  console.log(`✅ Seeded Store: ${store.name}`);

  // 3. Create Operating Hours
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  for (const day of days) {
    await prisma.operatingHour.upsert({
      where: {
        storeId_day: {
          storeId: store.id,
          day,
        },
      },
      update: {},
      create: {
        storeId: store.id,
        day,
        isOpen: true,
        openTime: "07:00",
        closeTime: "22:30",
      },
    });
  }

  // 4. Create Category
  const category = await prisma.category.upsert({
    where: {
      storeId_name: {
        storeId: store.id,
        name: "Dairy, Bread & Eggs",
      },
    },
    update: {},
    create: {
      storeId: store.id,
      name: "Dairy, Bread & Eggs",
      description: "Fresh daily farm dairy staples and breakfast items",
      status: "active",
    },
  });

  // 5. Create Sample Products & Inventory
  const sampleProducts = [
    {
      name: "Amul Taaza Homogenised Toned Milk 1L",
      sku: "AML-MLK-001",
      brand: "Amul",
      price: 54.0,
      mrp: 56.0,
      stock: 45,
      lowStockThreshold: 15,
      taxRatePercent: 0.0,
      images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80"],
    },
    {
      name: "Modern 100% Whole Wheat Bread 400g",
      sku: "MDN-BRD-002",
      brand: "Modern",
      price: 45.0,
      mrp: 50.0,
      stock: 22,
      lowStockThreshold: 10,
      taxRatePercent: 5.0,
      images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80"],
    },
    {
      name: "Aashirvaad Shudh Chakki Atta 5kg",
      sku: "ASH-ATT-003",
      brand: "Aashirvaad",
      price: 245.0,
      mrp: 275.0,
      stock: 18,
      lowStockThreshold: 8,
      taxRatePercent: 5.0,
      images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80"],
    },
  ];

  for (const p of sampleProducts) {
    const product = await prisma.product.upsert({
      where: {
        storeId_sku: {
          storeId: store.id,
          sku: p.sku,
        },
      },
      update: {},
      create: {
        storeId: store.id,
        categoryId: category.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        taxRatePercent: p.taxRatePercent,
        images: p.images,
        status: "active",
      },
    });

    await prisma.inventoryItem.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        storeId: store.id,
        productId: product.id,
        sku: product.sku,
        available: product.stock,
        reserved: 0,
        total: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        status: "in_stock",
      },
    });
  }

  // 6. Create Customer
  const customer = await prisma.customer.upsert({
    where: { phone: "+91 98450 12345" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya.s@gmail.com",
      phone: "+91 98450 12345",
      address: "Flat 402, Green Glen Layout, Bellandur, Bangalore",
      totalOrders: 6,
      totalSpent: 4250.0,
    },
  });

  // 7. Create Sample Live Order
  const orderNumber = "SUV-849201";
  await prisma.order.upsert({
    where: { orderNumber },
    update: {},
    create: {
      storeId: store.id,
      customerId: customer.id,
      orderNumber,
      status: "new",
      subtotal: 344.0,
      deliveryFee: 29.0,
      tax: 17.0,
      total: 390.0,
      paymentMethod: "upi",
      paymentStatus: "paid",
      dispatchSlaMinutes: 15,
      timeline: {
        create: [
          { status: "new", note: "Customer placed instant delivery order" },
        ],
      },
    },
  });

  console.log("🚀 SUVORA Seller Hub database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
