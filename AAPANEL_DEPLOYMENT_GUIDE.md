# aaPanel ডেপ্লয়মেন্ট গাইড (বাংলা) — Fashion & Lifestyle E-Commerce

এই গাইডটি অনুসরণ করে **aaPanel** (VPS বা Cloud Server যেমন: DigitalOcean, Hetzner, Contabo, AWS, Linode) এ সম্পূর্ণ সাইটটি খুব সহজে ৫-১০ মিনিটের মধ্যে লাইভ করতে পারবেন।

---

## ১. aaPanel-এ প্রয়োজনীয় অ্যাপস ইন্সটল (Environment Setup)

আপনার aaPanel ড্যাশবোর্ডে লগইন করে **App Store** থেকে নিচের সফটওয়্যারগুলো ইন্সটল করা আছে কিনা নিশ্চিত করুন:

1. **Web Server**: Nginx (v1.22 বা v1.24)
2. **Database**: MySQL (v5.7 বা v8.0)
3. **PHP**: PHP-8.2 অথবা PHP-8.3
4. **Database Tool**: phpMyAdmin

### ⚠️ গুরুত্বপূর্ণ: PHP ফাংশন আনব্লক করা (PHP Disabled Functions)
Laravel ও Composer সঠিকভাবে চলার জন্য aaPanel-এ কিছু ফাংশন আনব্লক করতে হয়:
1. **App Store** > **PHP 8.2 / 8.3** এর ডানপাশে **Settings**-এ ক্লিক করুন।
2. **Disabled functions** ট্যাবে যান।
3. তালিকা থেকে নিচের ফাংশনগুলো সিলেক্ট করে **Delete** (Remove) করে দিন:
   - `putenv`
   - `proc_open`
   - `symlink`
   - `exec`
4. **Install extensions** ট্যাবে গিয়ে নিশ্চিত করুন `fileinfo`, `curl`, `mbstring`, `openssl`, `mysqli`, `pdo_mysql` ইন্সটল্ড আছে।

---

## ২. aaPanel-এ ওয়েবসাইট তৈরি করা (Add Website)

1. aaPanel-এর বাম পাশের মেনু থেকে **Website** > **Add site**-এ ক্লিক করুন।
2. ফর্মটি পূরণ করুন:
   - **Domain**: আপনার ডোমেইন নাম (যেমন: `yourdomain.com`)
   - **Description**: `Fashion Store`
   - **Root directory**: `/www/wwwroot/yourdomain.com` (ডিফল্ট থাকবে)
   - **Database**: **MySQL** সিলেক্ট করুন (এটি স্বয়ংক্রিয়ভাবে ডাটাবেজ নাম, ইউজার ও পাসওয়ার্ড তৈরি করবে। পাসওয়ার্ডটি সেভ রাখুন)।
   - **PHP Version**: **PHP-82** অথবা **PHP-83** সিলেক্ট করুন।
3. **Submit** বাটনে ক্লিক করুন।

---

## ৩. প্রজেক্ট কোড সার্ভারে নিয়ে আসা

আপনি ২ ভাবে কোড আনতে পারেন (GitHub সবচেয়ে সহজ):

### পদ্ধতি ১: GitHub রিপোজিটরি থেকে সরাসরি ক্লোন (রেকমেন্ডেড)
aaPanel-এর **Terminal** অপশনে যান অথবা SSH দিয়ে সার্ভারে ঢুকে নিচের কমান্ডগুলো চালান:

```bash
# আপনার ওয়েবসাইটের ফোল্ডারে প্রবেশ করুন
cd /www/wwwroot/yourdomain.com

# ফোল্ডার ফাঁকা করে গিট থেকে কোড ক্লোন করুন
rm -rf * .[^.]*
git clone https://github.com/esakash12/likhawear.git .
```

### পদ্ধতি ২: ফাইল আপলোড করে এক্সট্র্যাক্ট করা
1. আপনার লোকাল প্রজেক্ট থেকে `.zip` ফাইল বানান (লক্ষ্য রাখবেন `node_modules` এবং `.env` নেওয়ার প্রয়োজন নেই)।
2. aaPanel-এর **Files** মেনুতে যান এবং `/www/wwwroot/yourdomain.com` ফোল্ডারে ফাইলটি আপলোড করে **Unzip** করুন।

---

## ৪. কম্পোজার প্যাকেজ ইন্সটল করা (Composer Install)

aaPanel-এর **Terminal**-এ গিয়ে কমান্ড দিন:

```bash
cd /www/wwwroot/yourdomain.com
composer install --optimize-autoloader --no-dev
```

*(যদি composer কমান্ড না পায়, aaPanel App Store থেকে **Composer Tool** ইন্সটল করে নিতে পারেন অথবা `/usr/bin/composer` ব্যবহার করুন)*

---

## ৫. রানিং ডিরেক্টরি এবং URL Rewrite কনফিগারেশন (সবচেয়ে গুরুত্বপূর্ণ!)

Laravel-এর সব রিকোয়েস্ট `public/` ফোল্ডারের মাধ্যমে রান হয়:

1. aaPanel-এর **Website** মেনুতে যান এবং আপনার সাইটের নামের উপর ক্লিক করে **Settings** ওপেন করুন।
2. **Site directory** ট্যাবে যান:
   - **Running directory**: ড্রপডাউন থেকে **`/public`** সিলেক্ট করুন।
   - **Save** বাটনে ক্লিক করুন।
3. **URL rewrite** ট্যাবে যান:
   - ড্রপডাউনে **`laravel5`** সিলেক্ট করুন (এটি সব আধুনিক লারাভেলেও কাজ করে)।
   - অথবা নিচের কোডটি পেস্ট করুন:
     ```nginx
     location / {
         try_files $uri $uri/ /index.php?$query_string;
     }
     ```
   - **Save** বাটনে ক্লিক করুন।

---

## ৬. `.env` ফাইল ও ডাটাবেজ কনফিগারেশন

1. প্রজেক্টের রুট ফোল্ডারে থাকা `.env.example` ফাইলটিকে `.env` নামে কপি করুন:
   ```bash
   cp .env.example .env
   ```
2. aaPanel **Files** ম্যানেজার দিয়ে `.env` ফাইলটি ওপেন করে এডিট করুন:
   ```env
   APP_NAME="Fashion & Lifestyle"
   APP_ENV=production
   APP_KEY=base64:M5mboTDrIAXXP6aRTwWFQ1VAqjA0//XfcP1iAjNqyoI=
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_aapanel_db_name
   DB_USERNAME=your_aapanel_db_user
   DB_PASSWORD=your_db_password
   ```
   ফাইলটি **Save** করুন।

3. **database.sql ইম্পোর্ট করা**:
   - aaPanel-এর **Databases** মেনুতে যান।
   - আপনার তৈরি করা ডাটাবেজের পাশে **phpMyAdmin** অথবা **Import**-এ ক্লিক করুন।
   - প্রজেক্টের রুটে থাকা `database.sql` ফাইলটি ইম্পোর্ট করে দিন।

---

## ৭. ফোল্ডার পারমিশন এবং ক্যাশ অপটিমাইজেশন

aaPanel-এর **Terminal**-এ নিচের কমান্ডগুলো একবারে রান করুন:

```bash
cd /www/wwwroot/yourdomain.com

# পারমিশন ঠিক করা
chmod -R 775 storage bootstrap/cache
chown -R www:www storage bootstrap/cache

# স্টোরেজ সিম্বলিক লিংক ও অপটিমাইজেশন ক্যাশ
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## ৮. ফ্রি SSL (HTTPS) চালু করা

1. aaPanel **Website** মেনু থেকে আপনার সাইটের **Settings** ওপেন করুন।
2. **SSL** ট্যাবে যান।
3. **Let's Encrypt** সিলেক্ট করুন।
4. আপনার ডোমেইনটি টিক দিয়ে **Apply** বাটনে ক্লিক করুন।
5. SSL সফলভাবে ইস্যু হলে উপরে **Force HTTPS** টগল বাটনটি অন করে দিন।

---

## ৯. সিক্রেট অ্যাডমিন লগইন (Stealth Portal)

- **Admin Login URL**: `https://yourdomain.com/mg/shohag/admin`
- **Default Email**: `admin@zinniabd.com`
- **Default Password**: `admin123456`
