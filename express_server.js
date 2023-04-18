const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


function generateRandomString() {
  const randomStr = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += randomStr[Math.floor(Math.random() * randomStr.length)];
  }
  return result;
}


// index page -> redirects
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// display all urls page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

// GET: new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

// POST: new url page
app.post("/urls", (req, res) => {
  const userInput = req.body.longURL;
  const tinyURL = generateRandomString();
  urlDatabase[tinyURL] = userInput;
  res.redirect(`/urls/${tinyURL}`);
});

// GET: one url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    username: req.cookies.username
  };
  for (let key in urlDatabase) {
    if (templateVars.id === key) {
      templateVars.longURL = urlDatabase[key];
    }
  };
  res.render("urls_show", templateVars);
});

// redirect tinyURL to longURL
app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    username: req.cookies.username,
  };
  let longURL;
  for (let key in urlDatabase) {
    if (templateVars.id === key) {
      longURL = urlDatabase[key];
      res.redirect(longURL);
      return;
    }
  };
  res.statusCode = 404;
  res.render("urls_notfound", templateVars);
});

// POST: deletes url, then redirects to index
app.post("/urls/:id/delete", (req, res) => {
  const templateVars = {
    id: req.params.id,
  };
  for (let key in urlDatabase) {
    if (templateVars.id === key) {
      delete urlDatabase[key];
    }
  }
  res.redirect("/urls");
});

// POST: update new longURL for tinyURL
app.post("/urls/:id/update", (req, res) => {
  const templateVars = {
    newURL: req.body.newURL,
    id: req.params.id,
  };

  urlDatabase[templateVars.id] = templateVars.newURL;
  res.redirect("/urls");

});

// POST: login -> creates username cookie
app.post("/login", (req, res) => {
  const templateVars = {
    username: req.body.username
  };
  res.cookie("username", templateVars.username);
  res.redirect("/urls");
});

// POST: logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// GET: render the register page
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const templateVars = {
    users: users
  };
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});