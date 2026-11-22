import prisma from "../src/lib/prisma";

async function cleanDemoData() {
  console.log("🧹 Cleaning demo seller data from Supabase...");

  try {
    // We can delete everything cleanly using SQL CASCADE or delete the demo seller
    // Clean all seed tables so the database is in a pristine state
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE 
      "order_timelines",
      "order_items",
      "orders",
      "customers",
      "stock_adjustments",
      "inventory_items",
      "product_variants",
      "products",
      "categories",
      "operating_hours",
      "offers",
      "staff_members",
      "transactions",
      "settlements",
      "notifications",
      "stores",
      "sellers"
      CASCADE;
    `);

    console.log("✅ Successfully truncated all tables!");
    console.log("🎉 Database is completely clean and ready for your real seller registration!");
  } catch (error) {
    console.error("❌ Error during demo data cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDemoData();
