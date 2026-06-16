import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";
import type { Product } from "../types";
import { imageSrc, money } from "../api";
import { useCart } from "../cart";

export default function ProductCard({ product }: { product: Product }) {
  const cart = useCart();

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-cream">
          <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={imageSrc(product.imageUrl)} alt={product.name} />
        </div>
      </Link>
      <div className="p-5">
        <div className="flex justify-end">
          <span className={`text-xs font-medium ${product.inStock ? "text-accent" : "text-muted"}`}>{product.inStock ? "В наличии" : "Под заказ"}</span>
        </div>
        <h3 className="mt-4 min-h-12 text-lg font-semibold leading-6">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-lg font-semibold">{money(product.price)}</p>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-accent" to={`/products/${product.slug}`}>
            Подробнее <ArrowRight size={16} />
          </Link>
        </div>
        <button className="btn btn-dark mt-4 w-full justify-center" type="button" onClick={() => cart.addItem(product)}>
          <ShoppingCart size={18} /> В корзину
        </button>
      </div>
    </article>
  );
}
