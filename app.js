// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#4CAF50');
tg.setBackgroundColor('#f8f8f8');

// Состояние приложения
let state = {
    cart: [],
    balance: 500,
    currentPage: 'main'
};

// Данные товаров
const products = [
    { id: 1, name: "🌺 Луковица Амариллиса", price: 2900, category: "Экзотика", desc: "Экзотический цветок для выращивания дома" },
    { id: 2, name: "🎁 Большой зимний сет", price: 12200, category: "Сеты", desc: "Праздничный набор из сезонных цветов" },
    { id: 3, name: "🌹 Букет розовых роз", price: 3500, category: "Ранункулюсы", desc: "Нежные розы в элегантной упаковке" },
    { id: 4, name: "🌿 Зеленая композиция", price: 2800, category: "Зелень", desc: "Свежая зелень для интерьера" },
    { id: 5, name: "🌴 Экзотический микс", price: 4500, category: "Экзотика", desc: "Микс тропических цветов" },
    { id: 6, name: "💐 Мини сет", price: 1900, category: "Сеты", desc: "Небольшой набор для подарка" },
    { id: 7, name: "🌸 Пионовидные розы", price: 3200, category: "Ранункулюсы", desc: "Пышные розы как пионы" },
    { id: 8, name: "🍃 Декоративная зелень", price: 2100, category: "Зелень", desc: "Зелень для оформления" }
];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    showPage('main');
    renderProducts();
    updateCartBadge();
});

// Инициализация приложения
function initApp() {
    // Загружаем состояние из localStorage если есть
    const savedState = localStorage.getItem('bunchState');
    if (savedState) {
        state = JSON.parse(savedState);
    }
    
    // Устанавливаем баланс
    document.getElementById('user-balance').textContent = state.balance;
    
    console.log('Приложение инициализировано');
}

// Сохранение состояния
function saveState() {
    localStorage.setItem('bunchState', JSON.stringify(state));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Категории товаров
    document.querySelectorAll('.category').forEach(cat => {
        cat.addEventListener('click', () => {
            document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
            cat.classList.add('active');
            renderProducts(cat.textContent);
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
    
    // Кнопка поддержки
    document.querySelector('.support-btn')?.addEventListener('click', () => {
        tg.openTelegramLink('https://t.me/bunch_channel');
    });
    
    // Кнопка выхода
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('bunchState');
            location.reload();
        }
    });
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
    const categoriesElement = document.getElementById('categories');
    if (pageName === 'main') {
        categoriesElement.style.display = 'flex';
    } else {
        categoriesElement.style.display = 'none';
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
            renderProducts();
            break;
    }
    
    saveState();
}

// Рендер товаров
function renderProducts(category = 'Все') {
    const container = document.getElementById('products');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredProducts = category === 'Все' 
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
        renderProducts();
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
        renderProducts();
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
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.cart.length === 0) {
        emptyMessage.classList.remove('hidden');
        checkoutBtn.disabled = true;
        clearBtn.disabled = true;
        totalPriceElement.textContent = '0 ₽';
        return;
    }
    
    emptyMessage.classList.add('hidden');
    checkoutBtn.disabled = false;
    clearBtn.disabled = false;
    
    let total = 0;
    
    state.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <div class="cart-item-quantity">${itemTotal.toLocaleString()} ₽</div>
                <button class="cart-item-remove" data-id="${item.id}">×</button>
            </div>
        `;
        container.appendChild(itemElement);
    });
    
    totalPriceElement.textContent = `${total.toLocaleString()} ₽`;
}

// Обновить профиль
function updateProfile() {
    document.getElementById('user-balance').textContent = state.balance;
}

// Очистить корзину
function clearCart() {
    if (state.cart.length === 0 || !confirm('Очистить корзину?')) return;
    
    state.cart = [];
    updateCartBadge();
    saveState();
    renderCart();
    
    if (state.currentPage === 'main') {
        renderProducts();
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
    
    const orderData = {
        type: 'order',
        cart: state.cart,
        total: total,
        balance: state.balance,
        balanceUsed: Math.min(state.balance, total),
        finalPrice: finalPrice,
        timestamp: new Date().toISOString()
    };
    
    // Отправляем данные в Telegram бота
    tg.sendData(JSON.stringify(orderData));
    
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
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
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
console.log('Bunch Mini App загружен');
console.log('Web App URL:', window.location.href);