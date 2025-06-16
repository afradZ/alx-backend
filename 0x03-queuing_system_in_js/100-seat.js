#!/usr/bin/yarn dev
import express from 'express';
import kue from 'kue';
import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient();
const app = express();
const port = 1245;
const queue = kue.createQueue();

let reservationEnabled = true;

// Promisified Redis get
const getAsync = promisify(client.get).bind(client);

// Set initial seat availability
function reserveSeat(number) {
  client.set('available_seats', number);
}

async function getCurrentAvailableSeats() {
  const seats = await getAsync('available_seats');
  return parseInt(seats || '0');
}

// Set initial value on server start
reserveSeat(50);

// Routes
app.get('/available_seats', async (req, res) => {
  const seats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: seats });
});

app.get('/reserve_seat', (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservation are blocked' });
  }

  const job = queue.create('reserve_seat').save((err) => {
    if (err) {
      return res.json({ status: 'Reservation failed' });
    }
    res.json({ status: 'Reservation in process' });
  });

  job.on('complete', () => {
    console.log(`Seat reservation job ${job.id} completed`);
  });

  job.on('failed', (err) => {
    console.log(`Seat reservation job ${job.id} failed: ${err.message}`);
  });
});

app.get('/process', async (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', async (job, done) => {
    let currentSeats = await getCurrentAvailableSeats();

    if (currentSeats <= 0) {
      reservationEnabled = false;
      return done(new Error('Not enough seats available'));
    }

    reserveSeat(currentSeats - 1);
    if (currentSeats - 1 === 0) {
      reservationEnabled = false;
    }

    done();
  });
});

app.listen(port, () => {
  console.log(`API available on localhost port ${port}`);
});

