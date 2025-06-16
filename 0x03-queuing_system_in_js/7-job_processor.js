#!/usr/bin/yarn dev
import kue from 'kue';

// Create Kue queue
const queue = kue.createQueue();

// Define blacklisted phone numbers
const blacklisted = ['4153518780', '4153518781'];

/**
 * Send a notification with progress tracking and blacklist check.
 * @param {string} phoneNumber
 * @param {string} message
 * @param {object} job - kue job instance
 * @param {function} done - callback to signal completion or error
 */
function sendNotification(phoneNumber, message, job, done) {
  job.progress(0, 100); // Initial progress

  // Handle blacklisted numbers
  if (blacklisted.includes(phoneNumber)) {
    return done(new Error(`Phone number ${phoneNumber} is blacklisted`));
  }

  job.progress(50, 100); // Midway progress
  console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
  done(); // Mark job as completed
}

// Process jobs with concurrency = 2
queue.process('push_notification_code_2', 2, (job, done) => {
  const { phoneNumber, message } = job.data;
  sendNotification(phoneNumber, message, job, done);
});

