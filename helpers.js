// Generate a random 6-character-long alphanumeric string
const generateRandomString = function() {
  const charStr = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let alphaNum = '';
  for (let i = 0; i < 6; i++) {
    alphaNum += charStr.charAt(Math.floor(Math.random() * charStr.length));
  }
  return alphaNum;
};

// Checks to see if given email exists in users object
const emailExists = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) return true;
  }
  return false;
};

// Returns the user's id associated with their email
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) return database[user].id;
  }
  return null;
};

// Returns an object  containing only the URL objects associated with a particular user ID
const urlsForUser = (id, database) => {
  let returnObj = {};
  for (const key in database) {
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

// Returns the current date and time in a readable format
const timeStamp = dateTime => {
  const [month, date, year]    = dateTime.toLocaleDateString("en-US").split("/");
  const [hour, minute, second] = dateTime.toLocaleTimeString("en-US").split(/:| /);
  return (`${year}-${month}-${date} ${hour}:${minute}:${second}`);
}

module.exports = { generateRandomString, emailExists, getUserByEmail, urlsForUser, urlExists, userOwnsURL, timeStamp };