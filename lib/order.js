/* ---------------------------------------------------------------
   Перевірка замовлень і заявок дилерів (без мережі: легко тестувати).
   Сума рахується ТІЛЬКИ за прайсом із catalog.js; ціни, які прислав
   браузер, ігноруються.
   --------------------------------------------------------------- */
var LIMITS = {
  name: 100, phone: 30, email: 120, city: 160, comment: 1000,
  companyName: 160, items: 50
};

function clean(value, max) {
  if (typeof value !== 'string') { return ''; }
  // прибираємо керуючі символи, обрізаємо пробіли та довжину
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function validPhone(phone) {
  var digits = phone.replace(/\D/g, '');
  return /^[+\d\s()\-.]+$/.test(phone) && digits.length >= 9 && digits.length <= 15;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function fail(error) { return { ok: false, error: error }; }

function priceItems(rawItems, catalog) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) { return fail('empty_cart'); }
  if (rawItems.length > LIMITS.items) { return fail('too_many_items'); }
  var items = [];
  for (var i = 0; i < rawItems.length; i++) {
    var raw = rawItems[i] || {};
    var product = null;
    for (var j = 0; j < catalog.length; j++) {
      if (catalog[j].id === raw.id) { product = catalog[j]; break; }
    }
    var v = Number(raw.v);
    if (!product || !Number.isInteger(v) || !product.variants[v]) { return fail('unknown_item'); }
    var variant = product.variants[v];
    items.push({ id: product.id, v: v, name: product.name + ', ' + variant.label, price: variant.price });
  }
  return { ok: true, items: items };
}

/* Повертає { ok:true, spam:bool, payload } або { ok:false, error } */
function buildOrder(body, catalog) {
  body = body || {};
  var spam = clean(body.website, 200) !== ''; // honeypot: людина це поле не бачить
  var type = body.type === 'dealer' ? 'dealer' : 'order';

  if (type === 'dealer') {
    var companyName = clean(body.companyName, LIMITS.companyName);
    var contactName = clean(body.contactName, LIMITS.name);
    var dEmail = clean(body.email, LIMITS.email);
    var dPhone = clean(body.phone, LIMITS.phone);
    if (!companyName || !contactName) { return fail('missing_fields'); }
    if (!validEmail(dEmail)) { return fail('bad_email'); }
    if (!validPhone(dPhone)) { return fail('bad_phone'); }
    return {
      ok: true, spam: spam,
      payload: {
        customerName: contactName,
        customerPhone: dPhone,
        customerEmail: dEmail,
        city: '',
        comment: 'Заявка дилера. Компанія: ' + companyName,
        items: [],
        itemsText: 'Заявка дилера\nКомпанія: ' + companyName + '\nКонтактна особа: ' + contactName,
        total: 0,
        currency: 'UAH',
        source: 'maxwaxpro.com (B2B форма)',
        requestType: 'dealer_application',
        companyName: companyName
      }
    };
  }

  var name = clean(body.name, LIMITS.name);
  var phone = clean(body.phone, LIMITS.phone);
  var email = clean(body.email, LIMITS.email);
  var city = clean(body.city, LIMITS.city);
  var comment = clean(body.comment, LIMITS.comment);
  if (!name) { return fail('missing_fields'); }
  if (!validPhone(phone)) { return fail('bad_phone'); }
  if (email && !validEmail(email)) { return fail('bad_email'); }

  var priced = priceItems(body.items, catalog);
  if (!priced.ok) { return priced; }
  var total = priced.items.reduce(function (sum, it) { return sum + it.price; }, 0);

  return {
    ok: true, spam: spam,
    payload: {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      city: city,
      comment: comment,
      items: priced.items.map(function (it) { return { id: it.id, name: it.name, price: it.price }; }),
      itemsText: priced.items.map(function (it) { return it.name + ': ' + it.price + ' грн'; }).join('\n'),
      total: total,
      currency: 'UAH',
      source: 'maxwaxpro.com',
      requestType: 'order'
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildOrder: buildOrder, LIMITS: LIMITS };
}
