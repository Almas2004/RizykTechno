import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { api, imageSrc, money } from "../api";
import type { Product } from "../types";
import { useCart } from "../cart";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [added, setAdded] = useState(false);
  const cart = useCart();

  useEffect(() => {
    api<Product>(`/products/${slug}`).then(setProduct);
  }, [slug]);

  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-muted">Загружаем товар...</div>;
  }

  function addToCart() {
    if (!product) return;
    cart.addItem(product);
    setAdded(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted" to="/catalog">
        <ArrowLeft size={16} /> Назад в каталог
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-lg bg-white shadow-soft">
          <img className="aspect-[4/3] w-full object-cover" src={imageSrc(product.imageUrl)} alt={product.name} />
        </div>
        <div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">{product.name}</h1>
          <p className="mt-5 text-lg leading-8 text-muted">{product.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <p className="text-3xl font-semibold">{money(product.price)}</p>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${product.inStock ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
              {product.inStock ? "В наличии" : "Под заказ"}
            </span>
          </div>

          <div className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Оформление через корзину</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Добавьте товар в корзину. На странице корзины можно изменить количество, увидеть итоговую сумму и оставить контакты.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button className="btn btn-dark justify-center" type="button" onClick={addToCart}>
                <ShoppingCart size={18} /> Добавить в корзину
              </button>
              <Link className="btn btn-light justify-center" to="/cart">
                Перейти в корзину
              </Link>
            </div>
            {added && (
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
                <Check size={16} /> Товар добавлен в корзину
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
