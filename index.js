// import dotenv from 'dotenv';

// Load environment variables
// dotenv.config();

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
      console.error('Error in POST request: Text', error);
      return null;
    }
  }
  
  // Step 1: Log in to obtain the token
  const loginUrl = process.env.LOGIN_URL;
  const loginData = {
    "email": process.env.LOGIN_EMAIL,
    "password": process.env.LOGIN_PASSWORD,
    "device_type": process.env.DEVICE_TYPE
  };
  
  performPostRequest(loginUrl, loginData, {"Content-Type": "application/json"})
    .then((loginResponse) => {
      if (loginResponse && loginResponse.access) {
        const token = loginResponse.access;
  
        // Step 2: Use the token to perform an action on another endpoint
        const actionUrl = `${process.env.ACTION_URL}?company_uuid=${process.env.COMPANY_UUID}`;
        const actionData = {
          latitude: Number(process.env.LATITUDE),
          longitude: Number(process.env.LONGITUDE)
        };
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
  
        return performPostRequest(actionUrl, actionData, headers);
      } else {
        console.error('Token not found in login response.');
        return null;
      }
    })
    .then((actionResponse) => {
      if (actionResponse) {
        console.log('Action Response:', actionResponse);
      }
    });
