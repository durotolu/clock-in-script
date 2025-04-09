import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Function to perform a POST request and return the response
interface PostResponse {
  access?: string;
  [key: string]: any;
}

interface LoginData {
  email: string;
  password: string;
  device_type: string;
}

interface ActionData {
  latitude: number;
  longitude: number;
}

interface ClockInResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function performPostRequest<T>(url: string, postData: any, headers: Record<string, string> = {}): Promise<T> {
  console.log('url', url)
  console.log('postData', postData)
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

// Main clock-in function
async function clockIn() {
  try {
    const loginUrl = process.env.LOGIN_URL as string;
    const loginData = {
      "email": process.env.LOGIN_EMAIL,
      "password": process.env.LOGIN_PASSWORD,
      "device_type": process.env.DEVICE_TYPE
    };
    
    console.log('Logging in...');
    const loginResponse = await performPostRequest<PostResponse>(loginUrl, loginData as LoginData, {"Content-Type": "application/json"});
    if (loginResponse && loginResponse.access) {
      const token = loginResponse.access;
      console.log('Login successful, proceeding with clock-in...');

      // const actionUrl = `${process.env.ACTION_URL}?company_uuid=${process.env.COMPANY_UUID}`;
      const actionUrl = `https://management.libertypayng.com/clock-app/clock-in/?company_uuid=f92f464b-b10a-46b9-bfd2-74b6956e85e5`;
      const actionData = {
        latitude: Number(process.env.LATITUDE),
        longitude: Number(process.env.LONGITUDE)
      };
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const actionResponse = await performPostRequest<any>(actionUrl, actionData as ActionData, headers);
      if (actionResponse) {
        console.log('Clock-in successful!');
        return { success: true, message: 'Clock-in successful!' };
      }
    } else {
      throw new Error('Login failed: Token not found in response.');
    }
  } catch (error) {
    console.error(`Error during clock-in: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Endpoint to trigger clock-in
app.get('/clock', async (req: Request, res: Response) => {
  console.log('here it is')
  try {
    const result = await clockIn();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get("/", (req: Request, res: Response) => {
  try {
    res.send({ clock_in: "Welcome to FaaS...!" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});