// Checks to see if given email exists in users object
const emailExists = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) return true;
  }
  return false;
};

// Returns the user's id associated with their email
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) return database[user].id;
  }
  return null;
};

// Returns an object  containing only the URL objects associated with a particular user ID
const urlsForUser = (id, database) => {
  let returnObj = {};
  for (let key in database) {
    if (database[key].userID === id) {
      returnObj[key] = database[key];
    }
  }
  return returnObj;
};

// Checks to see if the URL exists in the database
const urlExists = (url, database) => {
  if (Object.keys(database).includes(url)) return true;
  return false;
};

// Checks to see if the user created the given URL
const userOwnsURL = (id, url, database) => {
  const userURLs = urlsForUser(id, database);
  if (urlExists(url, userURLs)) return true;
  return false;
};

module.exports = { emailExists, getUserByEmail, urlsForUser, urlExists, userOwnsURL };