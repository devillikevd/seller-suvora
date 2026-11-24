"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Archive,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Loader2,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  PageHeader,
  SearchBar,
  StatusBadge,
  ConfirmDialog,
  toast,
} from "@/components/common";
import { useProductsStore, useCategoriesStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProductsPage() {
  const { products, setProducts, toggleStatus, deleteProduct, updateProduct } = useProductsStore();
  const { categories, setCategories } = useCategoriesStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Fetch real products & categories from Database on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (isMounted && prodData.products) {
            setProducts(
              prodData.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                shortDescription: p.shortDescription || p.name,
                description: p.description || p.name,
                sku: p.sku,
                category: p.category?.name || "Grocery",
                categoryId: p.categoryId,
                brand: p.brand || "Generic",
                images: p.images || [],
                price: Number(p.price),
                mrp: Number(p.mrp),
                discount: Number(p.discountPercent || 0),
                taxRate: Number(p.taxRatePercent || 5),
                variants: p.variants || [],
                stock: Number(p.stock || 0),
                lowStockThreshold: Number(p.lowStockThreshold || 10),
                trackInventory: Boolean(p.trackInventory),
                status: p.status || "active",
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
              }))
            );
          }
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          if (isMounted && catData.categories) {
            setCategories(
              catData.categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                description: c.description || "",
                productCount: c._count?.products || 0,
                status: c.status || "active",
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load products from database:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [setProducts, setCategories]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  // Paginate
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safePage, pageSize]);

  // Bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkActivate = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "active" }),
          })
        )
      );
      selectedIds.forEach((id) => updateProduct(id, { status: "active" }));
      toast.success(`Activated ${selectedIds.length} products in database`);
      setSelectedIds([]);
    } catch {
      toast.error("Failed to activate some products.");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "inactive" }),
          })
        )
      );
      selectedIds.forEach((id) => updateProduct(id, { status: "inactive" }));
      toast.info(`Deactivated ${selectedIds.length} products`);
      setSelectedIds([]);
    } catch {
      toast.error("Failed to deactivate some products.");
    }
  };

  const handleBulkArchive = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "archived" }),
          })
        )
      );
      selectedIds.forEach((id) => updateProduct(id, { status: "archived" }));
      toast.warning(`Archived ${selectedIds.length} products`);
      setSelectedIds([]);
    } catch {
      toast.error("Failed to archive some products.");
    }
  };

  const handleToggleProductStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toggleStatus(id);
        toast.success(`Product status updated to ${nextStatus.toUpperCase()}`);
      } else {
        toast.error("Could not update product status in database.");
      }
    } catch {
      toast.error("Network error while updating product status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        const res = await fetch(`/api/products/${deleteId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          deleteProduct(deleteId);
          toast.success("Product permanently deleted from database.");
        } else {
          toast.error("Failed to delete product from database.");
        }
      } catch {
        toast.error("Network error while deleting product.");
      } finally {
        setDeleteId(null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Products Catalog"
        subtitle={`Manage your seller store inventory, pricing, SKU barcodes and catalogue visibility (${products.length} total items).`}
      >
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            placeholder="Search by title, SKU, or brand..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.productCount})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active ({products.filter((p) => p.status === "active").length})</option>
            <option value="inactive">Inactive ({products.filter((p) => p.status === "inactive").length})</option>
            <option value="draft">Draft ({products.filter((p) => p.status === "draft").length})</option>
            <option value="archived">Archived ({products.filter((p) => p.status === "archived").length})</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Banner (appears when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-purple-900 text-white px-5 py-3 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-white text-purple-900 flex items-center justify-center font-bold text-[11px]">
              {selectedIds.length}
            </span>
            <span>products selected across table</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold transition-colors"
            >
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors"
            >
              Deactivate
            </button>
            <button
              onClick={handleBulkArchive}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-700 rounded-xl text-xs font-bold transition-colors"
            >
              Archive
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-purple-200 hover:text-white ml-2 underline"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">Product & SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Selling Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Updated</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isLowStock = product.stock <= product.lowStockThreshold;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-purple-50/30 transition-colors ${
                        isSelected ? "bg-purple-50/60" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectOne(product.id, e.target.checked)
                          }
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0 shadow-xs">
                            <Package className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              SKU: {product.sku} • {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {formatCurrency(product.price)}
                          </span>
                          {product.mrp > product.price && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400 line-through">
                                {formatCurrency(product.mrp)}
                              </span>
                              <span className="text-emerald-700 font-semibold">
                                {product.discount}% off
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                            isOutOfStock
                              ? "bg-rose-100 text-rose-800"
                              : isLowStock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge
                          variant={
                            product.status === "active"
                              ? "success"
                              : product.status === "draft"
                              ? "warning"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {product.status.toUpperCase()}
                        </StatusBadge>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {formatDate(product.updatedAt)}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="end"
                              className="z-50 min-w-[150px] bg-white rounded-xl p-1.5 shadow-xl border border-slate-100 animate-in fade-in-0 zoom-in-95 focus:outline-none text-xs"
                            >
                              <DropdownMenu.Item
                                onClick={() => handleToggleProductStatus(product.id, product.status)}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-slate-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
                              >
                                {product.status === "active" ? (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </DropdownMenu.Item>

                              <DropdownMenu.Item
                                onClick={() => {
                                  updateProduct(product.id, {
                                    status: product.status === "archived" ? "draft" : "archived",
                                  });
                                  toast.info(
                                    product.status === "archived"
                                      ? "Product unarchived"
                                      : "Product archived"
                                  );
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-slate-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {product.status === "archived" ? "Unarchive" : "Archive"}
                                </span>
                              </DropdownMenu.Item>

                              <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />

                              <DropdownMenu.Item
                                onClick={() => setDeleteId(product.id)}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete</span>
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-800">No products match your filters</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing your search term or category dropdown.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredProducts.length)} of{" "}
              {filteredProducts.length} listings
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold ${
                    currentPage === page
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Product"
        description="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Delete Product"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

