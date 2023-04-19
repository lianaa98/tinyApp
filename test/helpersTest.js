const { assert } = require('chai');
const { getUserByEmail, urlsForUser, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

console.log(getUserByEmail, urlsForUser, generateRandomString)

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user2@example.com");
    const expectedUserID = "user2RandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return undefined if email is not found', function() {
    const user = getUserByEmail(testUsers, "email@email.com");
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

describe('urlsForUser', function() {
  it('should return an object of {shortURL: longURL} when an userID is passed in', function() {
    const actual = urlsForUser("user2RandomID", urlDatabase);
    const expected = {
      i3BoGr: "https://www.google.ca"
    };
    assert.deepEqual(actual, expected);
  });
});
