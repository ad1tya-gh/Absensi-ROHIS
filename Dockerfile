# 1. Gunakan image PHP resmi yang sudah include Apache bawaan
FROM php:8.2-apache

# 2. Instal dependensi sistem dan ekstensi PHP yang dibutuhkan Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd

# 3. Aktifkan modul mod_rewrite Apache (wajib untuk routing Laravel)
RUN a2enmod rewrite

# 4. Instal Composer secara otomatis
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Instal Node.js dan NPM (untuk nge-build React/Inertia)
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# 6. Set folder kerja di dalam container
WORKDIR /var/www/html

# 7. Salin seluruh isi project kamu ke dalam container
COPY . .

# 8. Jalankan instalasi Laravel dan build React menggunakan Vite
RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

# 9. Ubah hak akses folder storage agar Laravel bisa menulis log/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 10. Ubah Document Root Apache ke folder 'public' milik Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# 11. Buka port 80 untuk akses web
EXPOSE 80