# Build stage (ECR Public Node image)
FROM public.ecr.aws/docker/library/node:18 AS build
 WORKDIR /app
 
# Copy only manifest files first for better caching
COPY package*.json ./
 
# Make installs resilient (peer-deps, network, audit/fund off, memory)
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN npm config set registry https://registry.npmjs.org/ \
&& npm set fetch-retries 5 \
&& npm set fetch-retry-maxtimeout 120000 \
&& npm set fetch-retry-mintimeout 20000 \
&& npm config set fund false \
&& npm config set audit false
 
# Prefer lockfile installs; fall back to legacy peer deps if needed
RUN npm ci || npm install --legacy-peer-deps --no-audit --no-fund
 
# Copy application source
COPY . .
 
# Build (supports CRA or Vite). If Vite outputs "dist", move to "build"
RUN npm run build || npm run build:prod
RUN if [ -d dist ]; then mv dist build; fi
 
# Runtime stage (ECR Public nginx)
FROM public.ecr.aws/docker/library/nginx:alpine
 
# Clean default content
RUN rm -rf /usr/share/nginx/html/*
 
# Copy built static site
COPY --from=build /app/build /usr/share/nginx/html
 
# Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 