#!/usr/bin/yarn dev
import { createClient, print } from 'redis';

const client = createClient();

client.on('error', (err) => {
  console.log('Redis client not connected to the server:', err.toString());
});

client.on('connect', () => {
  console.log('Redis client connected to the server');

  // Ensure ALX key is removed (in case it's a string or something else)
  client.del('ALX', (err, res) => {
    if (err) {
      console.error('Error deleting existing key:', err);
      return;
    }
    console.log('Old key ALX deleted:', res);

    // Set fields in the ALX hash
    client.hset('ALX', 'Portland', 50, print);
    client.hset('ALX', 'Seattle', 80, print);
    client.hset('ALX', 'New York', 20, print);
    client.hset('ALX', 'Bogota', 20, print);
    client.hset('ALX', 'Cali', 40, print);
    client.hset('ALX', 'Paris', 2, print);

    // Retrieve and display the hash
    client.hgetall('ALX', (err, obj) => {
      if (err) {
        console.error('Error fetching hash:', err);
        return;
      }
      console.log(obj);
    });
  });
});

