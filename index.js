const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Function to perform a POST request and return the response
async function performPostRequest(url, postData, headers = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      const errorStatus = await response.status;
      const errorText = await response.text();
      throw new Error(`HTTP error: { status: ${errorStatus}, message: ${errorText}}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in POST request:', error);
    throw error;
  }
}

// Function to delay execution for a random duration between 1-9 minutes
async function randomDelay() {
  const minDelay = 1;
  const maxDelay = 9;
  const delayMinutes = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  const delayMs = delayMinutes * 60 * 1000;
  console.log(`Waiting for ${delayMinutes} minutes before proceeding...`);
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

// Main clock-in function
async function clockIn() {
  try {
    await randomDelay();
    
    const loginUrl = process.env.LOGIN_URL;
    const loginData = {
      "email": process.env.LOGIN_EMAIL,
      "password": process.env.LOGIN_PASSWORD,
      "device_type": process.env.DEVICE_TYPE
    };
    
    console.log('Logging in...');
    const loginResponse = await performPostRequest(loginUrl, loginData, {"Content-Type": "application/json"});
    if (loginResponse && loginResponse.access) {
      const token = loginResponse.access;
      console.log('Login successful, proceeding with clock-in...');

      const actionUrl = `${process.env.ACTION_URL}?company_uuid=${process.env.COMPANY_UUID}`;
      const actionData = {
        latitude: Number(process.env.LATITUDE),
        longitude: Number(process.env.LONGITUDE)
      };
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const actionResponse = await performPostRequest(actionUrl, actionData, headers);
      if (actionResponse) {
        console.log('Clock-in successful!');
        return { success: true, message: 'Clock-in successful!' };
      }
    } else {
      throw new Error('Login failed: Token not found in response.');
    }
  } catch (error) {
    console.error(`Error during clock-in: ${error.message}`);
    throw error;
  }
}

// Endpoint to trigger clock-in
app.get('/clock-in', async (req, res) => {
  try {
    const result = await clockIn();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get("/", (req, res) => {
  try {
    res.send({ templeHS: "Welcome to TempleHS!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});