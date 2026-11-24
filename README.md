# MAX WAX PRO — деплой на Vercel через GitHub

Це готова папка для деплою. `index.html` — та сама сторінка з каталогом,
кошиком і формою замовлення, яку ми зробили в чаті.

## 1. Створити репозиторій на GitHub

```bash
cd maxwaxpro-site      # ця папка
git init
git add .
git commit -m "MAX WAX PRO — перша версія сайту"
git branch -M main
git remote add origin https://github.com/<ваш-акаунт>/maxwaxpro-site.git
git push -u origin main
```

(Спочатку створіть порожній репозиторій `maxwaxpro-site` на github.com —
без README/gitignore, щоб уникнути конфлікту при першому пуші.)

## 2. Підключити до Vercel

1. Зайдіть на **vercel.com** → New Project.
2. Оберіть щойно створений репозиторій `maxwaxpro-site`.
3. Framework Preset: **Other** (це звичайний статичний HTML, білд не потрібен).
4. Натисніть Deploy — за хвилину буде робоче посилання типу
   `maxwaxpro-site.vercel.app`.

## 3. Прив'язати ваш домен maxwaxpro.com

1. У проєкті на Vercel: **Settings → Domains → Add**.
2. Введіть `maxwaxpro.com` (і за бажанням окремо `www.maxwaxpro.com`).
3. Vercel покаже, які DNS-записи потрібно додати. Зазвичай це один з двох варіантів:

   **Якщо домен керується напряму в реєстратора (GoDaddy, Namecheap і т.д.):**
   - Для `maxwaxpro.com` (apex-домен): A-запис на IP `76.76.21.21`
   - Для `www.maxwaxpro.com`: CNAME-запис на `cname.vercel-dns.com`

   **Якщо домен уже підключений до Cloudflare:**
   - Ті самі записи, але з вимкненим проксі (сіра хмаринка, не оранжева) —
     інакше Vercel не зможе видати SSL-сертифікат автоматично.

4. Зачекайте 5–30 хвилин на поширення DNS, Vercel сам перевірить і випустить
   безкоштовний SSL-сертифікат.

## 4. Що далі при кожній зміні сайту

Просто:
```bash
git add .
git commit -m "опис зміни"
git push
```
Vercel автоматично передеплоїть продакшен за секунди. Кожен push у гілку,
відмінну від `main`, дає окреме preview-посилання для перевірки перед мержем.

## Як працюють замовлення

Форми кошика й заявки дилера надсилають дані на `/api/order` (файл `api/order.js`,
серверна функція Vercel). Вона:

- рахує суму **тільки за прайсом** із `catalog.js` (ціни з браузера ігноруються);
- перевіряє телефон/email, обрізає задовгі поля, відкидає ботів (приховане поле `website`);
- приймає запити лише з maxwaxpro.com і preview-доменів проєкту, не більше 5 за 10 хв з однієї IP;
- пересилає замовлення в Make. Формат даних для Make не змінився.

Потрібні змінні середовища у Vercel (Settings → Environment Variables, Production і Preview):

| Змінна | Що це |
|---|---|
| `MAKE_WEBHOOK_URL` | адреса вебхука Make |
| `MAKE_API_KEY` | (необов'язково) ключ вебхука Make, надсилається в заголовку `x-make-apikey` |

Якщо функція недоступна, сайт, як і раніше, підстраховується листом через `mailto:` на maxwaxpro2@gmail.com.

Ціни й товари змінюються в одному місці: `catalog.js`.
