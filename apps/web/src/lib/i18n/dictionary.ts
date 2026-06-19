import type { Locale } from '@/store/prefs';

/**
 * Flat translation dictionary — keys are dot-namespaced; each holds the three
 * locales side by side so translators see all languages at once. Pure module
 * (no React) so it can be imported anywhere.
 */
export const DICT = {
  // ── nav / header ──────────────────────────────────────────────
  'nav.all': { uz: 'Hammasi', ru: 'Все товары', en: 'All products' },
  'nav.catalog': { uz: 'Katalog', ru: 'Каталог', en: 'Catalog' },
  'nav.home': { uz: 'Bosh sahifa', ru: 'Главная', en: 'Home' },
  'nav.new': { uz: 'Yangi', ru: 'Новые', en: 'New' },
  'nav.used': { uz: 'Ishlatilgan', ru: 'Б/У', en: 'Used' },
  'nav.deals': { uz: 'Chegirmalar', ru: 'Скидки', en: 'Deals' },
  'nav.wishlist': { uz: 'Saralangan', ru: 'Избранное', en: 'Wishlist' },
  'nav.cart': { uz: 'Savat', ru: 'Корзина', en: 'Cart' },
  'nav.account': { uz: 'Profil', ru: 'Профиль', en: 'Account' },
  'nav.orders': { uz: 'Buyurtmalar', ru: 'Заказы', en: 'Orders' },
  'nav.signin': { uz: 'Kirish', ru: 'Войти', en: 'Sign in' },
  'nav.signout': { uz: 'Chiqish', ru: 'Выйти', en: 'Sign out' },
  'nav.admin': { uz: 'Boshqaruv', ru: 'Админка', en: 'Admin' },
  'nav.search': { uz: 'Qidirish…', ru: 'Поиск…', en: 'Search…' },
  'nav.searchPlaceholder': { uz: 'iPhone, MacBook, Galaxy…', ru: 'iPhone, MacBook, Galaxy…', en: 'Search iPhone, MacBook, Galaxy…' },

  // ── product / card ────────────────────────────────────────────
  'card.new': { uz: 'Yangi', ru: 'Новинка', en: 'New' },
  'card.save': { uz: 'Saqlash', ru: 'В избранное', en: 'Save' },
  'card.saved': { uz: 'Saqlandi', ru: 'Сохранено', en: 'Saved' },
  'card.addToCart': { uz: 'Savatga', ru: 'В корзину', en: 'Add to cart' },
  'card.added': { uz: 'Qo‘shildi', ru: 'Добавлено', en: 'Added to cart' },
  'card.soldOut': { uz: 'Sotilgan', ru: 'Нет в наличии', en: 'Sold out' },
  'card.onlyLeft': { uz: 'Faqat {n} ta qoldi', ru: 'Осталось {n}', en: 'Only {n} left' },
  'card.off': { uz: '{n}% chegirma', ru: '-{n}%', en: '{n}% off' },

  // ── catalog ───────────────────────────────────────────────────
  'catalog.title': { uz: 'Barcha qurilmalar', ru: 'Все устройства', en: 'All devices' },
  'catalog.products': { uz: '{n} ta mahsulot', ru: '{n} товаров', en: '{n} products' },
  'catalog.filters': { uz: 'Filtrlar', ru: 'Фильтры', en: 'Filters' },
  'catalog.sort': { uz: 'Saralash', ru: 'Сортировка', en: 'Sort' },
  'catalog.sort.newest': { uz: 'Eng yangi', ru: 'Новые', en: 'Newest' },
  'catalog.sort.priceAsc': { uz: 'Arzon avval', ru: 'Дешевле', en: 'Price: low to high' },
  'catalog.sort.priceDesc': { uz: 'Qimmat avval', ru: 'Дороже', en: 'Price: high to low' },
  'catalog.sort.discount': { uz: 'Chegirma', ru: 'По скидке', en: 'Biggest discount' },
  'catalog.price': { uz: 'Narx', ru: 'Цена', en: 'Price' },
  'catalog.priceMin': { uz: 'dan', ru: 'от', en: 'Min' },
  'catalog.priceMax': { uz: 'gacha', ru: 'до', en: 'Max' },
  'catalog.category': { uz: 'Toifa', ru: 'Категория', en: 'Category' },
  'catalog.brand': { uz: 'Brend', ru: 'Бренд', en: 'Brand' },
  'catalog.condition': { uz: 'Holati', ru: 'Состояние', en: 'Condition' },
  'catalog.all': { uz: 'Barchasi', ru: 'Все', en: 'All' },
  'catalog.apply': { uz: 'Qo‘llash', ru: 'Применить', en: 'Apply' },
  'catalog.clear': { uz: 'Tozalash', ru: 'Сбросить', en: 'Clear' },
  'catalog.clearSearch': { uz: 'Qidiruvni tozalash', ru: 'Очистить поиск', en: 'Clear search' },
  'catalog.empty': { uz: 'Mos mahsulot topilmadi.', ru: 'Ничего не найдено.', en: 'No products match these filters.' },
  'catalog.clearAll': { uz: 'Barcha filtrlarni tozalash', ru: 'Сбросить все фильтры', en: 'Clear all filters' },
  'catalog.onSale': { uz: 'Chegirmada', ru: 'Со скидкой', en: 'On sale' },

  // ── home ──────────────────────────────────────────────────────
  'home.newArrivals': { uz: 'Yangi kelganlar', ru: 'Новинки', en: 'New arrivals' },
  'home.deals': { uz: 'Chegirmalar', ru: 'Скидки', en: 'Deals' },
  'home.viewAll': { uz: 'Barchasi', ru: 'Все', en: 'View all' },
  'home.prop.grading.title': { uz: 'Halol baholash', ru: 'Честная оценка', en: 'Honest grading' },
  'home.prop.grading.body': { uz: 'Har bir ishlatilgan qurilma A–C darajada, haqiqiy holat izohlari bilan. Hech qanday kutilmagan holatlar yo‘q.', ru: 'Каждое б/у устройство оценено по шкале A–C с реальными примечаниями. Без сюрпризов.', en: 'Every used device graded A–C with real condition notes. No surprises.' },
  'home.prop.checkout.title': { uz: 'Tez to‘lov', ru: 'Быстрая оплата', en: 'Instant checkout' },
  'home.prop.checkout.body': { uz: 'Payme, Click yoki naqd to‘lang. Xavfsiz va qulay.', ru: 'Оплата Payme, Click или наличными. Безопасно и удобно.', en: 'Pay with Payme, Click or cash. Secure, local, frictionless.' },
  'home.prop.delivery.title': { uz: 'Toshkent bo‘ylab bir kunda', ru: 'Доставка за день по Ташкенту', en: 'Same-day Tashkent' },
  'home.prop.delivery.body': { uz: 'Shahar bo‘ylab tez yetkazib berish yoki do‘kondan olib ketish.', ru: 'Быстрая доставка по городу или самовывоз из магазина.', en: 'Fast city-wide delivery, or pick up in-store today.' },
  'home.cta.title': { uz: 'Keyingi qurilmangizni toping.', ru: 'Найдите своё следующее устройство.', en: 'Find your next device.' },
  'home.cta.body': { uz: 'To‘liq katalogni ko‘ring — holati, brendi va byudjeti bo‘yicha saralang.', ru: 'Просмотрите весь каталог — фильтруйте по состоянию, бренду и бюджету.', en: 'Browse the full catalog — filter by condition, brand and budget.' },
  'home.cta.button': { uz: 'Katalogni ochish', ru: 'Открыть каталог', en: 'Explore catalog' },

  // ── hero ──────────────────────────────────────────────────────
  'hero.eyebrow': { uz: 'Toshkentdagi texnika do‘koni', ru: 'Магазин техники в Ташкенте', en: 'Tashkent’s tech flagship' },
  'hero.title1': { uz: 'Kelajak', ru: 'Будущее', en: 'The future' },
  'hero.title2': { uz: 'qo‘lingizda.', ru: 'в ваших руках.', en: 'in your hands.' },
  'hero.subtitle': { uz: 'Yangi va sertifikatlangan ishlatilgan smartfonlar, noutbuklar va elektronika — halol baholash va bir kunlik yetkazib berish bilan.', ru: 'Новые и сертифицированные б/у смартфоны, ноутбуки и электроника — честная оценка и доставка за день.', en: 'New and certified pre-owned smartphones, laptops and electronics — honest grading, same-day delivery.' },
  'hero.cta': { uz: 'Xarid qilish', ru: 'За покупками', en: 'Shop now' },
  'hero.ctaDeals': { uz: 'Chegirmalarni ko‘rish', ru: 'Смотреть скидки', en: 'View deals' },

  // ── product detail ────────────────────────────────────────────
  'detail.related': { uz: 'O‘xshash mahsulotlar', ru: 'Похожие товары', en: 'You may also like' },
  'detail.related.eyebrow': { uz: 'Tavsiya', ru: 'Рекомендуем', en: 'Recommended' },
  'detail.configuration': { uz: 'Konfiguratsiya', ru: 'Конфигурация', en: 'Configuration' },
  'detail.inStock': { uz: 'Sotuvda · {n} dona', ru: 'В наличии · {n} шт', en: 'In stock · {n} available' },
  'detail.outOfStock': { uz: 'Sotuvda yo‘q', ru: 'Нет в наличии', en: 'Out of stock' },
  'detail.delivery': { uz: 'Toshkent bo‘ylab bir kunda · Payme · Click · Naqd', ru: 'Доставка по Ташкенту за день · Payme · Click · Наличные', en: 'Same-day delivery in Tashkent · Payme · Click · Cash' },
  'detail.quickAdd': { uz: "Tez qo'shish", ru: 'Быстро добавить', en: 'Quick add' },
  'detail.addedToCart': { uz: "Savatga qo'shildi", ru: 'Добавлено в корзину', en: 'Added to cart' },
  'detail.added': { uz: "Qo'shildi", ru: 'Добавлено', en: 'Added' },
  'detail.addToCart': { uz: "Savatga qo'shish", ru: 'В корзину', en: 'Add to cart' },
  'detail.buyNow': { uz: 'Hozir sotib olish', ru: 'Купить сейчас', en: 'Buy now' },
  'detail.signInToAdd': { uz: "Qo'shish uchun kiring", ru: 'Войдите чтобы добавить', en: 'Sign in to add items' },
  'detail.highlights': { uz: 'Asosiy xususiyatlar', ru: 'Ключевые особенности', en: 'Highlights' },
  'detail.specs': { uz: 'Texnik xususiyatlar', ru: 'Характеристики', en: 'Specifications' },
  'detail.reviews': { uz: 'Sharhlar', ru: 'Отзывы', en: 'Reviews' },
  'detail.reviews.anon': { uz: 'Anonim', ru: 'Аноним', en: 'Anonymous' },
  'detail.fact.year': { uz: 'Chiqarilgan yili', ru: 'Год выпуска', en: 'Release year' },
  'detail.fact.model': { uz: 'Model', ru: 'Модель', en: 'Model' },
  'detail.fact.warranty': { uz: 'Kafolat', ru: 'Гарантия', en: 'Warranty' },
  'detail.fact.weight': { uz: 'Og‘irligi', ru: 'Вес', en: 'Weight' },
  'detail.fact.months': { uz: '{n} oy', ru: '{n} мес.', en: '{n} mo' },
  'detail.fact.grams': { uz: '{n} g', ru: '{n} г', en: '{n} g' },
  'detail.condition.report': { uz: 'Holat hisoboti', ru: 'Отчёт о состоянии', en: 'Condition report' },
  'detail.battery': { uz: 'Batareya holati', ru: 'Состояние батареи', en: 'Battery health' },
  'detail.breadcrumb.home': { uz: 'Bosh sahifa', ru: 'Главная', en: 'Home' },

  // ── wishlist page ─────────────────────────────────────────────
  'wishlist.title': { uz: 'Saralanganlar', ru: 'Избранное', en: 'Wishlist' },
  'wishlist.empty': { uz: 'Saralangan mahsulotlar yo‘q.', ru: 'В избранном пока пусто.', en: 'Your wishlist is empty.' },
  'wishlist.browse': { uz: 'Katalogga o‘tish', ru: 'Перейти в каталог', en: 'Browse catalog' },

  // ── auth ──────────────────────────────────────────────────────
  'auth.email': { uz: 'Email', ru: 'Email', en: 'Email' },
  'auth.password': { uz: 'Parol', ru: 'Пароль', en: 'Password' },
  'auth.confirmPassword': { uz: 'Parolni tasdiqlang', ru: 'Подтвердите пароль', en: 'Confirm password' },
  'auth.phone': { uz: 'Telefon', ru: 'Телефон', en: 'Phone' },
  'auth.name': { uz: 'Ism', ru: 'Имя', en: 'Name' },
  'auth.signin': { uz: 'Kirish', ru: 'Войти', en: 'Sign in' },
  'auth.signup': { uz: 'Ro‘yxatdan o‘tish', ru: 'Регистрация', en: 'Create account' },
  'auth.forgot': { uz: 'Parolni unutdingizmi?', ru: 'Забыли пароль?', en: 'Forgot password?' },
  'auth.continueGoogle': { uz: 'Google bilan davom etish', ru: 'Войти через Google', en: 'Continue with Google' },
  'auth.or': { uz: 'yoki', ru: 'или', en: 'or' },
  'auth.passwordMismatch': { uz: 'Parollar mos kelmadi', ru: 'Пароли не совпадают', en: 'Passwords do not match' },
  'auth.resetTitle': { uz: 'Parolni tiklash', ru: 'Сброс пароля', en: 'Reset password' },
  'auth.resetSubtitle': { uz: 'Emailingizga yuborilgan kodni kiriting.', ru: 'Введите код из письма.', en: 'Enter the code we emailed you.' },
  'auth.code': { uz: 'Tasdiqlash kodi', ru: 'Код подтверждения', en: 'Verification code' },
  'auth.newPassword': { uz: 'Yangi parol', ru: 'Новый пароль', en: 'New password' },
  'auth.sendCode': { uz: 'Kod yuborish', ru: 'Отправить код', en: 'Send code' },
  'auth.resetDone': { uz: 'Parol yangilandi.', ru: 'Пароль обновлён.', en: 'Password updated.' },
  'auth.welcomeBack': { uz: 'Xush kelibsiz', ru: 'С возвращением', en: 'Welcome back' },
  'auth.signinToContinue': { uz: 'Davom etish uchun kiring', ru: 'Войдите, чтобы продолжить', en: 'Sign in to continue' },
  'auth.createTitle': { uz: 'Hisob yarating', ru: 'Создайте аккаунт', en: 'Create your account' },
  'auth.createSubtitle': { uz: 'Bir necha soniyada xaridni boshlang', ru: 'Начните покупки за секунды', en: 'Start shopping in seconds' },
  'auth.newHere': { uz: 'Bu yerda yangimisiz?', ru: 'Впервые здесь?', en: 'New here?' },
  'auth.haveAccount': { uz: 'Hisobingiz bormi?', ru: 'Уже есть аккаунт?', en: 'Already have an account?' },
  'auth.resetYourPassword': { uz: 'Parolingizni tiklang', ru: 'Сбросьте пароль', en: 'Reset your password' },
  'auth.resetEmailHint': { uz: 'Sizga tasdiqlash kodini emailga yuboramiz.', ru: 'Мы отправим код подтверждения на email.', en: 'We’ll email you a verification code.' },
  'auth.backToSignin': { uz: '← Kirishga qaytish', ru: '← Назад ко входу', en: '← Back to sign in' },

  // ── profile ───────────────────────────────────────────────────
  'profile.title': { uz: 'Profil', ru: 'Профиль', en: 'Profile' },
  'profile.save': { uz: 'Saqlash', ru: 'Сохранить', en: 'Save changes' },
  'profile.saved': { uz: 'Saqlandi', ru: 'Сохранено', en: 'Saved' },
  'profile.changePassword': { uz: 'Parolni o‘zgartirish', ru: 'Сменить пароль', en: 'Change password' },
  'profile.currentPassword': { uz: 'Joriy parol', ru: 'Текущий пароль', en: 'Current password' },
  'profile.dangerZone': { uz: 'Xavfli hudud', ru: 'Опасная зона', en: 'Danger zone' },
  'profile.deleteAccount': { uz: 'Hisobni o‘chirish', ru: 'Удалить аккаунт', en: 'Delete account' },
  'profile.deleteConfirm': { uz: 'Hisobingizni o‘chirishni tasdiqlaysizmi?', ru: 'Точно удалить аккаунт?', en: 'Permanently delete your account?' },
  'profile.phoneRequired': { uz: 'Buyurtma uchun telefon raqamingizni kiriting.', ru: 'Укажите телефон для оформления заказа.', en: 'Add your phone number to place orders.' },
  'profile.addresses': { uz: 'Manzillar', ru: 'Адреса', en: 'Addresses' },
  'profile.addAddress': { uz: "Manzil qo'shish", ru: 'Добавить адрес', en: 'Add address' },
  'profile.noAddresses': { uz: "Saqlangan manzillar yo'q.", ru: 'Нет сохранённых адресов.', en: 'No saved addresses.' },
  'profile.default': { uz: 'Asosiy', ru: 'Основной', en: 'Default' },
  'profile.notes': { uz: 'Izoh (ixtiyoriy)', ru: 'Примечание (необязательно)', en: 'Notes (optional)' },
  'profile.pinOnMap': { uz: 'Xaritada belgilash', ru: 'Отметить на карте', en: 'Pin on map' },
  'profile.hideMap': { uz: 'Xaritani yashirish', ru: 'Скрыть карту', en: 'Hide map' },
  'profile.viewOnMap': { uz: "Xaritada ko'rish", ru: 'Посмотреть на карте', en: 'View on map' },

  // ── cart / checkout ───────────────────────────────────────────
  'cart.title': { uz: 'Savatingiz', ru: 'Ваша корзина', en: 'Your cart' },
  'cart.empty': { uz: 'Savat bo’sh.', ru: 'Корзина пуста.', en: 'Your cart is empty.' },
  'cart.emptyHint': { uz: 'Xarid qilish uchun katalogga o’ting.', ru: 'Перейдите в каталог чтобы начать.', en: 'Visit the catalog to start shopping.' },
  'cart.browse': { uz: 'Katalogga o’tish', ru: 'Перейти в каталог', en: 'Browse catalog' },
  'cart.continueShopping': { uz: 'Xaridni davom etirish', ru: 'Продолжить покупки', en: 'Continue shopping' },
  'cart.subtotal': { uz: 'Oraliq summa', ru: 'Подытог', en: 'Subtotal' },
  'cart.checkout': { uz: 'Rasmiylashtirish', ru: 'Оформить', en: 'Checkout' },
  'checkout.title': { uz: 'Rasmiylashtirish', ru: 'Оформление заказа', en: 'Checkout' },
  'checkout.summary': { uz: 'Buyurtma tafsiloti', ru: 'Ваш заказ', en: 'Order summary' },
  'checkout.delivery': { uz: 'Yetkazib berish manzili', ru: 'Адрес доставки', en: 'Delivery address' },
  'checkout.payment': { uz: 'To‘lov usuli', ru: 'Способ оплаты', en: 'Payment method' },
  'checkout.placeOrder': { uz: 'Buyurtma berish', ru: 'Оформить заказ', en: 'Place order' },
  'checkout.total': { uz: 'Jami', ru: 'Итого', en: 'Total' },
  'checkout.useSaved': { uz: 'Saqlangan manzildan foydalanish', ru: 'Использовать сохранённый адрес', en: 'Use saved address' },
  'checkout.enterNew': { uz: 'Yangi manzil kiritish', ru: 'Ввести новый адрес', en: 'Enter new address' },
  'checkout.street': { uz: 'Ko‘cha manzili *', ru: 'Адрес *', en: 'Street address *' },
  'checkout.city': { uz: 'Shahar *', ru: 'Город *', en: 'City *' },
  'checkout.region': { uz: 'Viloyat', ru: 'Регион', en: 'Region' },
  'checkout.addressLabel': { uz: 'Manzil nomi (masalan: Uy)', ru: 'Название адреса (напр. Дом)', en: 'Address label (e.g. Home)' },
  'checkout.saveAddress': { uz: 'Bu manzilni profilga saqlash', ru: 'Сохранить адрес в профиле', en: 'Save this address to my profile' },
  'checkout.contact': { uz: 'Aloqa raqami', ru: 'Контактный телефон', en: 'Contact number' },
  'checkout.phonePlaceholder': { uz: '+998901234567', ru: '+998901234567', en: '+998901234567' },
  'checkout.phoneHint': { uz: 'Yetkazib berish bo‘yicha shu raqamga qo‘ng‘iroq qilamiz.', ru: 'Позвоним на этот номер по поводу доставки.', en: 'We’ll call this number about your delivery.' },
  'checkout.phoneRequired': { uz: 'Buyurtma uchun telefon raqami kerak.', ru: 'Для заказа нужен номер телефона.', en: 'A phone number is required to order.' },

  // ── orders ────────────────────────────────────────────────────
  'orders.title': { uz: 'Buyurtmalarim', ru: 'Мои заказы', en: 'My orders' },
  'orders.empty': { uz: "Buyurtmalar yo'q.", ru: 'Заказов ещё нет.', en: 'No orders yet.' },
  'orders.startShopping': { uz: 'Xarid qilishni boshlash', ru: 'Начать покупки', en: 'Start shopping' },
  'orders.items': { uz: '{n} ta mahsulot', ru: '{n} товар(а)', en: '{n} item(s)' },
  'order.title': { uz: 'Buyurtma', ru: 'Заказ', en: 'Order' },
  'order.back': { uz: '← Buyurtmalarim', ru: '← Мои заказы', en: '← My orders' },
  'order.status': { uz: 'Holat', ru: 'Статус', en: 'Status' },
  'order.delivery': { uz: 'Yetkazib berish', ru: 'Доставка', en: 'Delivery' },
  'order.payment': { uz: "To'lov", ru: 'Оплата', en: 'Payment' },
  'order.items': { uz: 'Buyurtma tarkibi', ru: 'Состав заказа', en: 'Order items' },
  'order.cancel': { uz: 'Bekor qilish', ru: 'Отменить', en: 'Cancel order' },
  'order.cancelConfirm': { uz: 'Buyurtmani bekor qilasizmi?', ru: 'Отменить заказ?', en: 'Cancel this order?' },
  'order.cancelled': { uz: 'Bekor qilindi', ru: 'Отменён', en: 'Cancelled' },
  'order.placed': { uz: 'Buyurtma sanasi', ru: 'Дата заказа', en: 'Placed on' },
  'order.total': { uz: 'Jami', ru: 'Итого', en: 'Total' },

  // ── footer ────────────────────────────────────────────────────
  'footer.tagline': { uz: 'Toshkentdagi premium texnika do‘koni.', ru: 'Премиальный магазин техники в Ташкенте.', en: 'Tashkent’s premium tech flagship.' },
  'footer.shop': { uz: 'Do‘kon', ru: 'Магазин', en: 'Shop' },
  'footer.company': { uz: 'Kompaniya', ru: 'Компания', en: 'Company' },
  'footer.support': { uz: 'Yordam', ru: 'Поддержка', en: 'Support' },
  'footer.account': { uz: 'Hisob', ru: 'Аккаунт', en: 'Account' },
  'footer.newDevices': { uz: 'Yangi qurilmalar', ru: 'Новые устройства', en: 'New devices' },
  'footer.certifiedUsed': { uz: 'Sertifikatlangan b/u', ru: 'Сертифицированные б/у', en: 'Certified used' },
  'footer.allProducts': { uz: 'Barcha mahsulotlar', ru: 'Все товары', en: 'All products' },
  'footer.myOrders': { uz: 'Buyurtmalarim', ru: 'Мои заказы', en: 'My orders' },
  'footer.about': { uz: 'Biz haqimizda', ru: 'О нас', en: 'About' },
  'footer.warranty': { uz: 'Kafolat', ru: 'Гарантия', en: 'Warranty' },
  'footer.contact': { uz: 'Aloqa', ru: 'Контакты', en: 'Contact' },
  'footer.rights': { uz: 'Barcha huquqlar himoyalangan.', ru: 'Все права защищены.', en: 'All rights reserved.' },

  // ── common ────────────────────────────────────────────────────
  'common.loading': { uz: 'Yuklanmoqda…', ru: 'Загрузка…', en: 'Loading…' },
  'common.error': { uz: 'Xatolik yuz berdi.', ru: 'Произошла ошибка.', en: 'Something went wrong.' },
  'common.cancel': { uz: 'Bekor qilish', ru: 'Отмена', en: 'Cancel' },
  'common.save': { uz: 'Saqlash', ru: 'Сохранить', en: 'Save' },
  'common.delete': { uz: "O'chirish", ru: 'Удалить', en: 'Delete' },
  'common.edit': { uz: 'Tahrirlash', ru: 'Редактировать', en: 'Edit' },
  'common.close': { uz: 'Yopish', ru: 'Закрыть', en: 'Close' },
  'common.confirm': { uz: 'Tasdiqlash', ru: 'Подтвердить', en: 'Confirm' },
  'common.items': { uz: '{n} ta mahsulot', ru: '{n} товар(ов)', en: '{n} items' },
  'common.inStock': { uz: 'Mavjud', ru: 'В наличии', en: 'In stock' },
  'common.soldOut': { uz: 'Tugagan', ru: 'Нет в наличии', en: 'Sold out' },
} satisfies Record<string, Record<Locale, string>>;

export type TKey = keyof typeof DICT;

export function translate(locale: Locale, key: TKey, vars?: Record<string, string | number>): string {
  let str = (DICT[key]?.[locale] ?? DICT[key]?.en ?? key) as string;
  if (vars) for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, String(v));
  return str;
}

/** Pick the localized field of a product-like object (titleUz/titleRu/titleEn …). */
export function localized<T extends string>(
  obj: Record<`${T}Uz` | `${T}Ru` | `${T}En`, string | null> | null | undefined,
  base: T,
  locale: Locale,
): string {
  if (!obj) return '';
  const key = `${base}${locale === 'uz' ? 'Uz' : locale === 'ru' ? 'Ru' : 'En'}` as keyof typeof obj;
  return (obj[key] as string | null) ?? (obj[`${base}En` as keyof typeof obj] as string | null) ?? '';
}
