# Routes

* Method = GET
  * app.get("/urls")          => Renders URLs page
  * app.get("/urls/new")      => Renders "create new shortURL" page
  * app.get("/urls/:shortURL) => Renders page of shortURL
  * app.get("/u/:shortURL)    => Redirects clicks on a shortURL to longURL webpage
* Method = POST
  * app.post("urls")                  => Create new shortURL
  * app.post("urls/:shortURL/delete)  => Delete shortURL
  * app.post("/urls/:shortURL/edit")  =>
  * app.post("/urls/:id")             => 

# Templates

* Index => /urls            => List of URLs with edit and delete buttons
* New   => /urls/new        => Create a new shortURL
* Show  => /urls/:shortURL  => Show the shortURL

# Compass exercises

## URL Shortening (Part 1)

1. Let's start with a basic form page that we will use to submit URLs to be shortened.
    * Create views/urls_new.ejs
      * Has a form with action = /urls and method = POST
      * Input textbox has name = longURL
        * This attribute identifies the data we are sending; in this case, it adds the key longURL to the data we'll be sending in the body of our POST request.
2. Routes for /urls/new
    * app.get("/urls/new")
    * app.post("urls")
      * The form has an action attribute set to /urls
      * The form's method is set to POST
      * The form has one named input, with the name attribute set to longURL
      * Can use req.body.longURL to access longURL from the textbox in /urls/new
    * **^^Why isn't the action in each case /urls_new?**
3. Implement generateRandomString() in global scope

## URL Shortening (Part 2)

1. Continuation of app.post("urls")
    * Save shortURL: longURL to urlDatabase
    * Redirect to /urls/:shortURL
2. Route for /u/:shortURL - method: GET
    * Used when a user clicks on a shortURL hyperlink to redirect to actual longURL webpage
3. Code validation
    * curl -i
      > -i, --include: Include the HTTP response headers in the output. The HTTP response headers can include things like server name, cookies, date of the document, HTTP version and more...
    * curl -L
      > -L, --location: (HTTP) If the server reports that the requested page has moved to a different location (indicated with a Location: header and a 3XX response code), this option will make curl redo the request on the new place.

## Deleting URLs

1. In urls_index.ejs, add a form button (Delete) with method = POST into the table for each row
2. Route /urls/:shortURL/delete - method: POST
    * Delete key: value pair corresponding to shortURL
    * Redirect to "/urls"

## Updating URLs

1. In urls_show.ejs, add a form that submits an updated long URL
    * Submit using method: POST
    * Action: /urls/:id
2. Route for /urls/:id - method: POST
    * Assign a new longURL to the existing shortURL
    * Redirect to "/urls"
3. In urls_index.ejs, add an additional column of edit buttons (similar to the delete buttons)

## Cookies in Express

1. The Login Form
    * Create a form in _header.ejs that POSTs to /login
      * a single text input with name="username"
      * a submit button to submit the form
      * Users will type in any username into this form in order to "sign in" for now.
    * ***There is a picture example at the bottom of the page

2. The Login Route
    * Create an endpoint (route) to handle a POST to /login
    * Create a new key: value pair (username: value) in res.cookie
    * Redirect back to /urls

3. Test the Login
    * From the terminal
      * curl -X POST -i localhost:8080/login -d "username=vanillaice"
        * The -d flag is used to send form data in the same way a browser would when submitting our login form.

4. Display the Username
    * Pass in the username to all views that include the _header.ejs partial and modify the _header.ejs partial to display the passed-in username next to the form.

5. Implement Logout Client & Server logic
    * Once the user is logged in, the form should instead display the username and contain just a Log Out button:
    * _header.ejs should check to see if a username is present
      * If present, display username and a logout button which POSTs to /logout
    * Implement the /logout endpoint so that it clears the username cookie and redirects the user back to the /urls page
      * clearCookie function in express

## User Registration Form

1. Developed on the new feature/user-registration git branch
2. Create registration form with email and password fields
3. Create GET /register endpoint

## Registering New Users

1. Still on feature/user-registration git branch
2. Create a users object
3. Upon submission of data on the registration page, generate a new user ID and insert it and the user information into the users object
4. Update all views to pass the user object rather than the username
5. Pass the user object to _header and display user's email in header

## Registration Errors

1. Still on feature/user-registration git branch
2. Handle error conditions
    * Empty email or password fields  => send 400 status code
    * Email already exists            => send 400 status code

## A New Login Page

1. Still on feature/user-registration git branch
2. Create a login template and GET route
3. In _header.ejs, remove the login form and replace it with login and register buttons

## Refactoring the Login Route

1. Still on feature/user-registration git branch
2. Modify the POST /login route
    * Need to send the appropriate user_id to cookies if login attempt is successful
    * Return a 403 message if email does not exist or password is incorrect
    * Redirect to /urls
3. Merge feature/user-registration git branch into master

## Basic Permission Features

1. Only Registered Users Can Shorten URLs
    * If someone is not logged in when trying to access /urls/new, redirect them to the login page.
2. URLs Belong to Users
    * Change urlDatabase so the values are objects containing the longURL and associated userID
3. Anyone Can Visit Short URLs
    * Test your GET /u/:id routes to make sure they redirect for users, even if they aren't logged in.

## More Permission Features

1. Users Can Only See Their Own Shortened URLs
    * /urls only displays URLs if user is logged in
    * /urls/:shortURL displays message instead of edit form if not logged in
    * Create urlsForUser(id) function
2. Users Can Only Edit or Delete Their Own URLs
    * Update the edit and delete endpoints
    * Use curl "-X POST -i localhost:8080/urls/sgq3y6/delete" to test

## Storing Passwords Securely

1. Use bcrypt When Storing Passwords
    * /register
2. Use bcrypt When Checking Passwords
    * bcrypt.compareSync(inputPassword, savedHashedPassword)
    * /login

## Switching to Encrypted Cookies

1. Install cookie-session middleware
2. const app = express()
```js
  app.use(cookieSession({
    name: 'session',
    keys: [/* secret keys */],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }));
```
3. Change all instances of cookies to session
    * There is no session method to assign a session/cookie like with cookieParser, so just assign it

## Testing Helper Functions

1. Refactor Helper Functions
    * Modify your existing getUserByEmail function (or create one) to take in the user's email and users database as parameters
2. Create a Helper Functions Module
    * Put functions in here and export them
3. Mocha and Chai
    * Begin by testing getUserByEmail function