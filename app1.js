const express = require('express');
const AWSXRay = require('aws-xray-sdk');
const app = express();

// Initialize AWS X-Ray
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

app.use(AWSXRay.express.openSegment('microservice1'));

app.get('/', (req, res) => {
  // Simulate a request to Microservice 2
  const http = require('http');
  const options = {
    host: 'app-b-service.local', // Replace with the actual hostname of Microservice 2
    port: 3001, // Replace with the actual port of Microservice 2
    path: '/',
    method: 'GET',
  };

  const request = http.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      res.send(`Response from Microservice 2: ${data}`);
    });
  });

  request.end();
});

app.use(AWSXRay.express.closeSegment());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Microservice 1 is running on port ${port}`);
});