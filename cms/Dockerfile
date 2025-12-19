FROM node:20-alpine

# Gerekli kütüphaneler
RUN apk update && apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    nasm \
    bash \
    vips-dev \
    git

WORKDIR /opt/app
ENV NODE_ENV=development

# Entrypoint script'ini kopyala
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Windows satır sonlarını düzelt ve çalıştırılabilir yap
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]