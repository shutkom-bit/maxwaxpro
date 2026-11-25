/* ---------------------------------------------------------------
   GET /api/weather: погода в місті відвідувача для підказки суміші.
   Місто й координати бере з заголовків, які Vercel сам визначає за
   IP-адресою (x-vercel-ip-city, -latitude, -longitude). IP не
   зберігається і далі не передається. Прогноз береться в MET Norway
   (api.met.no, безкоштовно, з указанням джерела); туди йдуть лише
   округлені координати міста.
   На preview-деплоях можна підставити тестове місто:
     /api/weather?lat=60.17&lon=24.94&city=Helsinki&country=FI
   --------------------------------------------------------------- */
var UA = 'maxwaxpro.com weather hint (https://www.maxwaxpro.com)';
var TTL_MS = 30 * 60 * 1000;
var cache = new Map(); // ключ: округлені координати

function num(v) {
  var n = parseFloat(v);
  return isFinite(n) ? n : null;
}
function round(n, d) {
  var k = Math.pow(10, d);
  return Math.round(n * k) / k;
}
function decode(v) {
  if (!v) { return ''; }
  try { return decodeURIComponent(String(v)); } catch (e) { return String(v); }
}

async function forecast(lat, lon) {
  var key = lat + ',' + lon;
  var hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL_MS) { return hit.v; }

  var url = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + lat + '&lon=' + lon;
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, 4000);
  var r;
  try {
    r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!r.ok) { throw new Error('met ' + r.status); }
  var data = await r.json();
  var series = (data && data.properties && data.properties.timeseries) || [];
  if (!series.length) { throw new Error('met empty'); }

  var now = series[0].data.instant.details.air_temperature;
  var limit = Date.parse(series[0].time) + 7 * 24 * 3600 * 1000;
  var min = now, max = now;
  for (var i = 0; i < series.length; i++) {
    if (Date.parse(series[i].time) > limit) { break; }
    var tt = series[i].data.instant.details.air_temperature;
    if (typeof tt !== 'number') { continue; }
    if (tt < min) { min = tt; }
    if (tt > max) { max = tt; }
  }
  var v = { now: Math.round(now), min: Math.round(min), max: Math.round(max) };
  cache.set(key, { t: Date.now(), v: v });
  if (cache.size > 2000) { cache.clear(); }
  return v;
}

module.exports = async function handler(req, res) {
  // Відповідь залежить від IP відвідувача, тому кешується лише в його браузері
  res.setHeader('Cache-Control', 'private, max-age=900');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false });
  }

  var h = req.headers;
  var lat = num(h['x-vercel-ip-latitude']);
  var lon = num(h['x-vercel-ip-longitude']);
  var city = decode(h['x-vercel-ip-city']);
  var country = String(h['x-vercel-ip-country'] || '').slice(0, 2);

  var q = req.query || {};
  if (process.env.VERCEL_ENV !== 'production' && q.lat && q.lon) {
    lat = num(q.lat); lon = num(q.lon);
    city = String(q.city || '').slice(0, 60);
    country = String(q.country || '').slice(0, 2);
  }

  if (lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(200).json({ ok: false });
  }

  try {
    var w = await forecast(round(lat, 2), round(lon, 2));
    return res.status(200).json({ ok: true, city: city.slice(0, 60), country: country, now: w.now, min: w.min, max: w.max });
  } catch (e) {
    return res.status(200).json({ ok: false });
  }
};
