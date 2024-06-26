// src/script.js

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const logoutButton = document.getElementById('logout-button');
const requestForm = document.getElementById('request-form');
const urlInput = document.getElementById('url');
const methodSelect = document.getElementById('method');
const headersTextArea = document.getElementById('headers');
const requestBodyTextArea = document.getElementById('request-body');
const responseTextArea = document.getElementById('response');

const correctUsername = 'admin';
const correctPassword = 'admin';

function checkLogin() {
  if (document.cookie.includes('loggedIn=true')) {
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
  } else {
    loginContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (username === correctUsername && password === correctPassword) {
    document.cookie = 'loggedIn=true';
    checkLogin();
  } else {
    alert('Incorrect username or password');
  }
});

logoutButton.addEventListener('click', () => {
  document.cookie = 'loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  checkLogin();
});

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

// Initialize the app
checkLogin();
