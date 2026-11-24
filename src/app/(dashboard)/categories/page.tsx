"use client";

import React, { useState, useEffect } from "react";
import {
  Grid3x3,
  Plus,
  Edit2,
  Trash2,
  Package,
  Loader2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  PageHeader,
  StatusBadge,
  ConfirmDialog,
  FormField,
  toast,
} from "@/components/common";
import { useCategoriesStore } from "@/lib/store";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const { categories, setCategories, addCategory, updateCategory, deleteCategory } = useCategoriesStore();

  const [isLoading, setIsLoading] = useState(categories.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.categories)) {
            setCategories(
              data.categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                description: c.description || "",
                productCount: c._count?.products || 0,
                status: c.status || "active",
                createdAt: c.createdAt,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [setCategories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        const res = await fetch("/api/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategory.id,
            name: name.trim(),
            description: description.trim(),
            status,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to update category.");
          setIsSubmitting(false);
          return;
        }

        updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          status,
        });
        toast.success("Category updated successfully in database.");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to create category.");
          setIsSubmitting(false);
          return;
        }

        addCategory({
          id: data.category.id,
          name: data.category.name,
          description: data.category.description || "",
          productCount: 0,
          status: "active",
          createdAt: data.category.createdAt,
        });
        toast.success("New product category created in database.");
      }

      setIsModalOpen(false);
    } catch {
      toast.error("Network error while saving category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCatId) return;

    try {
      const res = await fetch(`/api/categories?id=${deleteCatId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        deleteCategory(deleteCatId);
        toast.success("Category removed from database.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete category.");
      }
    } catch {
      toast.error("Network error while deleting category.");
    } finally {
      setDeleteCatId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Category Management"
        subtitle="Organise your products into clear store aisles and catalog groups for easy shopper navigation."
      >
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </PageHeader>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-5 border border-purple-100/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
                  <Grid3x3 className="w-6 h-6 text-purple-600" />
                </div>
                <StatusBadge
                  variant={cat.status === "active" ? "success" : "neutral"}
                  size="sm"
                >
                  {cat.status.toUpperCase()}
                </StatusBadge>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {cat.description || "General assortment of local items."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-700 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {cat.productCount} products
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteCatId(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Dialog */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-slate-900 mb-1">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </Dialog.Title>
            <Dialog.Description className="text-xs text-slate-400 mb-4">
              Enter the department name and description for customers.
            </Dialog.Description>

            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Category Name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Dairy & Eggs"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe items grouped in this aisle..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                />
              </FormField>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Category Status</p>
                  <p className="text-[11px] text-slate-400">Display this aisle on marketplace</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setStatus(status === "active" ? "inactive" : "active")
                  }
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    status === "active"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  {status === "active" ? "Active" : "Inactive"}
                </button>
              </div>

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
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteCatId)}
        onOpenChange={(open) => !open && setDeleteCatId(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? Products currently assigned to this category will become uncategorized."
        confirmText="Delete Category"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}

