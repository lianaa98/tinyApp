function getUserByEmail(listOfUsers, email) {
  for (const key in listOfUsers) {
    const user = listOfUsers[key];
    if (user.email === email) {
      return key;
    }
  }
}

function urlsForUser(id) {
  const urlPairs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlPairs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urlPairs;
}

function generateRandomString() {
  const randomStr = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += randomStr[Math.floor(Math.random() * randomStr.length)];
  }
  return result;
}

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
}