FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
ARG VITE_API_URL=/api
ARG VITE_STORE_PHONE=87756148891
ARG VITE_STORE_EMAIL=Armaw-91.91@mail.ru
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STORE_PHONE=$VITE_STORE_PHONE
ENV VITE_STORE_EMAIL=$VITE_STORE_EMAIL
COPY . .
RUN npx prisma generate
RUN npm run build:all

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p /app/uploads
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && npm run start"]
