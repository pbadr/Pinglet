const headers = new Headers();
headers.append('Accept-Encoding', 'gzip, deflate'); // Enable compression
headers.append('Cache-Control', 'max-age=3600'); // Cache response for 1 hour
headers.append('Connection', 'keep-alive'); // Use a persistent connection
headers.append('Accept', 'application/json, text/plain, */*');
headers.append('Language', 'en-GB,en-US;q=0.9,en;q=0.8');

const options = {
  method: 'GET',
  headers: headers,
}

export async function pingServer(serverName: string, serverLocation: string) {
  const startTime = Date.now();
  const response = await fetch(`https://${serverLocation}`, options);
  if (response.ok) {
    const endTime = Date.now();
    return {
      serverName,
      serverLocation,
      responseTime: endTime - startTime,
    }
  }
}
