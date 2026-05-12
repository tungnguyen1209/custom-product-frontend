"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, Star, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Address,
  UpsertAddressPayload,
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/lib/auth";

const EMPTY_FORM: UpsertAddressPayload = {
  firstName: "",
  lastName: "",
  phone: "",
  street: "",
  suburb: "",
  state: "",
  postcode: "",
  country: "",
  isDefault: false,
};

export default function AddressBookPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UpsertAddressPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/account/addresses");
    }
  }, [authLoading, isAuthenticated, router]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listAddresses();
      setAddresses(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setForm({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone ?? "",
      street: address.street,
      suburb: address.suburb ?? "",
      state: address.state ?? "",
      postcode: address.postcode ?? "",
      country: address.country,
      isDefault: address.isDefault,
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (editing) {
        await updateAddress(editing.id, form);
      } else {
        await createAddress(form);
      }
      await refresh();
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const onMakeDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <a
                href="/account"
                className="text-xs text-gray-400 hover:text-[#ff6b6b]"
              >
                ← Back to account
              </a>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Address book
              </h1>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-bold"
            >
              <Plus className="w-4 h-4" /> New address
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#ff6b6b]" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                You haven&apos;t added any addresses yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {addresses.map((a) => (
                <li
                  key={a.id}
                  className="bg-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {a.firstName} {a.lastName}
                      </h3>
                      {a.isDefault && (
                        <span className="text-[10px] font-bold text-[#ff6b6b] bg-[#fff0f0] px-2 py-0.5 rounded-full uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {a.street}
                      {a.suburb ? `, ${a.suburb}` : ""}
                      {a.state ? `, ${a.state}` : ""}
                      {a.postcode ? ` ${a.postcode}` : ""}
                    </p>
                    <p className="text-sm text-gray-500">{a.country}</p>
                    {a.phone && (
                      <p className="text-xs text-gray-400 mt-1">{a.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!a.isDefault && (
                      <button
                        onClick={() => onMakeDefault(a.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <Star className="w-3.5 h-3.5" /> Set default
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(a)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(a.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editing ? "Edit address" : "New address"}
            </h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="First name"
                  value={form.firstName}
                  required
                  onChange={(v) => setForm({ ...form, firstName: v })}
                />
                <FormField
                  label="Last name"
                  value={form.lastName}
                  required
                  onChange={(v) => setForm({ ...form, lastName: v })}
                />
              </div>
              <FormField
                label="Phone"
                value={form.phone ?? ""}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <FormField
                label="Street"
                value={form.street}
                required
                onChange={(v) => setForm({ ...form, street: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Suburb / city"
                  value={form.suburb ?? ""}
                  onChange={(v) => setForm({ ...form, suburb: v })}
                />
                <FormField
                  label="State"
                  value={form.state ?? ""}
                  onChange={(v) => setForm({ ...form, state: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Postcode"
                  value={form.postcode ?? ""}
                  onChange={(v) => setForm({ ...form, postcode: v })}
                />
                <FormField
                  label="Country"
                  value={form.country}
                  required
                  onChange={(v) => setForm({ ...form, country: v })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                />
                Set as default
              </label>
              {formError && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-bold disabled:opacity-70 inline-flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function FormField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
        {required && <span className="text-[#ff6b6b]"> *</span>}
      </label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
      />
    </div>
  );
}
