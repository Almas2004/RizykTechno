import { Link } from "react-router-dom";
import { ArrowRight, PackageSearch, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../api";
import type { Product } from "../types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api<Product[]>("/products").then((items) => setProducts(items.slice(0, 4)));
  }, []);

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_0.92fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">RizykTechno</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Техника и электроника для дома, работы и учебы</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Выбирайте смартфоны, ноутбуки, аксессуары и бытовую технику в удобном каталоге. Добавьте товары в корзину и отправьте заявку менеджеру.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-dark" to="/catalog">
                Смотреть каталог <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-light" to="/cart">
                Перейти в корзину
              </Link>
            </div>
          </div>
          <div className="relative">
            <img className="aspect-[4/3] w-full rounded-lg object-cover shadow-soft" src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1400&q=80" alt="Электроника и гаджеты" />
            <div className="absolute bottom-4 left-4 rounded-lg bg-white/92 px-5 py-4 shadow-soft backdrop-blur">
              <p className="text-2xl font-semibold">24/7</p>
              <p className="text-sm text-muted">заказы принимаются онлайн</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: PackageSearch, title: "Быстрый подбор", text: "Поиск и сортировка помогают быстро найти нужный товар." },
            { icon: Truck, title: "Заявка из корзины", text: "Сумма считается автоматически, а заказ уходит менеджеру." },
            { icon: ShieldCheck, title: "Актуальный каталог", text: "Цены, наличие и фото товаров обновляются в панели управления." }
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-line bg-white p-6">
              <item.icon className="text-accent" size={24} />
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent">Каталог</p>
            <h2 className="mt-2 text-3xl font-semibold">Популярные товары</h2>
          </div>
          <Link className="hidden items-center gap-2 text-sm font-semibold text-accent sm:flex" to="/catalog">
            Все товары <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold">Соберите заказ за пару минут</h2>
            <p className="mt-3 max-w-2xl text-white/70">Добавляйте товары в корзину, указывайте контакты или отправляйте выбранные позиции сразу в WhatsApp.</p>
          </div>
          <Link className="btn bg-white text-ink hover:bg-cream" to="/catalog">
            В каталог
          </Link>
        </div>
      </section>
    </>
  );
}
