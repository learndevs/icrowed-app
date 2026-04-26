import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

const INVENTORY = [
  { sku: "SAM-S25U-256", name: "Samsung Galaxy S25 Ultra 256GB", category: "Smartphones", stock: 8, low: 5, price: 419900 },
  { sku: "APP-IP16PM-256", name: "Apple iPhone 16 Pro Max 256GB", category: "Smartphones", stock: 5, low: 3, price: 389900 },
  { sku: "GPX-P9P-128", name: "Google Pixel 9 Pro 128GB", category: "Smartphones", stock: 12, low: 5, price: 249900 },
  { sku: "ONE-13-256", name: "OnePlus 13 256GB", category: "Smartphones", stock: 0, low: 5, price: 189900 },
  { sku: "SPG-UH-S25", name: "Spigen Ultra Hybrid Case S25", category: "Cases", stock: 42, low: 10, price: 3900 },
  { sku: "ANK-65W-GAN", name: "Anker 65W GaN Charger", category: "Chargers", stock: 2, low: 5, price: 7900 },
];

function stockStatus(stock: number, low: number) {
  if (stock === 0) return { label: "Out of Stock", variant: "error" as const };
  if (stock <= low) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

export default function AdminInventoryPage() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Inventory</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "In Stock", value: INVENTORY.filter(p => p.stock > p.low).length, color: "text-green-600 bg-green-50" },
          { label: "Low Stock", value: INVENTORY.filter(p => p.stock > 0 && p.stock <= p.low).length, color: "text-amber-600 bg-amber-50" },
          { label: "Out of Stock", value: INVENTORY.filter(p => p.stock === 0).length, color: "text-red-600 bg-red-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className={`text-center py-4 rounded-2xl ${s.color}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)]">
              <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {INVENTORY.map((p) => {
                const { label, variant } = stockStatus(p.stock, p.low);
                return (
                  <tr key={p.sku} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{p.sku}</td>
                    <td className="px-4 py-3"><Badge variant="default">{p.category}</Badge></td>
                    <td className="px-4 py-3 font-bold">{p.stock}</td>
                    <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
