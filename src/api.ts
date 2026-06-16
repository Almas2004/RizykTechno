const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem("adminToken") : "";
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Ошибка запроса" }));
    throw new Error(error.message || "Ошибка запроса");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const money = (value: number) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0
  }).format(value);

export const imageSrc = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL.replace("/api", "")}${url}`;
};
