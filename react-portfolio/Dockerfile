FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE

COPY package*.json ./

RUN npm config set fund false \
	&& npm config set audit false \
	&& npm config set fetch-retries 5 \
	&& npm config set fetch-retry-mintimeout 20000 \
	&& npm config set fetch-retry-maxtimeout 120000 \
	&& npm config set fetch-timeout 300000 \
	&& npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
