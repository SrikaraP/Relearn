const https = require('https');

const apiKey = 'AQ.Ab8RN6IMk2v3fCui3urJkY87poz0Uk67Dm0fCkzhdzQ3WDFS0A';

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET',
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("AVAILABLE MODELS:");
        json.models.forEach(m => {
          console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
        });
      } else {
        console.log("Response:", data);
      }
    } catch (e) {
      console.log("Error parsing:", e);
      console.log("Raw Response:", data);
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
