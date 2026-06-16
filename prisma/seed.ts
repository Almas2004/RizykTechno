import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Смартфоны", slug: "smartphones" },
  { name: "Ноутбуки", slug: "laptops" },
  { name: "Аксессуары", slug: "accessories" },
  { name: "Бытовая техника", slug: "home-appliances" }
];

const products = [
  {
    name: "iPhone 15 Pro 256GB",
    slug: "iphone-15-pro-256gb",
    category: "Смартфоны",
    price: 629000,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
    description: "Флагманский смартфон с мощным процессором, качественной камерой и корпусом из титана."
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    category: "Смартфоны",
    price: 589000,
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
    description: "Большой AMOLED-экран, продвинутая камера, стилус и высокая производительность для работы каждый день."
  },
  {
    name: "MacBook Air 13 M3",
    slug: "macbook-air-13-m3",
    category: "Ноутбуки",
    price: 679000,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    description: "Легкий ноутбук с быстрым чипом, ярким дисплеем и автономностью на весь рабочий день."
  },
  {
    name: "ASUS Vivobook 15",
    slug: "asus-vivobook-15",
    category: "Ноутбуки",
    price: 319000,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
    description: "Практичный ноутбук для учебы, офиса, документов, видеозвонков и повседневных задач."
  },
  {
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    category: "Аксессуары",
    price: 179000,
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1200&q=80",
    description: "Беспроводные наушники с активным шумоподавлением, чистым звуком и удобной посадкой."
  },
  {
    name: "Dyson V12 Detect Slim",
    slug: "dyson-v12-detect-slim",
    category: "Бытовая техника",
    price: 329000,
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80",
    description: "Беспроводной пылесос для быстрой уборки дома с высокой мощностью всасывания."
  }
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Менеджер RizykTechno";

  if (!adminEmail || !adminPassword) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running seed.");
  }

  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  for (const product of products) {
    const { category: categoryName, ...data } = product;
    const category = await prisma.category.findUniqueOrThrow({ where: { name: categoryName } });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId: category.id },
      create: { ...data, categoryId: category.id }
    });
  }

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 12)
    }
  });

  const firstProduct = await prisma.product.findFirstOrThrow();
  await prisma.request.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Айгерим",
      phone: "+7 777 123 45 67",
      comment: "Интересует доставка на этой неделе.",
      productId: firstProduct.id,
      itemsJson: JSON.stringify([
        {
          productId: firstProduct.id,
          name: firstProduct.name,
          price: firstProduct.price,
          quantity: 1,
          lineTotal: firstProduct.price
        }
      ]),
      totalAmount: firstProduct.price
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
