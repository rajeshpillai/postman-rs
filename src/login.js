// login.js

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const logoutButton = document.getElementById('logout-button');
const welcomeMessage = document.getElementById('welcome-message');

async function checkLogin() {
  try {
    const username = await window.__TAURI__.invoke('check_login');
    console.log('Check login result:', username);
    if (username) {
      loginContainer.classList.add('hidden');
      appContainer.classList.remove('hidden');
      welcomeMessage.textContent = `Welcome, ${username}`;
    } else {
      loginContainer.classList.remove('hidden');
      appContainer.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error checking login:', error);
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;

  try {
    await window.__TAURI__.invoke('login', { username, password });
    console.log('Login successful');
    checkLogin();
  } catch (error) {
    console.error('Login error:', error);
    alert('Incorrect username or password');
  }
});

logoutButton.addEventListener('click', async () => {
  try {
    await window.__TAURI__.invoke('logout');
    console.log('Logout successful');
    checkLogin();
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// Initialize the login check
checkLogin();
