// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#2196F3');
tg.setBackgroundColor('#f8f8f8');

// Состояние приложения
let state = {
    cart: [],
    balance: 500,
    currentPage: 'main',
    selectedCategory: 'Все товары'
};

// Данные товаров
const products = [
    { id: 1, name: "📱 Смартфон Xiaomi", price: 19900, category: "Электроника", desc: "Современный смартфон с хорошей камерой" },
    { id: 2, name: "🎧 Беспроводные наушники", price: 3200, category: "Электроника", desc: "Наушники с шумоподавлением" },
    { id: 3, name: "👕 Футболка мужская", price: 1500, category: "Одежда", desc: "Хлопковая футболка, размеры S-XXL" },
    { id: 4, name: "📚 Книга 'Программирование'", price: 1200, category: "Книги", desc: "Учебник по программированию для начинающих" },
    { id: 5, name: "🏀 Баскетбольный мяч", price: 2500, category: "Спорт", desc: "Мяч для игры в баскетбол" },
    { id: 6, name: "💄 Набор косметики", price: 2800, category: "Красота", desc: "Набор для макияжа, 10 предметов" },
    { id: 7, name: "🧸 Плюшевый медведь", price: 1800, category: "Игрушки", desc: "Большой мягкий медведь 50см" },
    { id: 8, name: "🚗 Чехол для авто", price: 3200, category: "Автотовары", desc: "Универсальный чехол на сиденье" },
    { id: 9, name: "🎨 Набор для рисования", price: 1900, category: "Хобби", desc: "24 цвета, кисти и бумага" },
    { id: 10, name: "☕ Кофемашина", price: 8900, category: "Для дома", desc: "Компактная кофемашина для дома" },
    { id: 11, name: "⌚ Умные часы", price: 4500, category: "Электроника", desc: "Фитнес-трекер с сенсорным экраном" },
    { id: 12, name: "👗 Платье вечернее", price: 5500, category: "Одежда", desc: "Элегантное платье для вечера" },
    { id: 13, name: "🎮 Игровая консоль", price: 28900, category: "Электроника", desc: "Портативная игровая консоль" },
    { id: 14, name: "🏋️ Гантели 5кг", price: 1800, category: "Спорт", desc: "Набор гантелей, регулируемый вес" },
    { id: 15, name: "🛋️ Декоративная подушка", price: 1200, category: "Для дома", desc: "Мягкая подушка для интерьера" },
    { id: 16, name: "🧴 Шампунь и бальзам", price: 900, category: "Красота", desc: "Уход за волосами, набор 2в1" }
];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    setupCategoryScrolling();
    showPage('main');
    renderProducts();
    updateCartBadge();
});

// Инициализация приложения
function initApp() {
    // Загружаем состояние из localStorage если есть
    const savedState = localStorage.getItem('shopState');
    if (savedState) {
        state = JSON.parse(savedState);
    }
    
    // Устанавливаем баланс
    document.getElementById('user-balance').textContent = state.balance;
    
    console.log('Магазин товаров загружен');
}

// Сохранение состояния
function saveState() {
    localStorage.setItem('shopState', JSON.stringify(state));
}

// Настройка горизонтальной прокрутки категорий
function setupCategoryScrolling() {
    const categories = document.querySelector('.categories');
    const scrollLeft = document.getElementById('scrollLeft');
    const scrollRight = document.getElementById('scrollRight');
    
    if (!categories || !scrollLeft || !scrollRight) return;
    
    // Прокрутка влево
    scrollLeft.addEventListener('click', () => {
        categories.scrollBy({
            left: -150,
            behavior: 'smooth'
        });
    });
    
    // Прокрутка вправо
    scrollRight.addEventListener('click', () => {
        categories.scrollBy({
            left: 150,
            behavior: 'smooth'
        });
    });
    
    // Скрываем кнопки если нечего скроллить
    const updateScrollButtons = () => {
        const scrollLeftVisible = categories.scrollLeft > 0;
        const scrollRightVisible = 
            categories.scrollLeft < categories.scrollWidth - categories.clientWidth - 1;
        
        scrollLeft.style.opacity = scrollLeftVisible ? '1' : '0.3';
        scrollLeft.style.cursor = scrollLeftVisible ? 'pointer' : 'default';
        
        scrollRight.style.opacity = scrollRightVisible ? '1' : '0.3';
        scrollRight.style.cursor = scrollRightVisible ? 'pointer' : 'default';
    };
    
    // Обновляем при скролле
    categories.addEventListener('scroll', updateScrollButtons);
    
    // Инициализируем при загрузке
    setTimeout(updateScrollButtons, 100);
    
    // Обновляем при ресайзе
    window.addEventListener('resize', updateScrollButtons);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Категории товаров
    document.querySelectorAll('.category').forEach(cat => {
        cat.addEventListener('click', () => {
            const categoryName = cat.textContent;
            selectCategory(categoryName);
            
            // Прокручиваем к активной категории
            cat.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        });
    });

    // Нижнее меню
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            showPage(page);
            
            // Обновляем активный пункт меню
            document.querySelectorAll('.menu-item').forEach(i => {
                i.classList.remove('active');
            });
            item.classList.add('active');
        });
    });

    // Обработка добавления в корзину
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
        
        if (e.target.classList.contains('cart-item-remove')) {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        }
    });

    // Кнопки корзины
    document.getElementById('checkout-btn')?.addEventListener('click', checkout);
    document.getElementById('clear-cart')?.addEventListener('click', clearCart);
    
    // Кнопка поддержки (неактивная)
    document.getElementById('support-btn')?.addEventListener('click', () => {
        showNotification('Поддержка временно не доступна');
    });
    
    // Кнопка выхода
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('shopState');
            location.reload();
        }
    });
    
    // Переключение темы
    const themeToggle = document.querySelector('input[type="checkbox"][value=""]');
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('dark-theme', e.target.checked);
            saveState();
        });
    }
}

// Выбор категории
function selectCategory(categoryName) {
    // Убираем активный класс у всех категорий
    document.querySelectorAll('.category').forEach(c => {
        c.classList.remove('active');
    });
    
    // Находим и активируем выбранную категорию
    const categories = Array.from(document.querySelectorAll('.category'));
    const selectedCat = categories.find(cat => cat.textContent === categoryName);
    if (selectedCat) {
        selectedCat.classList.add('active');
        state.selectedCategory = categoryName;
        renderProducts(categoryName);
        saveState();
    }
}

// Показать страницу
function showPage(pageName) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показываем нужную страницу
    const pageElement = document.getElementById(`${pageName}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Показываем/скрываем категории (только на главной)
    const categoriesElement = document.querySelector('.categories-wrapper');
    if (pageName === 'main') {
        categoriesElement.style.display = 'flex';
        document.querySelector('.marquee').style.display = 'block';
    } else {
        categoriesElement.style.display = 'none';
        document.querySelector('.marquee').style.display = 'none';
    }
    
    // Обновляем контент страницы
    state.currentPage = pageName;
    
    switch(pageName) {
        case 'cart':
            renderCart();
            break;
        case 'profile':
            updateProfile();
            break;
        case 'main':
            renderProducts(state.selectedCategory);
            break;
    }
    
    saveState();
}

// Рендер товаров
function renderProducts(category = 'Все товары') {
    const container = document.getElementById('products');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredProducts = category === 'Все товары' 
        ? products 
        : products.filter(p => p.category === category);
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="empty-message">Товары не найдены</div>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const inCart = state.cart.find(item => item.id === product.id);
        const quantity = inCart ? inCart.quantity : 0;
        
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image"></div>
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-desc">${product.desc}</div>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                <button class="add-to-cart" data-id="${product.id}">
                    ${quantity > 0 ? `✓ В корзине (${quantity})` : 'Добавить в корзину'}
                </button>
            </div>
        `;
        container.appendChild(productElement);
    });
}

// Добавить в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = state.cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({ 
            ...product, 
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    updateCartBadge();
    saveState();
    
    // Обновляем кнопку