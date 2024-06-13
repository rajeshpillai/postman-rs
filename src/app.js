// app.js

const requestForm = document.getElementById('request-form');
const urlInput = document.getElementById('url');
const methodSelect = document.getElementById('method');
const headersTextArea = document.getElementById('headers');
const requestBodyTextArea = document.getElementById('request-body');
const responseTextArea = document.getElementById('response');

requestForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = urlInput.value;
  const method = methodSelect.value;

  let headers = {};
  try {
    headers = JSON.parse(headersTextArea.value || '{}');
  } catch (e) {
    responseTextArea.value = 'Invalid JSON in headers';
    console.error('Invalid JSON in headers:', headersTextArea.value);
    return;
  }

  const requestBody = requestBodyTextArea.value;

  console.log('URL:', url);
  console.log('Method:', method);
  console.log('Headers:', headers);
  console.log('Request Body:', requestBody);

  try {
    const response = await window.__TAURI__.invoke('perform_fetch', {
      request: {
        url,
        method,
        headers,
        body: method !== 'GET' && method !== 'HEAD' ? requestBody : null
      }
    });

    const formattedResponse = `
Status: ${response.status}
Headers: ${JSON.stringify(response.headers, null, 2)}
Body: ${response.body}
`;
    responseTextArea.value = formattedResponse;
  } catch (error) {
    responseTextArea.value = `Error: ${error}`;
    console.error('Fetch error:', error);
  }
});
