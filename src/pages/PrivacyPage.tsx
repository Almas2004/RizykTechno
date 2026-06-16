export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-accent">Политика данных</p>
      <h1 className="mt-3 text-4xl font-semibold">Обработка персональных данных</h1>
      <div className="mt-8 space-y-6 rounded-lg border border-line bg-white p-6 leading-7 text-muted shadow-sm">
        <p>RizykTechno использует имя, телефон и комментарий клиента только для обработки заявки, подтверждения заказа, консультации по товару, доставке и оплате.</p>
        <p>Данные заявок хранятся в базе данных магазина и доступны только авторизованным менеджерам. Мы не публикуем контакты клиентов и не передаем их третьим лицам без необходимости исполнения заказа или требования закона.</p>
        <p>Клиент может запросить уточнение, исправление или удаление своих данных, связавшись с магазином по контактам, указанным на сайте.</p>
      </div>
    </section>
  );
}
