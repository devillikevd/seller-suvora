"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Warehouse,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  History,
  TrendingDown,
  Package,
  Loader2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  PageHeader,
  SearchBar,
  StatusBadge,
  FormField,
  toast,
} from "@/components/common";
import { useInventoryStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { InventoryItem } from "@/types";

export default function InventoryPage() {
  const { inventory, setInventory, stockHistory, adjustStock } = useInventoryStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Adjustment Modal State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "reduce" | "adjust">("add");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState("Supplier delivery");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real inventory from database on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchInventory() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/inventory");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.inventory)) {
            setInventory(
              data.inventory.map((inv: any) => ({
                id: inv.id,
                productId: inv.productId,
                productName: inv.product?.name || "Product",
                sku: inv.sku || inv.product?.sku || "",
                available: inv.available,
                reserved: inv.reserved,
                total: inv.total,
                lowStockThreshold: inv.lowStockThreshold,
                status: inv.status,
                lastUpdated: inv.lastUpdated,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load inventory:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchInventory();
    return () => {
      isMounted = false;
    };
  }, [setInventory]);

  // Stats calculation
  const totalStockUnits = useMemo(
    () => inventory.reduce((acc, curr) => acc + curr.available, 0),
    [inventory]
  );
  const lowStockCount = useMemo(
    () => inventory.filter((i) => i.status === "low_stock").length,
    [inventory]
  );
  const outOfStockCount = useMemo(
    () => inventory.filter((i) => i.status === "out_of_stock").length,
    [inventory]
  );

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  const openAdjustmentModal = (item: InventoryItem, type: "add" | "reduce" | "adjust") => {
    setSelectedItem(item);
    setAdjustmentType(type);
    setAdjustmentQuantity(type === "reduce" ? 1 : 10);
    setAdjustmentReason(
      type === "add"
        ? "Supplier delivery"
        : type === "reduce"
        ? "Damaged stock"
        : "Stock count audit correction"
    );
    setAdjustmentNotes("");
    setIsModalOpen(true);
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (adjustmentQuantity <= 0) {
      toast.error("Quantity must be greater than zero.");
      return;
    }

    if (adjustmentType === "reduce" && adjustmentQuantity > selectedItem.available) {
      toast.error(`Cannot reduce by ${adjustmentQuantity}. Only ${selectedItem.available} units available in stock.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedItem.productId,
          type: adjustmentType,
          quantity: Number(adjustmentQuantity),
          reason: adjustmentReason,
          notes: adjustmentNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to adjust stock in database.");
        setIsSubmitting(false);
        return;
      }

      adjustStock(
        selectedItem.productId,
        adjustmentType,
        Number(adjustmentQuantity),
        adjustmentReason,
        adjustmentNotes
      );

      toast.success(
        `Inventory updated for ${selectedItem.productName} in database.`,
        "Stock Adjusted"
      );
      setIsModalOpen(false);
    } catch {
      toast.error("Network error while adjusting stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Inventory & Stock Control"
        subtitle="Live tracking of available store supplies, low-stock threshold triggers and supplier intake audits."
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Available Units
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalStockUnits.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for dispatch</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Inventory Value
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ₹4,25,000
            </h3>
            <span className="text-[11px] text-slate-400">At retail catalog price</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Warnings
            </p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {lowStockCount} items
            </h3>
            <span className="text-[11px] text-amber-700 font-medium">Under restock limit</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Out of Stock Items
            </p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {outOfStockCount} items
            </h3>
            <span className="text-[11px] text-rose-600 font-medium">Ordering blocked</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search inventory by title or SKU..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Inventory Statuses</option>
            <option value="in_stock">In Stock ({inventory.filter((i) => i.status === "in_stock").length})</option>
            <option value="low_stock">Low Stock ({lowStockCount})</option>
            <option value="out_of_stock">Out of Stock ({outOfStockCount})</option>
          </select>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Product & SKU</th>
                <th className="px-5 py-3.5 text-center">Available Units</th>
                <th className="px-5 py-3.5 text-center">Reserved in Cart</th>
                <th className="px-5 py-3.5 text-center">Total Stock</th>
                <th className="px-5 py-3.5">Health Status</th>
                <th className="px-5 py-3.5">Last Restocked</th>
                <th className="px-5 py-3.5 text-right">Quick Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
                  </td>

                  <td className="px-5 py-4 text-center font-extrabold text-slate-900 text-sm">
                    {item.available}
                  </td>

                  <td className="px-5 py-4 text-center text-xs font-medium text-slate-500">
                    {item.reserved}
                  </td>

                  <td className="px-5 py-4 text-center font-semibold text-slate-700 text-xs">
                    {item.total}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      variant={
                        item.status === "in_stock"
                          ? "success"
                          : item.status === "low_stock"
                          ? "warning"
                          : "error"
                      }
                      size="sm"
                    >
                      {item.status.replace("_", " ").toUpperCase()}
                    </StatusBadge>
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-400">
                    {formatDate(item.lastUpdated)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openAdjustmentModal(item, "add")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition-colors"
                        title="Add Stock"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                      <button
                        onClick={() => openAdjustmentModal(item, "reduce")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                        title="Deduct Damaged Stock"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => openAdjustmentModal(item, "adjust")}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Audit / Set Count"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Audit Log History */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-purple-100/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Stock Movement Audit History</h3>
          </div>
          <span className="text-xs text-slate-400">Last 10 inventory transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Product Item</th>
                <th className="py-2.5 px-3">Adjustment Type</th>
                <th className="py-2.5 px-3 text-center">Quantity Delta</th>
                <th className="py-2.5 px-3">Reason / Memo</th>
                <th className="py-2.5 px-3">Adjusted By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockHistory.map((adj) => (
                <tr key={adj.id} className="text-xs text-slate-700">
                  <td className="py-3 px-3 text-slate-400">
                    {formatDate(adj.createdAt)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {adj.productName}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      variant={
                        adj.type === "add"
                          ? "success"
                          : adj.type === "reduce"
                          ? "error"
                          : "info"
                      }
                      size="sm"
                    >
                      {adj.type.toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    <span
                      className={
                        adj.type === "add"
                          ? "text-emerald-600"
                          : adj.type === "reduce"
                          ? "text-rose-600"
                          : "text-purple-600"
                      }
                    >
                      {adj.type === "add" ? `+${adj.quantity}` : adj.type === "reduce" ? `-${adj.quantity}` : `=${adj.quantity}`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {adj.reason} {adj.notes ? `(${adj.notes})` : ""}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {adj.createdBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-slate-900 mb-1">
              Stock Quantity Adjustment
            </Dialog.Title>
            <Dialog.Description className="text-xs text-slate-400 mb-4">
              Update shelf counts for <strong className="text-slate-700">{selectedItem?.productName}</strong>
            </Dialog.Description>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Action Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("add")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      adjustmentType === "add"
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    + Add Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("reduce")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      adjustmentType === "reduce"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    - Deduct Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("adjust")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      adjustmentType === "adjust"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    = Override Total
                  </button>
                </div>
              </div>

              <FormField label="Quantity (Units)" required>
                <input
                  type="number"
                  min={1}
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                />
              </FormField>

              <FormField label="Adjustment Reason" required>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white cursor-pointer"
                >
                  <option value="Supplier delivery">Supplier delivery intake</option>
                  <option value="Stock count audit correction">Physical audit discrepancy</option>
                  <option value="Damaged stock">Damaged in shop / expired</option>
                  <option value="Customer return">Customer return to shelf</option>
                  <option value="Theft or shrinkage">Shrinkage / lost item</option>
                </select>
              </FormField>

              <FormField label="Internal Notes / Invoice #">
                <textarea
                  rows={2}
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Optional reference memo..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl resize-none"
                />
              </FormField>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

