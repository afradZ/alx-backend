#!/usr/bin/yarn dev
import { createClient } from 'redis';

const subscriber = createClient();

subscriber.on('error', (err) => {
  console.log('Redis client not connected to the server:', err.toString());
});

subscriber.on('connect', () => {
  console.log('Redis client connected to the server');
  subscriber.subscribe('ALXchannel');
});

subscriber.on('message', (channel, message) => {
  console.log(message);
  if (message === 'KILL_SERVER') {
    subscriber.unsubscribe();
    subscriber.quit();
  }
});

