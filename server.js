const express = require('express');
const bodyParser = require('body-parser');
const TronWeb = require('tronweb');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE,
  privateKey: process.env.TRON_PRIVATE_KEY,
});

// Хранилище пользователей (в продакшне лучше использовать базу данных)
let users = {};

// Эндпоинт для создания кошелька
app.post('/create-wallet', (req, res) => {
  const { user_id } = req.body;

  // Генерация нового кошелька
  const newAccount = tronWeb.createAccount();

  newAccount.then(account => {
    const { address, privateKey } = account;

    // Сохраняем адрес и приватный ключ в users
    users[user_id] = { address, privateKey };

    res.json({ address, privateKey });
  }).catch(err => {
    res.status(500).json({ error: 'Failed to create wallet' });
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});