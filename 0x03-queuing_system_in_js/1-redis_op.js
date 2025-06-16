// 1-redis_op.js
import { createClient, print } from 'redis';

const client = createClient();

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

client.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

// Function to set a value
function setNewSchool(schoolName, value) {
  client.set(schoolName, value, print);  // redis.print = logs "Reply: OK"
}

// Function to get a value
function displaySchoolValue(schoolName) {
  client.get(schoolName, (err, reply) => {
    if (err) {
      console.error(`Error fetching value: ${err}`);
    } else {
      console.log(reply);
    }
  });
}

// Calls
displaySchoolValue('ALX');
setNewSchool('ALXSanFrancisco', '100');
displaySchoolValue('ALXSanFrancisco');

