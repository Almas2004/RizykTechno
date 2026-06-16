import { Award, Headphones, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold text-accent">О нас</p>
          <h1 className="mt-3 text-4xl font-semibold">RizykTechno помогает выбрать технику без лишней суеты</h1>
          <p className="mt-5 text-lg leading-8 text-muted">Мы собираем востребованные товары для дома, работы и учебы: гаджеты, аксессуары, компьютерную и бытовую технику. Вы выбираете позиции в каталоге, а менеджер уточняет наличие и детали покупки.</p>
        </div>
        <img className="aspect-[16/10] rounded-lg object-cover shadow-soft" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80" alt="Рабочее место с техникой" />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { icon: Award, title: "Понятный выбор", text: "В карточках товаров видны цена, описание, фото и наличие." },
          { icon: Headphones, title: "Консультация", text: "Менеджер помогает подобрать товар и подтвердить детали заказа." },
          { icon: ShieldCheck, title: "Удобное оформление", text: "Корзина считает сумму и отправляет заявку прямо в панель менеджера." }
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-line bg-white p-6">
            <item.icon className="text-accent" size={24} />
            <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
