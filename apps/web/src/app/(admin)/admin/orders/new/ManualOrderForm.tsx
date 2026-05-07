"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
};

type LineItem = {
  productId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
};

export function ManualOrderForm() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [customer, setCustomer] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingDistrict: "",
    shippingProvince: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [customerNote, setCustomerNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) {
        setProducts([]);
        return;
      }
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(search)}&limit=8`
      );
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.rows ?? [];
        setProducts(list as Product[]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [items]
  );
  const total = Math.max(0, subtotal + Number(shippingCost) - Number(discount));

  function addProduct(p: Product) {
    setItems((prev) => {
      const existing = prev.find((x) => x.productId === p.id);
      if (existing) {
        return prev.map((x) =>
          x.productId === p.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          quantity: 1,
          unitPrice: Number(p.price),
        },
      ];
    });
    setSearch("");
    setProducts([]);
  }

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    if (items.length === 0) {
      setErr("Add at least one item.");
      return;
    }
    if (!customer.customerName || !customer.shippingAddressLine1) {
      setErr("Customer name and address are required.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          paymentMethod,
          shippingCost,
          discount,
          customerNote,
          items,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      const data = await res.json();
      router.push(`/admin/orders/${data.order.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold text-sm">Items</h3>
            <FormField label="Add product (search by name/SKU)">
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search…"
                />
                {products.length > 0 && (
                  <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {products.map((p) => (
                      <li
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-[var(--surface)] flex items-center justify-between"
                      >
                        <span>
                          {p.name}
                          <span className="text-xs text-[var(--muted)] ml-2 font-mono">
                            {p.sku}
                          </span>
                        </span>
                        <span className="text-xs">
                          {formatPrice(Number(p.price))}{" "}
                          <span className="text-[var(--muted)]">· stock {p.stock}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </FormField>

            {items.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4 text-center border border-dashed border-[var(--border)] rounded-lg">
                No items yet. Search and add products above.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {items.map((it, i) => (
                  <li key={i} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{it.productName}</p>
                      {it.sku && (
                        <p className="text-xs text-[var(--muted)] font-mono">
                          {it.sku}
                        </p>
                      )}
                    </div>
                    <Input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(i, { quantity: Number(e.target.value) })
                      }
                      className="w-20"
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={it.unitPrice}
                      onChange={(e) =>
                        updateItem(i, { unitPrice: Number(e.target.value) })
                      }
                      className="w-28"
                    />
                    <span className="w-24 text-right text-sm font-medium">
                      {formatPrice(it.quantity * it.unitPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-[var(--muted)] hover:text-[var(--color-error)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-[var(--border)] pt-3 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <div className="flex items-center justify-between gap-3">
                <span>Shipping cost</span>
                <Input
                  type="number"
                  min={0}
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Discount</span>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-32"
                />
              </div>
              <Row label="Total" value={formatPrice(total)} bold />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold text-sm">Customer</h3>
            <FormField label="Name" required>
              <Input
                value={customer.customerName}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, customerName: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={customer.customerEmail}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, customerEmail: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Phone" required>
              <Input
                value={customer.customerPhone}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, customerPhone: e.target.value }))
                }
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold text-sm">Shipping address</h3>
            <FormField label="Line 1" required>
              <Input
                value={customer.shippingAddressLine1}
                onChange={(e) =>
                  setCustomer((c) => ({
                    ...c,
                    shippingAddressLine1: e.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Line 2">
              <Input
                value={customer.shippingAddressLine2}
                onChange={(e) =>
                  setCustomer((c) => ({
                    ...c,
                    shippingAddressLine2: e.target.value,
                  }))
                }
              />
            </FormField>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="City" required>
                <Input
                  value={customer.shippingCity}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, shippingCity: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="District" required>
                <Input
                  value={customer.shippingDistrict}
                  onChange={(e) =>
                    setCustomer((c) => ({
                      ...c,
                      shippingDistrict: e.target.value,
                    }))
                  }
                />
              </FormField>
            </div>
            <FormField label="Province">
              <Input
                value={customer.shippingProvince}
                onChange={(e) =>
                  setCustomer((c) => ({
                    ...c,
                    shippingProvince: e.target.value,
                  }))
                }
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold text-sm">Payment & note</h3>
            <FormField label="Payment method" required>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash_on_delivery">Cash on delivery</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="stripe">Card (manual)</option>
              </Select>
            </FormField>
            <FormField label="Internal note">
              <Textarea
                rows={3}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
              />
            </FormField>
          </CardContent>
        </Card>

        {err && (
          <p className="text-xs text-[var(--color-error)] bg-red-50 p-2 rounded">
            {err}
          </p>
        )}
        <Button onClick={submit} loading={busy} className="w-full">
          <Plus className="w-4 h-4" />
          Create order
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center justify-between" +
        (bold ? " text-base font-bold" : "")
      }
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
