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
  // Function to delay execution for a random duration between 1-9 minutes
  async function randomDelay() {
    const minDelay = 1;
    const maxDelay = 9;
    const delayMinutes = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    const delayMs = delayMinutes * 60 * 1000;
    console.log(`Waiting for ${delayMinutes} minutes before proceeding...`);
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  // Main execution flow with random delay
  async function main() {
    await randomDelay();
    
    const loginUrl = process.env.LOGIN_URL;
    const loginData = {
      "email": process.env.LOGIN_EMAIL,
      "password": process.env.LOGIN_PASSWORD,
      "device_type": process.env.DEVICE_TYPE
    };
    
    const loginResponse = await performPostRequest(loginUrl, loginData, {"Content-Type": "application/json"});
    if (loginResponse && loginResponse.access) {
      const token = loginResponse.access;
  
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
        console.log('Action Response:', actionResponse);
      }
    } else {
      console.error('Token not found in login response.');
    }
  }
  
  main().catch(error => console.error('Error:', error));
