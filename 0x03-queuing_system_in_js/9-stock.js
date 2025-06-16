#!/usr/bin/yarn dev
import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';

const app = express();
const port = 1245;

const client = createClient();
client.on('error', (err) => console.log('Redis client not connected to the server:', err));
client.on('connect', () => console.log('Redis client connected to the server'));

const listProducts = [
  { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
  { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
  { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
  { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 }
];

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

function getItemById(id) {
  return listProducts.find(item => item.itemId === parseInt(id));
}

async function reserveStockById(itemId, stock) {
  await setAsync(`item.${itemId}`, stock);
}

async function getCurrentReservedStockById(itemId) {
  const reserved = await getAsync(`item.${itemId}`);
  return reserved !== null ? parseInt(reserved) : null;
}

app.get('/list_products', (req, res) => {
  res.json(listProducts);
});

app.get('/list_products/:itemId', async (req, res) => {
  const item = getItemById(req.params.itemId);
  if (!item) {
    return res.json({ status: 'Product not found' });
  }

  const currentStock = await getCurrentReservedStockById(item.itemId);
  const quantity = currentStock !== null ? currentStock : item.initialAvailableQuantity;

  res.json({
    ...item,
    currentQuantity: quantity
  });
});

app.get('/reserve_product/:itemId', async (req, res) => {
  const item = getItemById(req.params.itemId);
  if (!item) {
    return res.json({ status: 'Product not found' });
  }

  const currentStock = await getCurrentReservedStockById(item.itemId);
  const available = currentStock !== null ? currentStock : item.initialAvailableQuantity;

  if (available < 1) {
    return res.json({ status: 'Not enough stock available', itemId: item.itemId });
  }

  await reserveStockById(item.itemId, available - 1);
  res.json({ status: 'Reservation confirmed', itemId: item.itemId });
});

app.listen(port, () => {
  console.log(`API available on localhost port ${port}`);
});

