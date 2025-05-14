const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// 🔌 Підключення до PostgreSQL
const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // обов'язково для Render
  }
});

// ✅ Перевірка підключення до бази
db.connect()
  .then(() => console.log('✅ Підключено до PostgreSQL'))
  .catch(err => {
    console.error('❌ Не вдалося підключитись до БД:', err);
    process.exit(1);
  });

// 🔹 Головна сторінка (перевірка)
app.get('/', (req, res) => {
  res.send('Сервер працює 🚀');
});

// 🔹 Додавання нового замовлення
app.post('/api/orders', async (req, res) => {
  const { name, email, phone, address, order_items, total_price } = req.body;

  try {
    await db.query(
      'INSERT INTO orders (name, email, phone, address, order_items, total_price) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, email, phone, address, JSON.stringify(order_items), total_price]
    );
    res.status(200).json({ message: 'Замовлення успішно збережено' });
  } catch (err) {
    console.error('Помилка при збереженні замовлення:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// 🔹 Отримання всіх замовлень
app.get('/api/orders', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Помилка при отриманні замовлень:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// 🔹 Оновлення статусу
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    res.status(200).json({ message: 'Статус оновлено' });
  } catch (err) {
    console.error('Помилка при оновленні статусу:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// 🔹 Видалення замовлення
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM orders WHERE id = $1', [id]);
    res.status(200).json({ message: 'Замовлення видалено' });
  } catch (err) {
    console.error('Помилка при видаленні замовлення:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});
