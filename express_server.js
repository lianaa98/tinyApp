const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");
const app = express();
const PORT = 8080;

const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers.js');

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: bcrypt.hashSync("1234", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: bcrypt.hashSync("5678", 10),
  },
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

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // body parser -> populates req.body
app.use(morgan("dev"));
app.use(cookieSession({
  name: "session",
  keys: ['320087'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride("_method"));

// index page -> redirects
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

// display all urls page
app.get("/urls", (req, res) => {

  if (!req.session.user_id) {
    return res.status(403).send("Please log in to see your saved URLs.");
  }

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    users: users,
    user_id: req.session.user_id
  };

  res.render("urls_index", templateVars);
});

// GET: new url page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {   // if not logged in, go to login page
    res.redirect("/login");
    return;
  }

  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  res.render("urls_new", templateVars);
});

// POST: new url page
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("Please login to edit your url page.");
  }
  const userInput = req.body.longURL;
  const tinyURL = generateRandomString();
  urlDatabase[tinyURL] = {
    longURL: userInput,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${tinyURL}`);
});

// GET: one url page
app.get("/urls/:id", (req, res) => {

  if (!req.session.user_id) {
    return res.status(403).send("Please log in to view your URL page.");
  }

  const templateVars = {
    id: req.params.id,
    user_id: req.session.user_id,
    users: users,
    urlPairs: urlsForUser(req.session.user_id, urlDatabase)
  };
  for (const url in templateVars.urlPairs) {
    if (url === templateVars.id) {
      templateVars.longURL = templateVars.urlPairs[url];
      res.render("urls_show", templateVars);
      return;
    }
  };

  if (urlDatabase.hasOwnProperty(templateVars.id)) {
    return res.status(403).send("This URL does not belong to you.");
  }
  res.statusCode = 404;
  res.send("URL does not exist.");
});

// redirect tinyURL to longURL
app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user_id: req.session.user_id,
    users: users
  };
  let longURL;
  for (let key in urlDatabase) {
    if (templateVars.id === key) {
      longURL = urlDatabase[key].longURL;
      res.redirect(longURL);
      return;
    }
  };
  res.statusCode = 404;
  res.render("urls_notfound", templateVars);
});

app.delete("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("Please login to edit your url page.");
  }

  const id = req.params.id;

  // check if the url belongs to user
  if (urlDatabase[id].userID === req.session.user_id) {
    delete urlDatabase[id];
    res.redirect("/urls");
    return;
  }
  
  // url exists but not belong to user
  if (urlDatabase.hasOwnProperty(id)) {
    return res.status(400).send("This URL does not belong to you.");
  }

  // url does not exist
  res.statusCode = 404;
  res.send("URL does not exist.");
});

// PUT: update new longURL for tinyURL
app.put("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("Please login to edit your url page.");
    return;
  }

  const id = req.params.id;
  const newURL = req.body.newURL;

  if (urlDatabase[id].userID === req.session.user_id) {
    urlDatabase[id].longURL = newURL;
    res.redirect("/urls");
    return;
  }

  if (urlDatabase.hasOwnProperty(id)) {
    return res.status(403).send("This URL does not belong to you.");
  };

  res.statusCode = 404;
  res.send("Sorry, tiny URL not found.");
});

app.get("/login", (req, res) => {

  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    users: users
  };
  res.render("login/login", templateVars);
});

app.post("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    users: users
  };
  const userInputEmail = req.body.email;
  const userInputPassword = req.body.password;

  if (userInputEmail === '' || userInputPassword === '') {
    res.statusCode = 400;
    res.render("login/login-fail-empty", templateVars);
    return;
  };

  for (const user in users) {
    const email = users[user].email;
    const password = users[user].password;

    // Correct Email
    if (email === userInputEmail) {

      // Correct Password
      if (bcrypt.compareSync(userInputPassword, password)) {
        req.session.user_id = users[user].id;
        res.redirect("/urls");
        return;
      }

      // Wrong Password
      res.statusCode = 403;
      res.render("login/login-fail-wrongPassword", templateVars);
      return;
    }
  }

  // Wrong Email
  res.statusCode = 400;
  res.render("login/login-fail-wrongEmail", templateVars);
  return;
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {    // if logged in, redirect
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    users: users
  };
  res.render("register/register", templateVars);
});

app.post("/register", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id,
  };

  const userInputEmail = req.body.email;
  const userInputPassword = req.body.password;

  // User input empty strings

  if (userInputEmail === '' || userInputPassword === '') {
    res.statusCode = 400;
    res.render("register/register-fail-empty", templateVars);
    return;
  };

  // User input duplicate email

  if (getUserByEmail(users, userInputEmail)) {
    res.status(400).render("register/register-fail-duplicate", templateVars);
    return;
  }

  // Happy path

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: userInputEmail,
    password: bcrypt.hashSync(userInputPassword, 10)
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});