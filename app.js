// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Данные товаров
const products = [
    { id: 1, name: "Луковица Амариллиса", price: 2900, category: "Экзотика", image: "" },
    { id: 2, name: "Большой зимний сет", price: 12200, category: "Сеты", image: "" },
    { id: 3, name: "Букет розовых роз", price: 3500, category: "Ранункулюсы", image: "" },
    { id: 4, name: "Зеленая композиция", price: 2800, category: "Зелень", image: "" },
    { id: 5, name: "Экзотический микс", price: 4500, category: "Экзотика", image: "" },
    { id: 6, name: "Мини сет", price: 1900, category: "Сеты", image: "" }
];

// Корзина
let cart = [];
let balance = 500;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    setupEventListeners();
    updateCartCount();
});

// Рендер товаров
function renderProducts(filter = 'Все') {
    const container = document.getElementById('products');
    container.innerHTML = '';
    
    const filteredProducts = filter === 'Все' 
        ? products 
        : products.filter(p => p.category === filter);
    
    filteredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">${product.image ? '<img>' : 'Фото товара'}</div>
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-price">${product.price} ₽</div>
                <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
            </div>
        `;
        container.appendChild(productElement);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Категории
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
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Добавление в корзину
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });

    // Кнопка оформления заказа
    document.querySelector('.checkout-btn')?.addEventListener('click', checkout);
}

// Показать страницу
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelector('.products-grid').parentElement.classList.add('hidden');
    
    if (page === 'menu') {
        document.querySelector('.products-grid').parentElement.classList.remove('hidden');
    } else {
        document.getElementById(`${page}-page`).classList.remove('hidden');
        if (page === 'cart') renderCart();
        if (page === 'profile') document.getElementById('user-balance').textContent = balance;
    }
}

// Добавить в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    if (document.getElementById('cart-page').classList.contains('hidden') === false) {
        renderCart();
    }
}

// Рендер корзины
function renderCart() {
    const container = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    container.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div>${item.name}</div>
            <div>${item.quantity} × ${item.price} ₽</div>
        `;
        container.appendChild(itemElement);
        total += item.price * item.quantity;
    });
    
    totalPrice.textContent = `${total} ₽`;
}

// Обновить счетчик корзины
function updateCartCount() {
    const cartItem = document.querySelector('.menu-item[data-page="cart"]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (count > 0) {
        const existingBadge = cartItem.querySelector('.cart-badge');
        if (existingBadge) existingBadge.remove();
        
        const badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.textContent = count;
        badge.style.cssText = `
            position: absolute;
            top: 0;
            right: 20px;
            background: #ff4444;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        cartItem.style.position = 'relative';
        cartItem.appendChild(badge);
    } else {
        const badge = cartItem.querySelector('.cart-badge');
        if (badge) badge.remove();
    }
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalPrice = Math.max(0, total - balance);
    
    const orderData = {
        cart: cart,
        total: total,
        balanceUsed: Math.min(balance, total),
        finalPrice: finalPrice
    };
    
    tg.sendData(JSON.stringify(orderData));
    tg.close();
}