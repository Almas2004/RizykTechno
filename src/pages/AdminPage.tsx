import { useEffect, useMemo, useState } from "react";
import { Edit, Layers3, LogOut, PackagePlus, Save, Trash2 } from "lucide-react";
import { api, imageSrc, money } from "../api";
import type { Category, LeadRequest, Product } from "../types";

type FormState = {
  id?: number;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  inStock: boolean;
  image?: File | null;
};

type RequestItem = {
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
  inStock: true,
  image: null
};

function parseItems(request: LeadRequest): RequestItem[] {
  if (!request.itemsJson) {
    return request.product ? [{ name: request.product.name, price: request.product.price, quantity: 1, lineTotal: request.product.price }] : [];
  }

  try {
    return JSON.parse(request.itemsJson);
  } catch {
    return [];
  }
}

export default function AdminPage() {
  const [token, setToken] = useState(() => (typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem("adminToken") || "" : ""));
  const [login, setLogin] = useState({ email: "", password: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [tab, setTab] = useState<"products" | "requests" | "categories">("products");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  async function loadAdminData() {
    const [productData, categoryData, requestData] = await Promise.all([
      api<Product[]>("/admin/products"),
      api<Category[]>("/categories"),
      api<LeadRequest[]>("/admin/requests")
    ]);
    setProducts(productData);
    setCategories(categoryData);
    setRequests(requestData);
    if (!form.categoryId && categoryData[0]) setForm((value) => ({ ...value, categoryId: String(categoryData[0].id) }));
  }

  useEffect(() => {
    if (token) loadAdminData();
  }, [token]);

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    const response = await api<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(login)
    });
    if (typeof window !== "undefined" && window.localStorage) window.localStorage.setItem("adminToken", response.token);
    setToken(response.token);
  }

  async function submitCategory(event: React.FormEvent) {
    event.preventDefault();
    const created = await api<Category>("/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: categoryName })
    });
    setCategoryName("");
    setMessage("Тип товара добавлен");
    await loadAdminData();
    setForm((value) => ({ ...value, categoryId: String(created.id) }));
  }

  async function submitProduct(event: React.FormEvent) {
    event.preventDefault();
    const data = new FormData();
    data.set("name", form.name);
    data.set("description", form.description);
    data.set("price", form.price);
    data.set("categoryId", form.categoryId);
    data.set("imageUrl", form.imageUrl);
    data.set("inStock", String(form.inStock));
    if (form.image) data.set("image", form.image);

    await api(isEditing ? `/admin/products/${form.id}` : "/admin/products", {
      method: isEditing ? "PUT" : "POST",
      body: data
    });
    setForm({ ...emptyForm, categoryId: categories[0] ? String(categories[0].id) : "" });
    setMessage(isEditing ? "Товар обновлен" : "Товар добавлен");
    await loadAdminData();
  }

  async function removeProduct(id: number) {
    if (!confirm("Удалить товар?")) return;
    await api(`/admin/products/${id}`, { method: "DELETE" });
    await loadAdminData();
  }

  function editProduct(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      categoryId: String(product.categoryId),
      imageUrl: product.imageUrl,
      inStock: product.inStock,
      image: null
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf8] px-4">
        <form onSubmit={submitLogin} className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-soft">
          <p className="text-sm font-semibold text-accent">RizykTechno</p>
          <h1 className="mt-2 text-3xl font-semibold">Вход для менеджера</h1>
          <div className="mt-6 grid gap-4">
            <input className="input" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} placeholder="Email" />
            <input className="input" type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} placeholder="Пароль" />
          </div>
          <button className="btn btn-dark mt-5 w-full justify-center" type="submit">
            Войти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf8]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-accent">RizykTechno</p>
            <h1 className="text-2xl font-semibold">Панель управления</h1>
          </div>
          <button
            className="btn btn-light"
            onClick={() => {
              if (typeof window !== "undefined" && window.localStorage) window.localStorage.removeItem("adminToken");
              setToken("");
            }}
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button className={`tab ${tab === "products" ? "tab-active" : ""}`} onClick={() => setTab("products")}>
            Товары
          </button>
          <button className={`tab ${tab === "categories" ? "tab-active" : ""}`} onClick={() => setTab("categories")}>
            Типы товаров
          </button>
          <button className={`tab ${tab === "requests" ? "tab-active" : ""}`} onClick={() => setTab("requests")}>
            Заявки
          </button>
        </div>

        {tab === "products" && (
          <div className="grid gap-6 lg:grid-cols-[410px_1fr]">
            <form onSubmit={submitProduct} className="h-fit rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <PackagePlus className="text-accent" size={22} />
                <h2 className="text-xl font-semibold">{isEditing ? "Редактировать товар" : "Добавить товар"}</h2>
              </div>
              <div className="mt-5 grid gap-3">
                <input className="input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Название" />
                <textarea className="input min-h-28 resize-none" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Описание" />
                <input className="input" required type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Цена" />
                <select className="input" required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                  <option value="" disabled>
                    Выберите тип товара
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input className="input" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="Ссылка на фото или загрузка ниже" />
                <input className="input file:mr-4 file:rounded-md file:border-0 file:bg-cream file:px-3 file:py-2 file:text-sm file:font-medium" type="file" accept="image/*" onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })} />
                <label className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm font-medium">
                  <input type="checkbox" checked={form.inStock} onChange={(event) => setForm({ ...form, inStock: event.target.checked })} />
                  В наличии
                </label>
              </div>
              <button className="btn btn-dark mt-5 w-full justify-center" type="submit">
                <Save size={18} /> {isEditing ? "Сохранить" : "Добавить"}
              </button>
              {isEditing && (
                <button className="btn btn-light mt-3 w-full justify-center" type="button" onClick={() => setForm({ ...emptyForm, categoryId: categories[0] ? String(categories[0].id) : "" })}>
                  Отмена
                </button>
              )}
              {message && <p className="mt-4 text-sm font-medium text-accent">{message}</p>}
            </form>

            <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
              <div className="border-b border-line p-5">
                <h2 className="text-xl font-semibold">Все товары</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-cream text-muted">
                    <tr>
                      <th className="px-4 py-3">Товар</th>
                      <th className="px-4 py-3">Тип</th>
                      <th className="px-4 py-3">Цена</th>
                      <th className="px-4 py-3">Наличие</th>
                      <th className="px-4 py-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img className="h-12 w-12 rounded-md object-cover" src={imageSrc(product.imageUrl)} alt={product.name} />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">{product.category.name}</td>
                        <td className="px-4 py-3">{money(product.price)}</td>
                        <td className="px-4 py-3">{product.inStock ? "Да" : "Нет"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="icon-btn" onClick={() => editProduct(product)} aria-label="Редактировать">
                              <Edit size={17} />
                            </button>
                            <button className="icon-btn text-red-600" onClick={() => removeProduct(product.id)} aria-label="Удалить">
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div className="grid gap-6 lg:grid-cols-[410px_1fr]">
            <form onSubmit={submitCategory} className="h-fit rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers3 className="text-accent" size={22} />
                <h2 className="text-xl font-semibold">Добавить тип товара</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">Типы нужны менеджеру для структуры каталога. На сайте для клиента они не показываются.</p>
              <input className="input mt-5" required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Например: Смартфоны" />
              <button className="btn btn-dark mt-5 w-full justify-center" type="submit">
                <Save size={18} /> Добавить тип
              </button>
            </form>

            <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Список типов</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span key={category.id} className="chip">
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "requests" && (
          <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            <div className="border-b border-line p-5">
              <h2 className="text-xl font-semibold">Заявки из корзины</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-cream text-muted">
                  <tr>
                    <th className="px-4 py-3">Клиент</th>
                    <th className="px-4 py-3">Телефон</th>
                    <th className="px-4 py-3">Состав заказа</th>
                    <th className="px-4 py-3">Сумма</th>
                    <th className="px-4 py-3">Комментарий</th>
                    <th className="px-4 py-3">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {requests.map((request) => {
                    const items = parseItems(request);
                    return (
                      <tr key={request.id} className="align-top">
                        <td className="px-4 py-3 font-medium">{request.name}</td>
                        <td className="px-4 py-3">{request.phone}</td>
                        <td className="px-4 py-3 text-muted">
                          <div className="space-y-1">
                            {items.map((item, index) => (
                              <p key={`${request.id}-${index}`}>
                                {item.name} x {item.quantity}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{money(request.totalAmount || items.reduce((sum, item) => sum + item.lineTotal, 0))}</td>
                        <td className="px-4 py-3 text-muted">{request.comment || "-"}</td>
                        <td className="px-4 py-3 text-muted">{new Date(request.createdAt).toLocaleDateString("ru-RU")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
