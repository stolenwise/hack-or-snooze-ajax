"use strict";

// Declare currentUser with `let` so it can be updated during login/signup
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  try {
    // User.login retrieves user info from API and returns User instance
    currentUser = await User.login(username, password);
    $loginForm.trigger("reset");
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch (error) {
    console.error("Login failed:", error);
  }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  try {
    // Attempt to signup the user
    currentUser = await User.signup(username, password, name);
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
    $signupForm.trigger("reset");
  } catch (error) {
    console.error("Signup failed:", error);
    // Check if the error is because the username already exists
    if (error.response && error.response.status === 409) {
      alert("This username is already taken. Please choose another one.");
    } else {
      alert("An error occurred. Please try again later.");
    }
  }
}


$signupForm.on("submit", signup);

/** Handle click of logout button
 * Remove their credentials from localStorage and refresh page
 */
function handleLogout() {
  currentUser = null;  // Clear the current user
  displayUserStatus(null);  // Update the UI
  localStorage.removeItem("token");
  localStorage.removeItem("username");  // Remove credentials
  location.reload();  // Refresh the page
}

$("#logout").on("click", handleLogout);


/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  try {
    // try to log in with these credentials (will be null if login failed)
    currentUser = await User.loginViaStoredCredentials(token, username);
  } catch (error) {
    console.error("Error with stored credentials:", error);
  }
}

/** Sync current user information to localStorage.
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  $allStoriesList.show();
  updateNavOnLogin();
}
