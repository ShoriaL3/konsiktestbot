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
        // Показываем сообщение только на странице корзины
        if (state.currentPage === 'cart') {
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');
        }
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (clearBtn) clearBtn.disabled = true;
        if (totalPriceElement) totalPriceElement.textContent = '0 ₽';
        
        // Если корзина пуста, скрываем итоговую панель
        document.querySelector('.cart-footer')?.classList.add('hidden');
        return;
    }
    
    emptyMessage.classList.add('hidden');
    document.querySelector('.cart-footer')?.classList.remove('hidden');
    
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
                    <p>Баланс: <strong>${state.balance.toLocaleString()} ₽</strong></p>
                    <p style="font-size: 18px; color: #2196F3; font-weight: bold;">
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