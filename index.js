// Function to update status display
function updateStatus(message, isError = false) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.style.color = isError ? 'red' : 'green';
}

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
    updateStatus(`Error: ${error.message}`, true);
    return null;
  }
}

// Function to delay execution for a random duration between 1-9 minutes
async function randomDelay() {
  const minDelay = 1;
  const maxDelay = 9;
  const delayMinutes = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  const delayMs = delayMinutes * 60 * 1000;
  updateStatus(`Waiting for ${delayMinutes} minutes before proceeding...`);
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

// Main execution flow with random delay
async function main() {
  try {
    await randomDelay();
    
    const loginUrl = window.env.LOGIN_URL;
    const loginData = {
      "email": window.env.LOGIN_EMAIL,
      "password": window.env.LOGIN_PASSWORD,
      "device_type": window.env.DEVICE_TYPE
    };
    
    updateStatus('Logging in...');
    const loginResponse = await performPostRequest(loginUrl, loginData, {"Content-Type": "application/json"});
    if (loginResponse && loginResponse.access) {
      const token = loginResponse.access;
      updateStatus('Login successful, proceeding with clock-in...');

      const actionUrl = `${window.env.ACTION_URL}?company_uuid=${window.env.COMPANY_UUID}`;
      const actionData = {
        latitude: Number(window.env.LATITUDE),
        longitude: Number(window.env.LONGITUDE)
      };
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const actionResponse = await performPostRequest(actionUrl, actionData, headers);
      if (actionResponse) {
        updateStatus('Clock-in successful!');
      }
    } else {
      updateStatus('Login failed: Token not found in response.', true);
    }
  } catch (error) {
    updateStatus(`Error: ${error.message}`, true);
  }
}

// Initialize environment variables from window.env
window.env = {
  LOGIN_URL: process.env.NEXT_PUBLIC_LOGIN_URL || '',
  LOGIN_EMAIL: process.env.NEXT_PUBLIC_LOGIN_EMAIL || '',
  LOGIN_PASSWORD: process.env.NEXT_PUBLIC_LOGIN_PASSWORD || '',
  DEVICE_TYPE: process.env.NEXT_PUBLIC_DEVICE_TYPE || '',
  ACTION_URL: process.env.NEXT_PUBLIC_ACTION_URL || '',
  COMPANY_UUID: process.env.NEXT_PUBLIC_COMPANY_UUID || '',
  LATITUDE: process.env.NEXT_PUBLIC_LATITUDE || '0',
  LONGITUDE: process.env.NEXT_PUBLIC_LONGITUDE || '0'
};

// Start the main process
main().catch(error => updateStatus(`Unexpected error: ${error.message}`, true));
