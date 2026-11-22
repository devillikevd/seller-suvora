"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { FormField, toast } from "@/components/common";
import { useProductsStore, useCategoriesStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

export default function AddProductPage() {
  const router = useRouter();
  const { addProduct } = useProductsStore();
  const { categories } = useCategoriesStore();

  // Form State
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [detailedDesc, setDetailedDesc] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "Grocery");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("FM-7842");

  // Media
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60",
  ]);
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);

  // Pricing
  const [price, setPrice] = useState<number>(350);
  const [mrp, setMrp] = useState<number>(400);
  const [taxRate, setTaxRate] = useState<number>(5);

  // Inventory
  const [initialStock, setInitialStock] = useState<number>(50);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [trackInventory, setTrackInventory] = useState(true);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Calculated discount
  const discountPercent =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      name: "Default Variant",
      sku: `${sku}-V${variants.length + 1}`,
      price,
      stock: 20,
      attributes: { size: "Standard" },
    };
    setVariants([...variants, newVariant]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleVariantChange = (
    id: string,
    field: keyof ProductVariant,
    value: string | number | boolean
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleAddImagePlaceholder = () => {
    const placeholder =
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60";
    setUploadedImages([...uploadedImages, placeholder]);
    toast.success("Sample product photograph added to media gallery.");
  };

  const handleSubmit = (status: "active" | "draft") => {
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!sku.trim()) {
      toast.error("Product SKU barcode is required.");
      return;
    }
    if (price <= 0) {
      toast.error("Selling price must be greater than zero.");
      return;
    }
    if (mrp < price) {
      toast.error("MRP cannot be lower than the selling price.");
      return;
    }

    const matchedCat = categories.find((c) => c.name === category);

    const newProduct: Product = {
      id: generateId("prod"),
      name,
      shortDescription: shortDesc || name,
      description: detailedDesc || name,
      sku,
      category,
      categoryId: matchedCat?.id || "cat-001",
      brand: brand || "Generic",
      images: uploadedImages,
      price: Number(price),
      mrp: Number(mrp),
      discount: discountPercent,
      taxRate: Number(taxRate),
      variants,
      stock: Number(initialStock),
      lowStockThreshold: Number(lowStockThreshold),
      trackInventory,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProduct(newProduct);
    toast.success(
      status === "active"
        ? "Product published to store successfully!"
        : "Product saved as draft."
    );
    router.push("/products");
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3 pb-2">
        <Link
          href="/products"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-purple-700 hover:border-purple-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Product Listing
          </h1>
          <p className="text-xs text-slate-400">
            Publish inventory with variants, barcode SKU, and local marketplace pricing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Info, Media, Variants */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Basic Product Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Product Title / Name" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aashirvaad Shudh Chakki Atta (10kg)"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField label="Short Catchy Tagline">
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="e.g. 100% whole wheat with zero maida"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField label="Full Description & Ingredients">
                  <textarea
                    rows={4}
                    value={detailedDesc}
                    onChange={(e) => setDetailedDesc(e.target.value)}
                    placeholder="Provide full details, shelf life, dietary information and usage instructions..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  />
                </FormField>
              </div>

              <div>
                <FormField label="Category" required>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div>
                <FormField label="Brand / Manufacturer">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Tata, Amul, Fortune"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField label="Product Barcode / SKU" required helperText="Unique store identifier for POS barcode scanning">
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 uppercase"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Card 2: Media & Product Photos */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Product Media & Gallery</h3>
              <span className="text-xs text-slate-400">At least 1 photo recommended</span>
            </div>

            {/* Dropzone */}
            <div
              onClick={handleAddImagePlaceholder}
              className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/30 hover:bg-purple-50/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-xs text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drop product images
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports JPG, PNG, WebP up to 5MB each
              </p>
            </div>

            {/* Image Preview List */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                  >
                    <img
                      src={img}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImageIdx(idx)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          primaryImageIdx === idx
                            ? "bg-purple-600 text-white"
                            : "bg-white text-slate-800 hover:bg-purple-100"
                        }`}
                      >
                        {primaryImageIdx === idx ? "Primary" : "Set Primary"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImages(uploadedImages.filter((_, i) => i !== idx));
                          if (primaryImageIdx === idx) setPrimaryImageIdx(0);
                        }}
                        className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {primaryImageIdx === idx && (
                      <span className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Variants */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Variants & Pack Sizes</h3>
                <p className="text-xs text-slate-400">Offer different weights, colors or volume options</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No variants configured. Product will sell as a single standard unit.
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-3"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Variant Name
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "name", e.target.value)
                        }
                        placeholder="e.g. 500g pouch, 1kg pack"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg mt-0.5"
                      />
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "sku", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg mt-0.5 font-mono"
                      />
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg mt-0.5 font-bold"
                      />
                    </div>

                    <div className="w-full sm:w-24">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg mt-0.5"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg self-end sm:self-center mt-2 sm:mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Pricing & Inventory Thresholds */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Pricing & Tax */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Pricing & Taxes
            </h3>

            <div className="space-y-4">
              <FormField label="Maximum Retail Price (MRP)" required>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </FormField>

              <FormField
                label="Store Selling Price"
                required
                helperText={
                  discountPercent > 0
                    ? `Customers save ${discountPercent}% off printed MRP`
                    : "No discount applied"
                }
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-sm font-bold text-purple-600">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2 text-sm border border-purple-200 focus:border-purple-600 rounded-xl font-extrabold text-purple-900"
                  />
                </div>
              </FormField>

              <FormField label="GST Tax Slab">
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  <option value={0}>0% (Exempted Foodgrains)</option>
                  <option value={5}>5% (Essential Commodities)</option>
                  <option value={12}>12% (Standard Packaged Items)</option>
                  <option value={18}>18% (Household & FMCG)</option>
                  <option value={28}>28% (Luxury / Aerated Drinks)</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Card: Inventory Control */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Stock & Inventory
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-800">Track Inventory</p>
                  <p className="text-[11px] text-slate-400">Reduce stock on confirmed sales</p>
                </div>
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <FormField label="Initial Opening Stock" required>
                <input
                  type="number"
                  value={initialStock}
                  onChange={(e) => setInitialStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                />
              </FormField>

              <FormField
                label="Low Stock Warning Limit"
                helperText="Dashboard alert triggers when stock dips to this number"
              >
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 px-6 py-3.5 shadow-xl flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href="/products"
          className="text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          Discard & Cancel
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("active")}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish Product to Store</span>
          </button>
        </div>
      </div>
    </div>
  );
}
