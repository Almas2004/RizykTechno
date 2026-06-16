import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("new");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ search, sort });
    api<Product[]>(`/products?${params.toString()}`)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [search, sort]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-accent">Каталог</p>
          <h1 className="mt-2 text-4xl font-semibold">Техника и электроника для ежедневных задач</h1>
          <p className="mt-4 max-w-2xl text-muted">Найдите нужный товар через поиск, отсортируйте по цене и добавьте позиции в корзину для оформления заявки.</p>
        </div>
        <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-muted">
          Найдено: <span className="font-semibold text-ink">{products.length}</span>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input className="input pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по товарам" />
          </label>
          <select className="input" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка">
            <option value="new">Сначала новые</option>
            <option value="price-asc">Цена: сначала дешевле</option>
            <option value="price-desc">Цена: сначала дороже</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-lg bg-white" />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">Товары не найдены</h2>
            <p className="mt-2 text-muted">Попробуйте изменить поисковый запрос.</p>
          </div>
        )}
      </div>
    </section>
  );
}
