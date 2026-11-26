/* ---------------------------------------------------------------
   MAX WAX PRO: каталог товарів і цін (єдине джерело).
   Використовується і сторінкою (window.MWP_CATALOG),
   і серверною функцією /api/order (require), яка за цим
   прайсом перераховує суму замовлення. Змінюєте ціну: тут.
   gallery: фото товару; photoKey (старі товари): ключ у window.__PRODUCT_PHOTOS__.
   Які категорії показувати на сайті, задає VISIBLE_CATS в index.html.
   --------------------------------------------------------------- */
(function(root){
var CATALOG = [
  // 1. PRO (дропси). Фото: фронт, зворот, дропси у відкритому пакеті
  { cat:"pro", id:"pro-pro-red", name:"PRO Red", temp:"+25°C … +45°C", scent:"аромат полуниці", scentEn:"strawberry scent",
    gallery:[
      {src:"images/pro-red-front.jpg", alt:"пакет, фронт", altEn:"bag, front"},
      {src:"images/pro-red-back.jpg", alt:"пакет, зворот з етикеткою", altEn:"bag, back label"},
      {src:"images/pro-red-drops.jpg", alt:"дропси у відкритому пакеті", altEn:"pellets in an open bag"}
    ],
    variants:[
      {label:"Дропси, 500 г", labelEn:"Pellets, 500 g", short:"500 г", shortEn:"500 g", price:1420, sale:999},
      {label:"Дропси, 1 кг", labelEn:"Pellets, 1 kg", short:"1 кг", shortEn:"1 kg", price:2120, sale:1499}
    ] },
  { cat:"pro", id:"pro-pro-yellow", name:"PRO Yellow", temp:"+18°C … +25°C", scent:"аромат лимона", scentEn:"lemon scent",
    gallery:[
      {src:"images/pro-yellow-front.jpg", alt:"пакет, фронт", altEn:"bag, front"},
      {src:"images/pro-yellow-back.jpg", alt:"пакет, зворот з етикеткою", altEn:"bag, back label"},
      {src:"images/pro-yellow-drops.jpg", alt:"дропси у відкритому пакеті", altEn:"pellets in an open bag"}
    ],
    variants:[
      {label:"Дропси, 500 г", labelEn:"Pellets, 500 g", short:"500 г", shortEn:"500 g", price:1420, sale:999},
      {label:"Дропси, 1 кг", labelEn:"Pellets, 1 kg", short:"1 кг", shortEn:"1 kg", price:2120, sale:1499}
    ] },
  { cat:"pro", id:"pro-pro-green", name:"PRO Green", temp:"+5°C … +18°C", scent:"аромат кави", scentEn:"coffee scent",
    gallery:[
      {src:"images/pro-green-front.jpg", alt:"пакет, фронт", altEn:"bag, front"},
      {src:"images/pro-green-back.jpg", alt:"пакет, зворот з етикеткою", altEn:"bag, back label"},
      {src:"images/pro-green-drops.jpg", alt:"дропси у відкритому пакеті", altEn:"pellets in an open bag"}
    ],
    variants:[
      {label:"Дропси, 500 г", labelEn:"Pellets, 500 g", short:"500 г", shortEn:"500 g", price:1420, sale:999},
      {label:"Дропси, 1 кг", labelEn:"Pellets, 1 kg", short:"1 кг", shortEn:"1 kg", price:2120, sale:1499}
    ] },
  { cat:"pro", id:"pro-pro-blue", name:"PRO Blue", temp:"−20°C … +5°C", scent:"аромат кокосу", scentEn:"coconut scent",
    gallery:[
      {src:"images/pro-blue-front.jpg", alt:"пакет, фронт", altEn:"bag, front"},
      {src:"images/pro-blue-back.jpg", alt:"пакет, зворот з етикеткою", altEn:"bag, back label"},
      {src:"images/pro-blue-drops.jpg", alt:"дропси у відкритому пакеті", altEn:"pellets in an open bag"}
    ],
    variants:[
      {label:"Дропси, 500 г", labelEn:"Pellets, 500 g", short:"500 г", shortEn:"500 g", price:1420, sale:999},
      {label:"Дропси, 1 кг", labelEn:"Pellets, 1 kg", short:"1 кг", shortEn:"1 kg", price:2120, sale:1499}
    ] },

  // 2. Wax Warmer (блоки для воскоплавів)
  { cat:"warmer", id:"warmer-wax-warmer-red", name:"Wax Warmer Red", temp:"+25°C … +45°C", photoKey:"red",
    variants:[{label:"Блок 320 г", labelEn:"Block, 320 g", price:1173}] },
  { cat:"warmer", id:"warmer-wax-warmer-yellow", name:"Wax Warmer Yellow", temp:"+18°C … +25°C", photoKey:"yellow",
    variants:[{label:"Блок 320 г", labelEn:"Block, 320 g", price:1173}] },
  { cat:"warmer", id:"warmer-wax-warmer-green", name:"Wax Warmer Green", temp:"+5°C … +18°C", photoKey:"green",
    variants:[{label:"Блок 320 г", labelEn:"Block, 320 g", price:1173}] },
  { cat:"warmer", id:"warmer-wax-warmer-blue", name:"Wax Warmer Blue", temp:"−20°C … +5°C", photoKey:"blue",
    variants:[{label:"Блок 320 г", labelEn:"Block, 320 g", price:1173}] },
  { cat:"warmer", id:"warmer-wax-warmer-power", name:"Wax Warmer Power (E-Bike)", tempEn:"For e-bikes", temp:"Для електротяги", photoKey:"grey",
    variants:[{label:"Блок 320 г", labelEn:"Block, 320 g", price:1173}] },

  // 3. Royal Eggs NB (з нітридом бору)
  { cat:"bn", id:"bn-royal-eggs-nb-red", name:"Royal Eggs NB Red", temp:"+25°C … +45°C", photoKey:"red",
    variants:[{label:"NB, 500 г", labelEn:"NB, 500 g", price:1737},{label:"Компенсаційні шарики, 250 г", labelEn:"Top-up balls, 250 g", price:901}] },
  { cat:"bn", id:"bn-royal-eggs-nb-yellow", name:"Royal Eggs NB Yellow", temp:"+18°C … +25°C", photoKey:"yellow",
    variants:[{label:"NB, 500 г", labelEn:"NB, 500 g", price:1737},{label:"Компенсаційні шарики, 250 г", labelEn:"Top-up balls, 250 g", price:901}] },
  { cat:"bn", id:"bn-royal-eggs-nb-green", name:"Royal Eggs NB Green", temp:"+5°C … +18°C", photoKey:"green",
    variants:[{label:"NB, 500 г", labelEn:"NB, 500 g", price:1737},{label:"Компенсаційні шарики, 250 г", labelEn:"Top-up balls, 250 g", price:901}] },
  { cat:"bn", id:"bn-royal-eggs-nb-blue", name:"Royal Eggs NB Blue", temp:"−20°C … +5°C", photoKey:"blue",
    variants:[{label:"NB, 500 г", labelEn:"NB, 500 g", price:1737},{label:"Компенсаційні шарики, 250 г", labelEn:"Top-up balls, 250 g", price:901}] },

  // 4. Флагман Black Diamond / Ice Diamond
  { cat:"diamond", id:"diamond-royal-eggs-black-diamond", name:"Royal Eggs Black Diamond",
    temp:"+15°C … +45°C, нагрів 90°C (3 хв)", tempEn:"+15°C … +45°C, heat to 90°C (3 min)", photoKey:"diamond-red",
    variants:[{label:"Комплект: 500 г + дегризер + 2×20 г + фіксатор", labelEn:"Kit: 500 g + degreaser + 2×20 g + fixative", price:2100}] },
  { cat:"diamond", id:"diamond-royal-eggs-ice-diamond", name:"Royal Eggs Ice Diamond",
    temp:"−10°C … +15°C, нагрів 90°C (3 хв)", tempEn:"−10°C … +15°C, heat to 90°C (3 min)", photoKey:"blue",
    variants:[{label:"Комплект: 500 г (сині кульки) + дегризер + 2×20 г + фіксатор", labelEn:"Kit: 500 g (blue balls) + degreaser + 2×20 g + fixative", price:2100}] },

  // 5. Дегризери
  { cat:"degreaser", id:"degreaser-degreaser-solid-red", name:"Degreaser Solid Red", temp:"Для нових ланцюгів, літо", tempEn:"For new chains, summer", photoKey:null,
    variants:[{label:"Твердий, 2×25 г", labelEn:"Solid, 2×25 g", price:479}] },
  { cat:"degreaser", id:"degreaser-degreaser-solid-yellow", name:"Degreaser Solid Yellow", temp:"Для нових ланцюгів, помірний клімат", tempEn:"For new chains, mild climate", photoKey:null,
    variants:[{label:"Твердий, 2×25 г", labelEn:"Solid, 2×25 g", price:479}] },
  { cat:"degreaser", id:"degreaser-degreaser-solid-green", name:"Degreaser Solid Green", temp:"Для нових ланцюгів, міжсезоння", tempEn:"For new chains, off-season", photoKey:null,
    variants:[{label:"Твердий, 2×25 г", labelEn:"Solid, 2×25 g", price:479}] },
  { cat:"degreaser", id:"degreaser-degreaser-solid-blue", name:"Degreaser Solid Blue", temp:"Для нових ланцюгів, холод", tempEn:"For new chains, cold", photoKey:null,
    variants:[{label:"Твердий, 2×25 г", labelEn:"Solid, 2×25 g", price:479}] },
  { cat:"degreaser", id:"degreaser-active-foam-degreaser", name:"Active Foam Degreaser", temp:"Концентрат для б/у ланцюгів і касет", tempEn:"Concentrate for used chains and cassettes", photoKey:null,
    variants:[{label:"Рідкий концентрат, 500 мл", labelEn:"Liquid concentrate, 500 ml", price:814}] },

  // 6. Набір Ultimate
  { cat:"sets", id:"sets-ultimate-set", name:"Ultimate Set", temp:"Блок 320 г + комплект обслуговування", tempEn:"320 g block + service kit", photoKey:"grey",
    variants:[{label:"WS₂ + MoS₂ + NB, дегризер, 2×20 г", labelEn:"WS₂ + MoS₂ + NB, degreaser, 2×20 g", price:1700}] }
];
// Акція. Поки триває (до SALE.until), діє variant.sale замість variant.price.
// Після дати ціни повертаються самі; щоб прибрати акцію раніше, поставте active:false.
var SALE = { active: true, until: "2026-11-30T21:59:59Z", label: "Black Friday −30%" }; // 30.11 23:59 за Києвом
function saleOn(now){ return SALE.active && (now === undefined ? Date.now() : now) < Date.parse(SALE.until); }
function currentPrice(variant, now){ return (variant.sale && saleOn(now)) ? variant.sale : variant.price; }
CATALOG.SALE = SALE; CATALOG.saleOn = saleOn; CATALOG.currentPrice = currentPrice;
if (typeof module !== 'undefined' && module.exports) { module.exports = CATALOG; }
else { root.MWP_CATALOG = CATALOG; }
})(this);
