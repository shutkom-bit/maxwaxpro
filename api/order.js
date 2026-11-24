/* ---------------------------------------------------------------
   POST /api/order — приймає замовлення й заявки дилерів із сайту,
   перевіряє їх і пересилає в Make.
   Адреса вебхука Make більше не видна в коді сторінки: вона
   лежить у змінних середовища Vercel.
     MAKE_WEBHOOK_URL — адреса вебхука Make (обов'язково)
     MAKE_API_KEY     — ключ вебхука Make, якщо ввімкнено
                        автентифікацію (заголовок x-make-apikey)
   --------------------------------------------------------------- */
var CATALOG = require('../catalog.js');
var buildOrder = require('../lib/order.js').buildOrder;

var ALLOWED_HOSTS = ['maxwaxpro.com', 'www.maxwaxpro.com', 'localhost'];
var RATE_WINDOW_MS = 10 * 60 * 1000;
var RATE_MAX = 5;
var hits = new Map(); // найпростіший ліміт у пам'яті одного інстансу

function originAllowed(req) {
  var origin = req.headers.origin || req.headers.referer || '';
  var host;
  try { host = new URL(origin).hostname; } catch (e) { return false; }
  if (ALLOWED_HOSTS.indexOf(host) !== -1) { return true; }
  // preview-деплої цього проєкту на Vercel
  return /^maxwaxpro-[a-z0-9-]+-miks-projects-1f722f97\.vercel\.app$/.test(host);
}

function rateLimited(ip) {
  var now = Date.now();
  var list = (hits.get(ip) || []).filter(function (t) { return now - t < RATE_WINDOW_MS; });
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) { hits.clear(); }
  return list.length > RATE_MAX;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  if (!originAllowed(req)) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  var ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'too_many_requests' });
  }

  var body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== 'object' || JSON.stringify(body).length > 20000) {
    return res.status(400).json({ ok: false, error: 'bad_request' });
  }

  var result = buildOrder(body, CATALOG);
  if (!result.ok) {
    return res.status(400).json({ ok: false, error: result.error });
  }
  if (result.spam) {
    // бот заповнив приховане поле: відповідаємо "ок", але нікуди не пересилаємо
    return res.status(200).json({ ok: true });
  }

  var webhook = process.env.MAKE_WEBHOOK_URL;
  if (!webhook) {
    console.error('MAKE_WEBHOOK_URL is not set');
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }
  var headers = { 'Content-Type': 'application/json' };
  if (process.env.MAKE_API_KEY) { headers['x-make-apikey'] = process.env.MAKE_API_KEY; }

  try {
    var makeRes = await fetch(webhook, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(result.payload),
      signal: AbortSignal.timeout(8000)
    });
    if (!makeRes.ok) {
      console.error('Make responded', makeRes.status);
      return res.status(502).json({ ok: false, error: 'upstream_error' });
    }
  } catch (e) {
    console.error('Make request failed', e && e.message);
    return res.status(502).json({ ok: false, error: 'upstream_error' });
  }
  return res.status(200).json({ ok: true, total: result.payload.total });
};
