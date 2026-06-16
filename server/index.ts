import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const uploadDir = path.resolve(rootDir, process.env.UPLOAD_DIR || "public/uploads");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
const jwtSignOptions: SignOptions = { expiresIn: jwtExpiresIn as SignOptions["expiresIn"] };
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 2);
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

fs.mkdirSync(uploadDir, { recursive: true });

const prisma = new PrismaClient();
const app = express();

type CartPayloadItem = {
  productId: number;
  quantity: number;
};

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200)
});

const requestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(32).regex(/^[\d\s()+-]+$/),
  comment: z.string().trim().max(600).optional().default(""),
  productId: z.coerce.number().int().positive().optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(99)
      })
    )
    .max(50)
    .optional()
});

const productBodySchema = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().min(10).max(3000),
  price: z.coerce.number().int().min(0).max(999_999_999),
  categoryId: z.coerce.number().int().positive(),
  inStock: z.union([z.literal("true"), z.literal("false"), z.boolean()]).transform((value) => value === true || value === "true"),
  imageUrl: z.string().trim().max(1000).optional().default("")
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80)
});

const sortSchema = z.enum(["new", "price-asc", "price-desc"]).catch("new");
const imageMimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(
  "/uploads",
  express.static(uploadDir, {
    immutable: true,
    maxAge: "30d",
    fallthrough: false
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Слишком много попыток входа. Попробуйте позже." }
});

const requestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Слишком много заявок. Попробуйте позже." }
});

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${imageMimeToExt[file.mimetype]}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!imageMimeToExt[file.mimetype]) return cb(new Error("Можно загружать только JPG, PNG или WebP."));
    cb(null, true);
  }
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function publicProductInclude() {
  return { category: true };
}

function productSelect() {
  return {
    include: { category: true },
    orderBy: { createdAt: "desc" as const }
  };
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Некорректный идентификатор");
  return id;
}

function isValidImageUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/uploads/")) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function uniqueProductSlug(name: string, id?: number) {
  const base = slugify(name) || "product";
  let slug = base;
  let index = 2;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${base}-${index}`;
    index += 1;
  }
}

function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Требуется авторизация" });

  try {
    jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Сессия истекла" });
  }
}

async function buildCartItems(items: CartPayloadItem[]) {
  const normalized = items.map((item) => ({
    productId: Number(item.productId),
    quantity: Math.max(1, Number(item.quantity) || 1)
  }));

  if (!normalized.length) return { cartItems: [], totalAmount: 0 };

  const products = await prisma.product.findMany({
    where: { id: { in: normalized.map((item) => item.productId) } },
    include: publicProductInclude()
  });

  const cartItems = normalized
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        category: product.category.name,
        price: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const totalAmount = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  return { cartItems, totalAmount };
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, jwtSecret, jwtSignOptions);
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/categories", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const search = z.string().trim().max(100).catch("").parse(req.query.search);
    const category = z.string().trim().max(100).catch("").parse(req.query.category);
    const sort = sortSchema.parse(req.query.sort);

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] } : {},
          category ? { category: { slug: category } } : {}
        ]
      },
      include: publicProductInclude(),
      orderBy: sort === "price-asc" ? { price: "asc" } : sort === "price-desc" ? { price: "desc" } : { createdAt: "desc" }
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:slug", async (req, res, next) => {
  try {
    const slug = z.string().trim().min(1).max(180).parse(req.params.slug);
    const product = await prisma.product.findUnique({
      where: { slug },
      include: publicProductInclude()
    });
    if (!product) return res.status(404).json({ message: "Товар не найден" });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.post("/api/requests", requestLimiter, async (req, res, next) => {
  try {
    const payload = requestSchema.parse(req.body);

    if (payload.items) {
      const { cartItems, totalAmount } = await buildCartItems(payload.items);
      if (!cartItems.length) return res.status(400).json({ message: "Корзина пустая" });

      const request = await prisma.request.create({
        data: {
          name: payload.name,
          phone: payload.phone,
          comment: payload.comment,
          itemsJson: JSON.stringify(cartItems),
          totalAmount
        },
        include: { product: true }
      });

      return res.status(201).json(request);
    }

    if (!payload.productId) return res.status(400).json({ message: "Выберите товар" });
    const product = await prisma.product.findUniqueOrThrow({ where: { id: payload.productId } });

    const request = await prisma.request.create({
      data: {
        name: payload.name,
        phone: payload.phone,
        comment: payload.comment,
        productId: product.id,
        itemsJson: JSON.stringify([{ productId: product.id, name: product.name, price: product.price, quantity: 1, lineTotal: product.price }]),
        totalAmount: product.price
      },
      include: { product: true }
    });

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/products", auth, async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany(productSelect());
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/products", auth, upload.single("image"), async (req, res, next) => {
  try {
    const body = productBodySchema.parse(req.body);
    if (!req.file && !isValidImageUrl(body.imageUrl)) throw new HttpError(400, "Укажите корректную ссылку на фото.");

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: await uniqueProductSlug(body.name),
        description: body.description,
        price: body.price,
        categoryId: body.categoryId,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : body.imageUrl,
        inStock: body.inStock
      },
      include: publicProductInclude()
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/products/:id", auth, upload.single("image"), async (req, res, next) => {
  try {
    const id = parseId(String(req.params.id));
    const body = productBodySchema.parse(req.body);
    if (!req.file && !isValidImageUrl(body.imageUrl)) throw new HttpError(400, "Укажите корректную ссылку на фото.");

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: await uniqueProductSlug(body.name, id),
        description: body.description,
        price: body.price,
        categoryId: body.categoryId,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : body.imageUrl,
        inStock: body.inStock
      },
      include: publicProductInclude()
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/products/:id", auth, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: parseId(String(req.params.id)) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/categories", auth, async (req, res, next) => {
  try {
    const { name } = categorySchema.parse(req.body);
    const slug = slugify(name);
    const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (exists) return res.status(409).json({ message: "Такой тип товара уже есть" });

    const category = await prisma.category.create({ data: { name, slug } });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/requests", auth, async (_req, res, next) => {
  try {
    const requests = await prisma.request.findMany({
      include: { product: { include: publicProductInclude() } },
      orderBy: { createdAt: "desc" }
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

if (isProduction && fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: "1h" }));
  app.use((_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: "Проверьте заполнение полей", issues: error.issues });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? `Файл должен быть не больше ${maxUploadMb} МБ` : "Ошибка загрузки файла" });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return res.status(409).json({ message: "Запись с такими данными уже существует" });
    if (error.code === "P2025") return res.status(404).json({ message: "Запись не найдена" });
  }

  console.error(error);
  res.status(500).json({ message: "Ошибка сервера" });
});

app.listen(port, () => {
  console.log(`API started on http://localhost:${port}`);
});
