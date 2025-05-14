const express = require('express');
const { Pool } = require('pg'); // Використовуємо PostgreSQL
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Підключення до PostgreSQL через Pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // для Render обов'язково
  }
});

// Перевірка підключення
pool.connect()
  .then(() => console.log('✅ Підключено до PostgreSQL'))
  .catch(err => console.error('❌ Помилка підключення до PostgreSQL:', err));

// Додавання нового замовлення
app.post('/api/orders', async (req, res) => {
  const { name, email, phone, address, order_items, total_price } = req.body;

  const sql = `
    INSERT INTO orders (name, email, phone, address, order_items, total_price)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [name, email, phone, address, JSON.stringify(order_items), total_price];

  try {
    await pool.query(sql, values);
    res.status(200).json({ message: 'Замовлення успішно збережено' });
  } catch (err) {
    console.error('Помилка при збереженні замовлення:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Отримання замовлень
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Помилка при отриманні замовлень:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Оновлення статусу замовлення
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    res.status(200).json({ message: 'Статус оновлено' });
  } catch (err) {
    console.error('Помилка при оновленні статусу:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Видалення замовлення
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    res.status(200).json({ message: 'Замовлення видалено' });
  } catch (err) {
    console.error('Помилка при видаленні замовлення:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});
