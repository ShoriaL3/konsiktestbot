// В мини-приложении добавьте этот код для отправки данных в бота

// Функция добавления товара в корзину
function addToCart(product) {
    const productData = {
        action: 'add_to_cart',
        item: {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            description: product.description
        }
    };
    
    // Отправляем данные в Telegram бот
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(productData));
        
        // Показать уведомление
        showNotification('Товар добавлен в корзину!');
    }
}

// Функция быстрого заказа
function quickOrder(product) {
    const orderData = {
        action: 'checkout',
        items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            description: product.description
        }]
    };
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(orderData));
        
        // Показать сообщение
        showNotification('Переходим к оформлению заказа...');
        
        // Закрыть мини-приложение через 2 секунды
        setTimeout(() => {
            window.Telegram.WebApp.close();
        }, 2000);
    }
}

// Кнопка просмотра корзины
function viewCart() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({
            action: 'view_cart'
        }));
        
        // Закрыть мини-приложение
        window.Telegram.WebApp.close();
    }
}

// Функция оформления заказа из корзины
function checkoutFromCart(cartItems) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({
            action: 'checkout',
            items: cartItems
        }));
        
        // Закрыть мини-приложение
        window.Telegram.WebApp.close();
    }
}

// Уведомление
function showNotification(message) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showPopup({
            title: 'Уведомление',
            message: message,
            buttons: [{ type: 'ok' }]
        });
    } else {
        alert(message);
    }
}

// Пример HTML кнопки:
/*
<button onclick="addToCart({
    id: '1',
    name: 'Название товара',
    price: 1000,
    image: 'image.jpg',
    description: 'Описание товара'
})">
    Добавить в корзину
</button>

<button onclick="quickOrder({
    id: '1',
    name: 'Название товара',
    price: 1000,
    image: 'image.jpg',
    description: 'Описание товара'
})">
    Купить сейчас
</button>

<button onclick="viewCart()">
    🛒 Корзина
</button>
*/