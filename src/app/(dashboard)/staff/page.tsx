"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Trash2,
  Check,
  X,
  Lock,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  PageHeader,
  StatusBadge,
  ConfirmDialog,
  FormField,
  toast,
} from "@/components/common";
import { useStaffStore } from "@/lib/store";
import { formatDate, getInitials, generateId } from "@/lib/utils";
import type { StaffMember, StaffRole } from "@/types";

export default function StaffPage() {
  const { staff, addStaff, removeStaff, toggleStatus } = useStaffStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("store_manager");

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      toast.error("Valid name and email are required.");
      return;
    }

    const newMember: StaffMember = {
      id: generateId("staff"),
      name,
      email,
      phone: phone || "+91 98765 00000",
      role,
      status: "active",
      permissions: [
        { module: "orders", actions: ["view", "edit"] },
        { module: "inventory", actions: ["view", "edit"] },
      ],
      invitedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    };

    addStaff(newMember);
    toast.success(`Invitation sent to ${newMember.email}!`);
    setIsInviteOpen(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleRemove = () => {
    if (deleteStaffId) {
      removeStaff(deleteStaffId);
      toast.success("Staff access revoked.");
      setDeleteStaffId(null);
    }
  };

  // Permission Matrix Modules Definition
  const matrixModules = [
    { key: "dashboard", label: "Dashboard Overview" },
    { key: "store", label: "Storefront Settings" },
    { key: "products", label: "Product Catalog & Pricing" },
    { key: "inventory", label: "Inventory Stock Adjustments" },
    { key: "orders", label: "Order Acceptance & Dispatch" },
    { key: "customers", label: "Customer Directory & CRM" },
    { key: "offers", label: "Discount Coupons & Promos" },
    { key: "earnings", label: "Bank Settlements & Revenue" },
    { key: "staff", label: "Staff & Role Delegation" },
  ];

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Staff & Permissions"
        subtitle="Delegate operational responsibilities to store clerks, counter cashiers and packaging staff."
      >
        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </PageHeader>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Store Team Roster</h3>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
            {staff.length} active operators
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date Added</th>
                <th className="px-5 py-3.5 text-right">Access Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => {
                const roleColors: Record<StaffRole, string> = {
                  owner: "bg-purple-100 text-purple-800",
                  store_manager: "bg-blue-100 text-blue-800",
                  inventory_manager: "bg-amber-100 text-amber-800",
                  order_manager: "bg-emerald-100 text-emerald-800",
                };

                return (
                  <tr key={member.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{member.name}</p>
                          <p className="text-[11px] text-slate-400">{member.email} • {member.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase text-[10px] ${roleColors[member.role]}`}>
                        {member.role.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        variant={member.status === "active" ? "success" : "neutral"}
                        size="sm"
                      >
                        {member.status.toUpperCase()}
                      </StatusBadge>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDate(member.invitedAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {member.role !== "owner" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              toggleStatus(member.id);
                              toast.info(
                                member.status === "active"
                                  ? "Account paused"
                                  : "Account activated"
                              );
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            {member.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => setDeleteStaffId(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Role-Based Permission Matrix</h3>
            <p className="text-xs text-slate-400">Default operational rights enforced across staff tiers</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            Security Guardrails Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4 rounded-l-xl">Platform Module</th>
                <th className="py-3 px-4 text-center">Store Owner</th>
                <th className="py-3 px-4 text-center">Store Manager</th>
                <th className="py-3 px-4 text-center">Inventory Manager</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Order Cashier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixModules.map((mod) => (
                <tr key={mod.key} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{mod.label}</td>

                  {/* Owner: Full All */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3 text-purple-600" /> Full Access
                    </span>
                  </td>

                  {/* Store Manager: View & Edit most */}
                  <td className="py-3 px-4 text-center">
                    {["dashboard", "store", "products", "inventory", "orders", "customers"].includes(mod.key) ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-emerald-600" /> View & Edit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <X className="w-3 h-3 text-slate-300" /> Restricted
                      </span>
                    )}
                  </td>

                  {/* Inventory Manager */}
                  <td className="py-3 px-4 text-center">
                    {["products", "inventory"].includes(mod.key) ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-emerald-600" /> Full Stock
                      </span>
                    ) : ["dashboard", "orders"].includes(mod.key) ? (
                      <span className="text-slate-500 font-medium">Read Only</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <X className="w-3 h-3 text-slate-300" /> Restricted
                      </span>
                    )}
                  </td>

                  {/* Order Cashier */}
                  <td className="py-3 px-4 text-center">
                    {["orders"].includes(mod.key) ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-emerald-600" /> Accept & Pack
                      </span>
                    ) : ["products", "customers"].includes(mod.key) ? (
                      <span className="text-slate-500 font-medium">Read Only</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <X className="w-3 h-3 text-slate-300" /> Restricted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      <Dialog.Root open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-slate-900 mb-1">
              Invite Staff Member
            </Dialog.Title>
            <Dialog.Description className="text-xs text-slate-400 mb-4">
              Add a team member to collaborate on your store dashboard.
            </Dialog.Description>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand R."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </FormField>

              <FormField label="Email Address" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anand@freshmart.in"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </FormField>

              <FormField label="Contact Mobile">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 12345"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </FormField>

              <FormField label="Assigned Role Tier" required>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white cursor-pointer"
                >
                  <option value="store_manager">Store Manager (Operational Lead)</option>
                  <option value="inventory_manager">Inventory Manager (Stock & Barcodes)</option>
                  <option value="order_manager">Order Dispatch Clerk (Cashier / Packer)</option>
                </select>
              </FormField>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Send Portal Invite
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteStaffId)}
        onOpenChange={(open) => !open && setDeleteStaffId(null)}
        title="Revoke Staff Access"
        description="Are you sure you want to revoke this staff member's login credentials and store portal privileges?"
        confirmText="Revoke Access"
        variant="danger"
        onConfirm={handleRemove}
      />
    </div>
  );
}

