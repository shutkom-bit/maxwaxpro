/* MAX WAX PRO: спільна поведінка внутрішніх сторінок (меню на телефоні, мова UA/EN, лічильник кошика).
   Головна сторінка має власний скрипт із кошиком і не підключає цей файл. */
(function(){
  var LANG_KEY = 'mwp-lang-v1';
  var CART_KEY = 'mwp-cart-v2';

  function applyLang(lang){
    var root = document.documentElement;
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
