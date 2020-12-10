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

module.exports = { emailExists, getUserByEmail, urlsForUser };