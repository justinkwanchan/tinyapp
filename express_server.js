/**
 * W03 - TinyApp Project
 * - Allows user to submit a URL, after which a shortened URL is generated
 * - Allows users to register an email and password for logging in
 */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const generateRandomString = function() {
  const charStr = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let alphaNum = '';
  for (let i = 0; i < 6; i++) {
    alphaNum += charStr.charAt(Math.floor(Math.random() * charStr.length));
  }
  return alphaNum;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "a22": {
    id: "a22", 
    email: "a@t.com", 
    password: "pass"
  }
};

const emailExists = email => {
  for (let user in users) {
    if (users[user].email === email) return true;
  }
  return false;
}

const idByEmail = email => {
  for (let user in users) {
    if (users[user].email === email) return users[user].id;
  }
  return null;
}

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// Render the main page of URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

// Render page for creating a new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// Render page for the shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// Redirect to actual webpage upon clicking on shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Render the registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

// Render the login page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

// Create a new shortURL for a longURL
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

// Delete existing shortURL: longURL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Redirect to shortURL page upon clicking Edit button from main URLs page
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

// Edit existing shortURL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

/**
 * Logs in the user if the email exists and the password matches
 * Sends a response code of 403 if email does not exist
 * Sends a response code of 403 if email exists and password does not match
 */
app.post("/login", (req, res) => {
  const userID = idByEmail(req.body.email);
  if (!req.body.email || !req.body.password) {
    res.status(400).send('<h2>400 - Email or password left empty</h2>');
  } else if (!emailExists(req.body.email)) {
    res.status(403).send('<h2>403 - Email does not exist</h2>');
  } else if (users[userID].password !== req.body.password) {
    res.status(403).send('<h2>403 - Password does not match</h2>');
  } else{
    res.cookie('user_id', userID);
    res.redirect("/urls");
  }
});

// Log out the user
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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
  } else if (emailExists(req.body.email)) {
    res.status(400).send('<h2>400 - Email is taken</h2>');
  } else {
    const newID = generateRandomString();
    users[newID] = {
      id: newID, 
      email: req.body.email, 
      password: req.body.password
    };
    res.cookie('user_id', newID);
    res.redirect("urls");
  }
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});