#!/usr/bin/yarn dev
import kue from 'kue';

// Create the Kue queue
const queue = kue.createQueue();

// Notification handler
const sendNotification = (phoneNumber, message) => {
  console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
};

// Process jobs from the queue
queue.process('push_notification_code', (job, done) => {
  const { phoneNumber, message } = job.data;
  sendNotification(phoneNumber, message);
  done();
});

