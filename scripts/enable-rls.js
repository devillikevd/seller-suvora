const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndEnableRLS() {
  const tables = [
    'sellers', 'stores', 'operating_hours', 'categories', 'products',
    'product_variants', 'inventory_items', 'stock_adjustments', 'customers',
    'orders', 'order_items', 'order_timelines', 'offers', 'staff_members',
    'transactions', 'settlements', 'notifications'
  ];

  console.log('Enabling Row Level Security (RLS) on all public tables in Supabase PostgreSQL...\n');

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ Enabled RLS on: "${table}"`);
    } catch (err) {
      console.error(`✗ Error on "${table}":`, err.message);
    }
  }

  console.log('\nVerifying pg_tables rowsecurity status...');
  const rlsStatus = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename ASC;
  `);

  console.table(rlsStatus);
  await prisma.$disconnect();
}

checkAndEnableRLS().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
