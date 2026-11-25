/* MAX WAX PRO: спільна поведінка всіх сторінок.
   - меню мов з іконкою перекладу і перемикач теми (усі сторінки);
   - мобільне меню, переклад UA/EN і лічильник кошика (лише внутрішні сторінки:
     на головній це робить її власний скрипт разом із кошиком). */
(function(){
  var root = document.documentElement;
  var HOME = !!document.getElementById('mosaic');
  var LANG_KEY = 'mwp-lang-v1';
  var CART_KEY = 'mwp-cart-v2';
  var THEME_KEY = 'mwp-theme';

  // ---------------- тема ----------------
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function effectiveTheme(){
    var t = root.getAttribute('data-theme');
    if(t === 'dark' || t === 'light'){ return t; }
    return mq && mq.matches ? 'dark' : 'light';
  }
  function syncTheme(){ root.setAttribute('data-theme-eff', effectiveTheme()); }
  document.querySelectorAll('[data-theme-toggle]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
      syncTheme();
    });
  });
  if(mq && mq.addEventListener){ mq.addEventListener('change', syncTheme); }
  syncTheme();

  // ---------------- меню мов ----------------
  var trigger = document.getElementById('langTrigger');
  var list = document.getElementById('langList');
  function closeLang(focusBack){
    if(!list || list.hidden){ return; }
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if(focusBack){ trigger.focus(); }
  }
  if(trigger && list){
    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      var open = list.hidden;
      list.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if(open){ var a = list.querySelector('.lang-btn.active') || list.querySelector('.lang-btn'); if(a){ a.focus(); } }
    });
    list.addEventListener('click', function(e){ if(e.target.closest('.lang-btn')){ closeLang(true); } });
    document.addEventListener('click', function(e){ if(!e.target.closest('.lang-menu')){ closeLang(false); } });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeLang(true); } });
  }
  function syncLangLabel(){
    var cur = root.getAttribute('data-lang') === 'en' ? 'EN' : 'UA';
    document.querySelectorAll('.lang-cur').forEach(function(el){ el.textContent = cur; });
  }
  if(window.MutationObserver){
    new MutationObserver(syncLangLabel).observe(root, { attributes:true, attributeFilter:['data-lang'] });
  }
  syncLangLabel();

  // На головній на телефоні кнопка WhatsApp не перекриває «У кошик»: з'являється після першого екрана
  var wa = document.querySelector('.wa-float'), heroEl = document.getElementById('products');
  if(HOME && wa && heroEl && window.IntersectionObserver && window.matchMedia){
    var narrow = window.matchMedia('(max-width:760px)');
    new IntersectionObserver(function(entries){
      var e = entries[0];
      wa.classList.toggle('wa-off', narrow.matches && e.isIntersecting && e.intersectionRatio > 0.25);
    }, { threshold:[0, 0.25, 0.5] }).observe(heroEl);
  }

  if(HOME){ return; }

  // ---------------- внутрішні сторінки ----------------
  function applyLang(lang){
    root.setAttribute('lang', lang);
    root.setAttribute('data-lang', lang);
    var attr = lang === 'en' ? 'data-en' : 'data-uk';
    document.querySelectorAll('[data-en]').forEach(function(el){
      var val = el.getAttribute(attr);
      if(val !== null){ el.textContent = val; }
    });
    var htmlAttr = lang === 'en' ? 'data-en-html' : 'data-uk-html';
    document.querySelectorAll('[data-en-html]').forEach(function(el){
      var val = el.getAttribute(htmlAttr);
      if(val !== null){ el.innerHTML = val; }
    });
    document.querySelectorAll('[data-en-alt]').forEach(function(el){
      el.setAttribute('alt', el.getAttribute(lang === 'en' ? 'data-en-alt' : 'data-uk-alt'));
    });
    var titleEl = document.querySelector('title[data-en]');
    if(titleEl){ document.title = titleEl.textContent; }
    document.querySelectorAll('.lang-btn').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    try{ localStorage.setItem(LANG_KEY, lang); }catch(e){}
  }
  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.addEventListener('click', function(){ applyLang(b.getAttribute('data-lang')); });
  });

  var menuToggle = document.getElementById('menuToggle');
  var mobilePanel = document.getElementById('mobilePanel');
  if(menuToggle && mobilePanel){
    menuToggle.addEventListener('click', function(){
      var isOpen = mobilePanel.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Кількість товарів у кошику (сам кошик живе на головній)
  var countEl = document.getElementById('cartCount');
  if(countEl){
    try{
      var saved = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      countEl.textContent = Array.isArray(saved) ? saved.length : 0;
    }catch(e){}
  }

  var savedLang;
  try{ savedLang = localStorage.getItem(LANG_KEY); }catch(e){}
  applyLang(savedLang === 'en' ? 'en' : 'uk');
})();
