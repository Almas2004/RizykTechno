import { Clock, Mail, Phone } from "lucide-react";

const storePhone = import.meta.env.VITE_STORE_PHONE || "87756148891";
const storeEmail = import.meta.env.VITE_STORE_EMAIL || "Armaw-91.91@mail.ru";

export default function ContactsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold text-accent">Контакты</p>
          <h1 className="mt-3 text-4xl font-semibold">Свяжитесь с RizykTechno</h1>
          <div className="mt-8 grid gap-4">
            {[
              { icon: Phone, title: "Телефон", text: storePhone },
              { icon: Mail, title: "Email", text: storeEmail },
              { icon: Clock, title: "График", text: "Пн-Пт: 9:30-12:30, 14:30-18:30. Сб-Вс: выходной" }
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg border border-line bg-white p-5">
                <item.icon className="mt-1 text-accent" size={22} />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <img className="h-72 w-full object-cover" src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80" alt="Ноутбук и рабочее место" />
          <div className="p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">RizykTechno</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold">Поможем подобрать технику под задачу</h2>
            <p className="mt-4 max-w-lg leading-7 text-muted">Оставьте заявку из корзины или отправьте выбранные товары в WhatsApp. Подскажем по наличию, характеристикам, доставке и оплате.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
