import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ success: true, categories: [] });
    }

    let categories = await prisma.category.findMany({
      where: { storeId },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    // If no categories exist, create standard Indian retail grocery starter categories
    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Grocery & Staples", description: "Atta, Rice, Dal, Edible Oil, and Spices" },
        { name: "Snacks & Packaged Food", description: "Biscuits, Namkeen, Noodles, and Chips" },
        { name: "Beverages & Cold Drinks", description: "Juices, Soft drinks, Tea, and Coffee" },
        { name: "Dairy & Bakery", description: "Milk, Bread, Butter, Paneer, and Eggs" },
        { name: "Personal Care", description: "Soaps, Shampoos, and Oral hygiene" },
        { name: "Household Essentials", description: "Detergents, Surface cleaners, and Utensil bars" },
      ];

      for (const cat of defaultCategories) {
        await prisma.category.create({
          data: {
            storeId,
            name: cat.name,
            description: cat.description,
            status: "active",
          },
        });
      }

      categories = await prisma.category.findMany({
        where: { storeId },
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({ success: true, count: categories.length, categories });
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

    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const existing = await prisma.category.findFirst({
      where: { storeId, name: name.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        storeId,
        name: name.trim(),
        description: description?.trim() || null,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const body = await request.json();
    const { id, name, description, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required." }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.sellerId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    let storeId = session.storeId;
    if (!storeId) {
      const store = await prisma.store.findFirst({ where: { sellerId: session.sellerId } });
      storeId = store?.id;
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required." }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully." });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}


