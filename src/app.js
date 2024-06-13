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
    return;
  }

  const requestBody = requestBodyTextArea.value;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? requestBody : null
    });
    const contentType = response.headers.get('content-type');

    let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    responseTextArea.value = JSON.stringify(result, null, 2);
  } catch (error) {
    responseTextArea.value = `Error: ${error.message}`;
  }
});
