const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Помилка підключення до MySQL:', err);
  } else {
    console.log('Підключено до бази даних MySQL');
  }
});

// Додавання нового замовлення
app.post('/api/orders', (req, res) => {
  const { name, email, phone, address, order_items, total_price } = req.body;

  const sql = 'INSERT INTO orders (name, email, phone, address, order_items, total_price) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, email, phone, address, JSON.stringify(order_items), total_price];

  connection.query(sql, values, (err) => {
    if (err) {
      console.error('Помилка при збереженні замовлення:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    } else {
      res.status(200).json({ message: 'Замовлення успішно збережено' });
    }
  });
});

// Отримання замовлень
app.get('/api/orders', (req, res) => {
  connection.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Помилка при отриманні замовлень:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Оновлення статусу замовлення
app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      console.error('Помилка при оновленні статусу:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    } else {
      res.status(200).json({ message: 'Статус оновлено' });
    }
  });
});

// Видалення замовлення
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM orders WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Помилка при видаленні замовлення:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    } else {
      res.status(200).json({ message: 'Замовлення видалено' });
    }
  });
});

app.listen(port, () => {
  console.log(`Сервер запущено на http://localhost:${port}`);
});
