const express = require('express');
const AWSXRay = require('aws-xray-sdk');
const app = express();

// Initialize AWS X-Ray
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

app.use(AWSXRay.express.openSegment('microservice2'));

app.get('/', (req, res) => {
  res.send('Hello from Microservice 2!');
});

app.use(AWSXRay.express.closeSegment());

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Microservice 2 is running on port ${port}`);
});
