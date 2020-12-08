# Routes

* Method = GET
  * app.get("/urls")          => Renders URLs page
  * app.get("/urls/new")      => Renders "create new shortURL" page
  * app.get("/urls/:shortURL) => Renders page of shortURL
  * app.get("/u/:shortURL)    => Redirects clicks on a shortURL to longURL webpage
* Method = POST
  * app.post("urls")          => Create new shortURL
  * app.post("urls/:shortURL/delete)  => Delete shortURL

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