import { expect } from 'chai';
import kue from 'kue';
import createPushNotificationsJobs from './8-job.js';

const queue = kue.createQueue();

describe('createPushNotificationsJobs', function () {
  // Enter test mode before tests
  before(function () {
    kue.Job.rangeByType = kue.Job.rangeByType || function () {};
    queue.testMode.enter();
  });

  // Exit test mode and clear jobs after all tests
  after(function () {
    queue.testMode.clear();
    queue.testMode.exit();
  });

  it('should display an error message if jobs is not an array', function () {
    expect(() => createPushNotificationsJobs('not-an-array', queue))
      .to.throw('Jobs is not an array');
  });

  it('should create two new jobs to the queue', function () {
    const jobs = [
      {
        phoneNumber: '1234567890',
        message: 'Test message 1'
      },
      {
        phoneNumber: '0987654321',
        message: 'Test message 2'
      }
    ];

    createPushNotificationsJobs(jobs, queue);
    expect(queue.testMode.jobs.length).to.equal(2);

    // Check job types and data
    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobs[0]);

    expect(queue.testMode.jobs[1].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[1].data).to.deep.equal(jobs[1]);
  });
});

