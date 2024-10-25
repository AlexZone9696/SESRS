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

// Эндпоинт для получения информации о пользователе
app.post('/user', (req, res) => {
  const { user_id, first_name, last_name, username } = req.body;
  
  // Создаем или получаем TRON-адрес пользователя
  if (!users[user_id]) {
    const address = tronWeb.address.fromPrivateKey(tronWeb.utils.crypto.generatePrivateKey());
    users[user_id] = { first_name, last_name, username, address };
  }

  res.json(users[user_id]);
});

// Эндпоинт для проверки баланса пользователя
app.get('/balance/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  const user = users[userId];

  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const balance = await tronWeb.trx.getBalance(user.address);
    res.json({ balance: tronWeb.fromSun(balance) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Эндпоинт для отправки TRX
app.post('/send', async (req, res) => {
  const { from_user_id, to_address, amount } = req.body;

  if (!users[from_user_id]) return res.status(404).json({ error: 'User not found' });

  try {
    const transaction = await tronWeb.trx.sendTransaction(
      to_address,
      tronWeb.toSun(amount),
      users[from_user_id].address
    );
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Transaction failed' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
