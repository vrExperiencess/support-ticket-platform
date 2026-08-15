# =====================================================
# STAGE 1 - React build
# =====================================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=/api

ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build


# =====================================================
# STAGE 2 - Nginx
# =====================================================

FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]