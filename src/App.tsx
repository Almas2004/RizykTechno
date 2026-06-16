import { NavLink, Outlet, Link } from "react-router-dom";
import { Menu, ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart";

const links = [
  { to: "/", label: "Главная" },
  { to: "/catalog", label: "Каталог" },
  { to: "/about", label: "О нас" },
  { to: "/contacts", label: "Контакты" }
];

const storePhone = import.meta.env.VITE_STORE_PHONE || "87756148891";
const storeEmail = import.meta.env.VITE_STORE_EMAIL || "Armaw-91.91@mail.ru";

export default function App() {
  const [open, setOpen] = useState(false);
  const cart = useCart();

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-wide">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
              <Zap size={20} />
            </span>
            <span>RizykTechno</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? "text-ink" : "text-muted"}`}>
                {link.label}
              </NavLink>
            ))}
            <Link className="btn btn-dark" to="/cart">
              <ShoppingBag size={18} /> Корзина {cart.count > 0 && <span className="rounded-full bg-white px-2 py-0.5 text-xs text-ink">{cart.count}</span>}
            </Link>
          </nav>
          <button className="icon-btn md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Открыть меню">
            <Menu size={22} />
          </button>
        </div>
        {open && (
          <div className="border-t border-line bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-muted">
                  {link.label}
                </NavLink>
              ))}
              <Link className="btn btn-dark w-full justify-center" to="/cart" onClick={() => setOpen(false)}>
                <ShoppingBag size={18} /> Корзина {cart.count > 0 && `(${cart.count})`}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <Link
        to="/cart"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-soft transition hover:-translate-y-1 hover:bg-black"
        aria-label="Открыть корзину"
      >
        <ShoppingBag size={23} />
        {cart.count > 0 && <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-white">{cart.count}</span>}
      </Link>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="font-semibold">RizykTechno</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">Магазин техники, электроники и аксессуаров для дома, работы и учебы.</p>
          </div>
          <div className="text-sm text-muted">
            <p className="font-medium text-ink">Покупателям</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/catalog">Каталог товаров</Link>
              <Link to="/cart">Корзина</Link>
              <Link to="/privacy">Политика данных</Link>
              <Link to="/contacts">Контакты</Link>
            </div>
          </div>
          <div className="text-sm text-muted">
            <p className="font-medium text-ink">Связь</p>
            <p className="mt-3">{storePhone}</p>
            <p>{storeEmail}</p>
            <p className="mt-3">Пн-Пт: 9:30-12:30, 14:30-18:30</p>
            <p>Сб-Вс: выходной</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
