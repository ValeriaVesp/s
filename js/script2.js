let cart = [];

function addToCart(name, price, imageURL = './image/default.png', button = null) {
  cart.push({ name, price: Number(price), imageURL });
  updateCartUI();
  if (button) showInlineToast(button, `«${name}» додано`);
}

function showInlineToast(button, message) {
  const toast = document.createElement('div');
  toast.className = 'inline-toast';
  toast.textContent = message;

  toast.style.position = 'absolute';
  toast.style.top = `${button.offsetTop - 30}px`;
  toast.style.left = `${button.offsetLeft}px`;
  toast.style.backgroundColor = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '6px 12px';
  toast.style.borderRadius = '6px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '999';

  button.parentElement.style.position = 'relative';
  button.parentElement.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

function showToast(message, success = true) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.backgroundColor = success ? '#28a745' : '#dc3545';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '6px';
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function updateCartUI() {
  const cartList = document.getElementById('cartItemsList');
  const totalEl = document.getElementById('cartTotal');
  if (!cartList || !totalEl) return;

  cartList.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const li = document.createElement('li');
    li.classList.add("cart-item");
    li.innerHTML = `
      <img src="${item.imageURL}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <span>${item.name}</span>
        <span>${item.price} грн</span>
      </div>
    `;
    cartList.appendChild(li);
    total += item.price;
  });

  totalEl.textContent = `${total} грн`;
}

document.getElementById('clearCartButton')?.addEventListener('click', () => {
  cart = [];
  updateCartUI();
});

document.getElementById('checkoutButton')?.addEventListener('click', () => {
  document.getElementById('orderModal').style.display = 'flex';
});

document.getElementById('closeOrderModal')?.addEventListener('click', () => {
  document.getElementById('orderModal').style.display = 'none';
});

document.getElementById('closeThankYou')?.addEventListener('click', () => {
  document.getElementById('thankYouModal').style.display = 'none';
});

const orderForm = document.getElementById('orderForm');
if (orderForm) {
  orderForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (cart.length === 0) {
      return alert("Кошик порожній. Додайте товари перед оформленням замовлення.");
    }

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.replace(/\s+/g, '');
    const address = document.getElementById('address').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+380\d{9}$/;

    if (!emailRegex.test(email)) return alert('Введіть коректну електронну пошту.');
    if (!phoneRegex.test(phone)) return alert('Введіть телефон у форматі +380XXXXXXXXX.');

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const order = {
      name,
      email,
      phone,
      address,
      order_items: cart,
      total_price: total
    };

    // Автовизначення API для локального запуску чи Railway
    const apiUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/orders'
      : 'https://your-project-name.up.railway.app/api/orders';

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Помилка сервера: ${err}`);
        }
        return res.json();
      })
      .then(() => {
        document.getElementById('orderModal').style.display = 'none';
        document.getElementById('thankYouModal').style.display = 'flex';
        orderForm.reset();
        cart = [];
        updateCartUI();
        showToast('Замовлення успішно надіслано!');
      })
      .catch(err => {
        alert("Помилка надсилання замовлення. Спробуйте пізніше.");
        console.error(err);
        showToast('Помилка під час надсилання', false);
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
});
