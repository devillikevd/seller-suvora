import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // Resolve store
    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ success: true, count: 0, products: [] });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    const products = await prisma.product.findMany({
      where: {
        storeId,
        ...(category && category !== "all" ? { category: { name: category } } : {}),
        ...(status && status !== "all" ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        variants: true,
        inventory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // Resolve store
    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store not found for this merchant." }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      sku,
      price,
      mrp,
      taxRate = 5,
      discount = 0,
      stock = 0,
      lowStockThreshold = 10,
      brand = "Generic",
      shortDescription,
      description,
      images = [],
      category,
      categoryId,
      status = "active",
      variants = [],
    } = body;

    if (!name?.trim() || !sku?.trim() || price === undefined) {
      return NextResponse.json(
        { error: "Product name, barcode SKU, and selling price are required." },
        { status: 400 }
      );
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check SKU uniqueness in this store
    const existingSku = await prisma.product.findFirst({
      where: { storeId, sku: cleanSku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: `A product with SKU "${cleanSku}" already exists in your store inventory.` },
        { status: 409 }
      );
    }

    // Resolve Category: find or create default category
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && category) {
      let cat = await prisma.category.findFirst({
        where: { storeId, name: category.trim() },
      });
      if (!cat) {
        cat = await prisma.category.create({
          data: {
            storeId,
            name: category.trim(),
            description: "Store product category",
          },
        });
      }
      resolvedCategoryId = cat.id;
    }

    if (!resolvedCategoryId) {
      // Find any category or create general
      let defaultCat = await prisma.category.findFirst({ where: { storeId } });
      if (!defaultCat) {
        defaultCat = await prisma.category.create({
          data: { storeId, name: "General Retail" },
        });
      }
      resolvedCategoryId = defaultCat.id;
    }

    // Atomic transaction: create Product + InventoryItem + Variants
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          storeId,
          categoryId: resolvedCategoryId,
          name: name.trim(),
          shortDescription: shortDescription?.trim() || name.trim(),
          description: description?.trim() || name.trim(),
          sku: cleanSku,
          brand: brand?.trim() || "Generic",
          images: Array.isArray(images) && images.length > 0 ? images : ["/uploads/placeholder.png"],
          price: Number(price),
          mrp: Number(mrp || price),
          discountPercent: Number(discount || 0),
          taxRatePercent: Number(taxRate || 5),
          stock: Number(stock || 0),
          lowStockThreshold: Number(lowStockThreshold || 10),
          trackInventory: true,
          status: status || "active",
        },
      });

      // Create Inventory Item
      await tx.inventoryItem.create({
        data: {
          storeId,
          productId: newProduct.id,
          sku: cleanSku,
          available: Number(stock || 0),
          reserved: 0,
          total: Number(stock || 0),
          lowStockThreshold: Number(lowStockThreshold || 10),
          status: Number(stock) === 0 ? "out_of_stock" : Number(stock) <= Number(lowStockThreshold || 10) ? "low_stock" : "in_stock",
        },
      });

      // Create Variants if provided
      if (Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (v.name && v.price) {
            await tx.productVariant.create({
              data: {
                productId: newProduct.id,
                name: v.name.trim(),
                sku: v.sku?.trim() || `${cleanSku}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
                price: Number(v.price),
                mrp: Number(v.mrp || v.price),
                stock: Number(v.stock || 0),
              },
            });
          }
        }
      }

      return newProduct;
    });

    const refreshed = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, variants: true, inventory: true },
    });

    return NextResponse.json({
      success: true,
      message: "Product created and published to store successfully!",
      product: refreshed,
    }, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
