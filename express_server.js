/**
 * W03 - TinyApp Project
 * - Allows user to submit a URL, after which a shortened URL is generated
 * - Allows users to register an email and password for logging in
 * - Shortened URLs are only visible to the user who created them, but usable by anyone with the link
 * - Shortened URLs can only be deleted or edited by the person who created them
 * - Passwords are secure through hashing
 * - Cookies are encrypted
 * - Application supports mobile use (resizes to fit narrower screens)
 */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.use(methodOverride('_method'))


// Object to contain shortened URLs with associated long URL and user ID
const urlDatabase = {
};

// Object to contain user IDs and their associated ID (redundancy), email, and hashed password
const users = {
};

// Helper functions
const {
  generateRandomString,
  emailExists,
  getUserByEmail,
  urlsForUser,
  urlExists,
  userOwnsURL,
  timeStamp
} = require('./helpers');

// Index that redirects
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Render the main page of URLs
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user_id: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Render page for creating a new shortURL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user_id: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

// Redirect to shortURL page upon clicking Edit button from main URLs page
app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
 
// Render page for the shortURL
app.get("/urls/:shortURL", (req, res) => {
  if (!urlExists(req.params.shortURL, urlDatabase)) {
    res.status(418).send('<h2>418 - I\'m a teapot. The URL does not exist.</h2>');
  } else if (!req.session.user_id) {
    res.status(403).send('<h2>403 - Access is forbidden</h2>');
  } else if (!userOwnsURL(req.session.user_id, req.params.shortURL, urlDatabase)) {
    res.status(403).send('<h2>403 - Forbidden - You do not own this short URL</h2>');
  } else {
    const url = urlDatabase[req.params.shortURL];
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: url.longURL,
      user_id: users[req.session.user_id],
      visits: url.visits,
      uniqueVisits: (url.uniqueVisits || []).length,
      visitData: url.visitData,
    };
    res.render("urls_show", templateVars);
  }
});

// Redirect to actual webpage upon clicking on shortURL
app.get("/u/:shortURL", (req, res) => {
  const clickedURL = urlDatabase[req.params.shortURL];
  if (!clickedURL) {
    res.status(400).send('<h2>400 - URL does not exist</h2>');
  } else {
    // Add total amount of clicks for link
    clickedURL.visits = clickedURL.visits + 1 || 1;

    // Add all unique visitors who click link
    if (req.session.user_id) {
      if (!clickedURL.uniqueVisits) clickedURL.uniqueVisits = [];
      if (!clickedURL.uniqueVisits.includes(req.session.user_id)) {
        clickedURL.uniqueVisits.push(req.session.user_id);
      }
    }

    // Add time and unique visitor ID for each click
    clickedURL.visitData = clickedURL.visitData || {};
    (clickedURL.visitData.timestamp = clickedURL.visitData.timestamp || [])
      .push(timeStamp(new Date()));
    (clickedURL.visitData.visitorID = clickedURL.visitData.visitorID || [])
      .push(generateRandomString());

    const longURL = clickedURL.longURL;
    res.redirect(longURL);
  }
});

// Render the registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

// Render the login page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

// Create a new shortURL for a longURL
app.post("/urls", (req, res) => {
  if (!req.body.longURL) {
    res.status(418).send('<h2>418 - I\'m a teapot. The URL field was left empty.</h2>');
  } else {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${newShortURL}`);
  }
});

// Delete existing shortURL: longURL
app.delete("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send('<h2>403 - Access is forbidden</h2>');
  }
});

// Edit existing shortURL
app.put("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(403).send('<h2>403 - Access is forbidden and the URL does not exist anyway</h2>');
  } else if (!req.body.longURL) {
    res.status(418).send('<h2>418 - I\'m a teapot. The URL field was left empty.</h2>');
  } else if (req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send('<h2>403 - Access is forbidden</h2>');
  }
});

/**
 * Logs in the user if the email exists and the password matches
 * Sends a response code of 403 if email does not exist
 * Sends a response code of 403 if email exists and password does not match
 */
app.post("/login", (req, res) => {
  const userID = getUserByEmail(req.body.email, users);
  if (!req.body.email || !req.body.password) {
    res.status(400).send('<h2>400 - Email or password left empty</h2>');
  } else if (!emailExists(req.body.email, users)) {
    res.status(403).send('<h2>403 - Email does not exist</h2>');
  } else if (!bcrypt.compareSync(req.body.password, users[userID].password)) {
    res.status(403).send('<h2>403 - Password does not match</h2>');
  } else {
    req.session.user_id = userID;

    res.redirect("/urls");
  }
});

// Log out the user
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

/**
 * Creates new user in the users object
 * Sends a response code of 400 if either field is left empty
 * Sends a response code of 400 if email is already taken
 */
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('<h2>400 - Email or password left empty</h2>');
  } else if (emailExists(req.body.email, users)) {
    res.status(400).send('<h2>400 - Email is taken</h2>');
  } else {
    const newID = generateRandomString();
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newID;
    res.redirect("urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
