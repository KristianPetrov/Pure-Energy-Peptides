import { getAllProducts } from "@/lib/data";
import { StatCard } from "@/components/stat-card";
import { InventoryManager } from "./inventory-manager";


export default async function AdminInventoryPage() {
  const products = await getAllProducts();

  const totalUnits = products.reduce((sum, p) => sum + p.inventory, 0);
  const lowStock = products.filter(
    (p) => p.inventory > 0 && p.inventory <= 5
  ).length;
  const outOfStock = products.filter((p) => p.inventory <= 0).length;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={String(products.length)} />
        <StatCard label="Units in stock" value={String(totalUnits)} />
        <StatCard label="Low stock" value={String(lowStock)} hint="5 or fewer units" />
        <StatCard label="Out of stock" value={String(outOfStock)} />
      </div>
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Product inventory
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-faint sm:text-sm">
            Update price, stock, visibility, and featured status for each product.
          </p>
        </div>
        <InventoryManager
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            shortDescription: product.shortDescription,
            category: product.category,
            priceCents: product.priceCents,
            inventory: product.inventory,
            active: product.active,
            featured: product.featured,
          }))}
        />
      </div>
    </div>
  );
}
