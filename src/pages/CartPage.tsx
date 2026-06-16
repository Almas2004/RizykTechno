import { Link } from "react-router-dom";
import { Check, MessageCircle, Minus, Plus, Send, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { api, imageSrc, money } from "../api";
import { useCart } from "../cart";

const whatsappNumber = "77756148891";

export default function CartPage() {
  const cart = useCart();
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const whatsappUrl = useMemo(() => {
    const lines = [
      "Здравствуйте! Хочу оформить заказ в RizykTechno:",
      "",
      ...cart.items.map((item, index) => `${index + 1}. ${item.product.name} x ${item.quantity} - ${money(item.product.price * item.quantity)}`),
      "",
      `Итого: ${money(cart.total)}`
    ];

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [cart.items, cart.total]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!cart.items.length) return;

    setSending(true);
    await api("/requests", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        comment: form.comment,
        items: cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      })
    });
    cart.clearCart();
    setForm({ name: "", phone: "", comment: "" });
    setSent(true);
    setSending(false);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-accent">Корзина</p>
          <h1 className="mt-2 text-4xl font-semibold">Проверьте заказ и выберите способ отправки</h1>
          <p className="mt-4 max-w-2xl text-muted">Можно отправить заявку через сайт или сразу передать состав корзины в WhatsApp без заполнения формы.</p>
        </div>
        <Link className="btn btn-light" to="/catalog">
          Продолжить покупки
        </Link>
      </div>

      {sent && (
        <div className="mt-8 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
          <Check size={20} /> Заявка отправлена. Менеджер свяжется с вами для подтверждения.
        </div>
      )}

      {cart.items.length ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px]">
          <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            <div className="border-b border-line p-5">
              <h2 className="text-xl font-semibold">Товары в корзине</h2>
            </div>
            <div className="divide-y divide-line">
              {cart.items.map((item) => (
                <div key={item.product.id} className="grid gap-4 p-5 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                  <img className="h-24 w-24 rounded-lg object-cover" src={imageSrc(item.product.imageUrl)} alt={item.product.name} />
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="mt-3 font-semibold">{money(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border border-line">
                      <button className="icon-btn h-9 w-9 rounded-none border-0" type="button" onClick={() => cart.setQuantity(item.product.id, item.quantity - 1)} aria-label="Уменьшить количество">
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button className="icon-btn h-9 w-9 rounded-none border-0" type="button" onClick={() => cart.setQuantity(item.product.id, item.quantity + 1)} aria-label="Увеличить количество">
                        <Plus size={16} />
                      </button>
                    </div>
                    <button className="icon-btn text-red-600" type="button" onClick={() => cart.removeItem(item.product.id)} aria-label="Удалить товар">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="h-fit rounded-lg border border-line bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-accent">
                <ShoppingBag size={21} />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Итого</h2>
                <p className="text-sm text-muted">{cart.count} шт.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-y border-line py-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Товары</span>
                <span>{money(cart.total)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Доставка</span>
                <span>Уточнит менеджер</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-ink">
                <span>Сумма</span>
                <span>{money(cart.total)}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <input className="input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ваше имя" />
              <input className="input" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Телефон" />
              <textarea className="input min-h-24 resize-none" value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Комментарий к заказу" />
            </div>

            <button className="btn btn-dark mt-5 w-full justify-center" type="submit" disabled={sending}>
              <Send size={18} /> {sending ? "Отправляем..." : "Отправить заявку"}
            </button>

            <a className="btn mt-3 w-full justify-center bg-[#25D366] text-white hover:bg-[#1ebc59]" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={18} /> Отправить в WhatsApp
            </a>
          </form>
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-line bg-white p-10 text-center shadow-sm">
          <ShoppingBag className="mx-auto text-accent" size={36} />
          <h2 className="mt-4 text-2xl font-semibold">Корзина пустая</h2>
          <p className="mt-2 text-muted">Добавьте товары из каталога, чтобы оформить заявку.</p>
          <Link className="btn btn-dark mt-6 justify-center" to="/catalog">
            Перейти в каталог
          </Link>
        </div>
      )}
    </section>
  );
}
