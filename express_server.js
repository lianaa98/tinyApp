const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
    users: users,
    user_id: req.cookies.user_id
  };
  console.log(users);
  res.render("urls_index", templateVars);
});

// GET: new url page
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {   // if not logged in, go to login page
    res.redirect("/login");
  }

  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_new", templateVars);
});

// POST: new url page
app.post("/urls", (req, res) => {
  if(!req.cookies.user_id) {
    return res.send("Please login to edit your url page.");
  }
  const userInput = req.body.longURL;
  const tinyURL = generateRandomString();
  urlDatabase[tinyURL] = userInput;
  res.redirect(`/urls/${tinyURL}`);
});

// GET: one url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user_id: req.cookies.user_id,
    users: users
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
    user_id: req.cookies.user_id,
    users: users
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

app.get("/login", (req, res) => {

  if (req.cookies.user_id) {    // if logged in, redirect
    res.redirect("/urls");
  }

  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    users: users
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    users: users
  };
  const userInputEmail = req.body.email;
  const userInputPassword = req.body.password;
  console.log(userInputEmail, userInputPassword);

  for (const user in users) {
    const email = users[user].email;
    const password = users[user].password;
    if (email === userInputEmail) {
      if (password !== userInputPassword) {
        res.statusCode = 403;
        res.render("login-fail", templateVars);
      }
      res.cookie("user_id", users[user].id);
      res.redirect("/urls");
    }
  }
  res.statusCode = 403;
  res.render("login-fail", templateVars);

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {    // if logged in, redirect
    res.redirect("/urls");
  }

  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    users: users
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id,
  };

  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (userEmail === '' || userPassword === '') {
    res.statusCode = 400;
    res.render("register-fail-empty", templateVars);
  };

  for (const user in users) {
    if (userEmail === users[user].email) {
      res.statusCode = 400;
      res.render("register-fail-duplicate", templateVars);
    }
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword
  };
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});