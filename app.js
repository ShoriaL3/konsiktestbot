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
    { id: 12, name: "👗 Платье вечернее", price: 5500, category: "Одежда", desc: "Элегантное платье для вечера" }
];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    setupCategoryScrolling();
    setupCartScrolling();
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

// Прокрутка корзины
function setupCartScrolling() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    let isScrolling = false;
    let startX;
    let scrollLeft;
    
    cartItems.addEventListener('mousedown', (e) => {
        isScrolling = true;
        startX = e.pageX - cartItems.offsetLeft;
        scrollLeft = cartItems.scrollLeft;
    });
    
    cartItems.addEventListener('mouseleave', () => {
        isScrolling = false;
    });
    
    cartItems.addEventListener('mouseup', () => {
        isScrolling = false;
    });
    
    cartItems.addEventListener('mousemove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.pageX - cartItems.offsetLeft;
        const walk = (x - startX) * 2;
        cartItems.scrollLeft = scrollLeft - walk;
    });
    
    // Для мобильных устройств
    cartItems.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - cartItems.offsetLeft;
        scrollLeft = cartItems.scrollLeft;
    });
    
    cartItems.addEventListener('touchend', () => {
        isScrolling = false;
    });
    
    cartItems.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.touches[0].pageX - cartItems.offsetLeft;
        const walk = (x - startX) * 2;
        cartItems.scrollLeft = scrollLeft - walk;
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Категории товаров
    document.querySelectorAll('.category').forEach(cat => {
        cat.addEventListener('click', (e) => {
            e.preventDefault();
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
        item.addEventListener('click', (e) => {
            e.preventDefault();
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
        e.preventDefault();
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
    document.getElementById('checkout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        checkout();
    });
    
    document.getElementById('clear-cart')?.addEventListener('click', (e) => {
        e.preventDefault();
        clearCart();
    });
    
    // Кнопка отмены всего
    document.getElementById('cancel-order-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.cart.length > 0 && confirm('Отменить все товары в корзине?')) {
            state.cart = [];
            updateCartBadge();
            saveState();
            renderCart();
            showNotification('Все товары удалены из корзины');
        }
    });
    
    // Кнопка поддержки (неактивная)
    document.getElementById('support-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Поддержка временно не доступна');
    });
    
    // Кнопка выхода
    document.querySelector('.logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('shopState');
            location.reload();
        }
    });
    
    // Переключение темы
    const themeToggle = document.querySelector('input[type="checkbox"][value=""]');
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            e.preventDefault();
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
    console.log('Переход на страницу:', pageName);
    
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
    const marqueeElement = document.querySelector('.marquee');
    
    if (pageName === 'main') {
        categoriesElement.style.display = 'flex';
        marqueeElement.style.display = 'block';
    } else {
        categoriesElement.style.display = 'none';
        marqueeElement.style.display = 'none';
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
    
    // Обновляем кнопку на главной странице
    if (state.currentPage === 'main') {
        renderProducts(state.selectedCategory);
    }
    
    // Если мы на странице корзины, обновляем её
    if (state.currentPage === 'cart') {
        renderCart();
    }
    
    // Показываем уведомление
    showNotification(`Добавлено: ${product.name}`);
}

// Удалить из корзины
function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    
    updateCartBadge();
    saveState();
    renderCart();
    
    // Обновляем главную страницу если открыта
    if (state.currentPage === 'main') {
        renderProducts(state.selectedCategory);
    }
}

// Обновить бейдж корзины
function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (badge) {
        if (totalItems > 0) {
            badge.textContent = totalItems > 9 ? '9+' : totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Рендер корзины
function renderCart() {
    const container = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const emptyMessage = document.getElementById('cart-empty');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearBtn = document.getElementById('clear-cart');
    const cartFooter = document.querySelector('.cart-footer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.cart.length === 0) {
        // Показываем сообщение только на странице корзины
        if (state.currentPage === 'cart') {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (clearBtn) clearBtn.disabled = true;
        if (totalPriceElement) totalPriceElement.textContent = '0 ₽';
        
        // Если корзина пуста, скрываем итоговую панель
        if (cartFooter) cartFooter.classList.add('hidden');
        return;
    }
    
    emptyMessage.style.display = 'none';
    if (cartFooter) cartFooter.classList.remove('hidden');
    
    if (checkoutBtn) checkoutBtn.disabled = false;
    if (clearBtn) clearBtn.disabled = false;
    
    let total = 0;
    
    state.cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-desc">${item.desc}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <div class="cart-item-quantity">${itemTotal.toLocaleString()} ₽</div>
                <button class="cart-item-remove" data-id="${item.id}" title="Удалить">×</button>
            </div>
        `;
        container.appendChild(itemElement);
    });
    
    if (totalPriceElement) {
        totalPriceElement.textContent = `${total.toLocaleString()} ₽`;
    }
}

// Обновить профиль
function updateProfile() {
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
        balanceElement.textContent = state.balance;
    }
}

// Очистить корзину
function clearCart() {
    if (state.cart.length === 0 || !confirm('Очистить корзину?')) return;
    
    state.cart = [];
    updateCartBadge();
    saveState();
    renderCart();
    
    if (state.currentPage === 'main') {
        renderProducts(state.selectedCategory);
    }
    
    showNotification('Корзина очищена');
}

// Оформление заказа
function checkout() {
    if (state.cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalPrice = Math.max(0, total - state.balance);
    
    // Показываем диалог подтверждения с возможностью отмены
    const confirmDialog = `
        <div class="checkout-dialog" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        ">
            <div style="
                background: white;
                border-radius: 15px;
                padding: 25px;
                max-width: 400px;
                width: 100%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            ">
                <h3 style="margin: 0 0 15px 0; color: #2196F3;">Подтверждение заказа</h3>
                
                <div style="margin-bottom: 20px;">
                    <p>Товаров в корзине: <strong>${state.cart.reduce((sum, item) => sum + item.quantity, 0)} шт.</strong></p>
                    <p>Общая стоимость: <strong>${total.toLocaleString()} ₽</strong></p>
                    <p>Ваш баланс: <strong>${state.balance.toLocaleString()} ₽</strong></p>
                    <p style="font-size: 18px; color: #2196F3; font-weight: bold; margin-top: 10px;">
                        Итого к оплате: <strong>${finalPrice.toLocaleString()} ₽</strong>
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="confirm-order" style="
                        flex: 1;
                        padding: 12px;
                        background: #2196F3;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Оплатить</button>
                    
                    <button id="cancel-order" style="
                        flex: 1;
                        padding: 12px;
                        background: #f5f5f5;
                        color: #666;
                        border: none;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Отмена</button>
                </div>
            </div>
        </div>
    `;
    
    const dialogElement = document.createElement('div');
    dialogElement.innerHTML = confirmDialog;
    document.body.appendChild(dialogElement.firstChild);
    
    // Обработчики кнопок диалога
    document.getElementById('confirm-order').addEventListener('click', () => {
        processOrder(total, finalPrice);
        dialogElement.remove();
    });
    
    document.getElementById('cancel-order').addEventListener('click', () => {
        dialogElement.remove();
        showNotification('Заказ отменен');
    });
    
    // Закрытие при клике вне диалога
    dialogElement.firstChild.addEventListener('click', (e) => {
        if (e.target === dialogElement.firstChild) {
            dialogElement.remove();
            showNotification('Заказ отменен');
        }
    });
}

// Обработка заказа
function processOrder(total, finalPrice) {
    const orderData = {
        type: 'order',
        cart: state.cart,
        total: total,
        balance: state.balance,
        balanceUsed: Math.min(state.balance, total),
        finalPrice: finalPrice,
        timestamp: new Date().toISOString(),
        shop: 'Мой магазин'
    };
    
    // Отправляем данные в Telegram бота
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify(orderData));
    }
    
    // Показываем подтверждение
    showNotification(`Заказ оформлен на ${finalPrice.toLocaleString()} ₽!`, 5000);
    
    // Очищаем корзину после оформления
    state.cart = [];
    state.balance = Math.max(0, state.balance - Math.min(state.balance, total));
    updateCartBadge();
    saveState();
    renderCart();
    updateProfile();
}

// Показать уведомление
function showNotification(message, duration = 3000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #2196F3;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    // Добавляем стили анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { top: -50px; opacity: 0; }
            to { top: 20px; opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Удаляем через указанное время
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Для отладки
console.log('Магазин товаров загружен');
console.log('Web App URL:', window.location.href);
console.log('Telegram WebApp доступен:', !!tg);