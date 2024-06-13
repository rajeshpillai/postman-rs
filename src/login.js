// login.js

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const logoutButton = document.getElementById('logout-button');

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

// Initialize the login check
checkLogin();
