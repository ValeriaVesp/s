document.addEventListener("DOMContentLoaded", () => {
  const orderContainer = document.getElementById("orderContainer");
  if (!orderContainer) return;

  const API_URL = "https://s-kbf2.onrender.com/api/orders";

  fetch(API_URL)
    .then(res => res.json())
    .then(orders => {
      if (!orders.length) {
        orderContainer.innerHTML = "<p>Немає нових замовлень</p>";
        return;
      }

      orders.forEach(order => {
        let items = [];
        try {
          items = JSON.parse(order.order_items || "[]");
        } catch (err) {
          console.error("Не вдалося розпарсити позиції:", err);
        }

        const itemsHTML = items.map(item => `
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <img src="${item.imageURL || './image/default.png'}" alt="${item.name}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
            <span>${item.name} – ${item.price} грн</span>
          </div>`).join('');

        const statusClass = order.status === "Підтверджено" ? "confirmed" :
                            order.status === "Відхилено" ? "rejected" : "pending";

        const block = document.createElement("div");
        block.className = "order-box";
        block.dataset.id = order.id;
        block.innerHTML = `
          <h3>Замовлення #${order.id}</h3>
          <p><strong>Статус:</strong> <span class="status ${statusClass}">${order.status}</span></p>
          <div><strong>Позиції:</strong><br/>${itemsHTML}</div>
          <p><strong>Загальна сума:</strong> ${order.total_price} грн</p>
          <p><strong>Ім’я:</strong> ${order.name}</p>
          <p><strong>Телефон:</strong> ${order.phone}</p>
          <p><strong>Пошта:</strong> <span class="order-email">${order.email}</span></p>
          <div class="buttons">
            <button class="bt confirm">Підтвердити</button>
            <button class="bt reject">Відхилити</button>
            <button class="bt delete">Видалити</button>
          </div>`;

        orderContainer.appendChild(block);
      });

      document.querySelectorAll(".confirm").forEach(btn =>
        btn.addEventListener("click", () => updateStatus(btn, "Підтверджено")));
      document.querySelectorAll(".reject").forEach(btn =>
        btn.addEventListener("click", () => updateStatus(btn, "Відхилено")));
      document.querySelectorAll(".delete").forEach(btn =>
        btn.addEventListener("click", () => deleteOrder(btn)));
    })
    .catch(err => {
      orderContainer.innerHTML = "<p>Не вдалося завантажити замовлення</p>";
      console.error(err);
    });
});

function updateStatus(button, status) {
  const box = button.closest('.order-box');
  const id = box.dataset.id;
  const email = box.querySelector(".order-email")?.textContent?.trim();

  fetch(`https://s-kbf2.onrender.com/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
    .then(res => {
      if (!res.ok) throw new Error();

      if (status === "Підтверджено") {
        sendEmail(email, "template_rchxbac");
      } else if (status === "Відхилено") {
        sendEmail(email, "template_epwuy4a");
      }

      location.reload();
    })
    .catch(() => alert("Помилка оновлення статусу"));
}

function deleteOrder(button) {
  const box = button.closest('.order-box');
  const id = box.dataset.id;

  if (!confirm("Видалити замовлення?")) return;

  fetch(`https://s-kbf2.onrender.com/api/orders/${id}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error();
      box.remove();
    })
    .catch(() => alert("Помилка видалення"));
}

function sendEmail(email, templateId) {
  emailjs.send("service_i6mzuec", templateId, {
    to_email: email
  }).then(() => {
    console.log("Лист надіслано");
  }).catch(err => {
    console.error("Помилка надсилання листа:", err);
  });
}
