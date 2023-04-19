const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // body parser -> populates req.body
app.use(morgan());
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
    email: "a@a.com",
    password: bcrypt.hashSync("1234", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: bcrypt.hashSync("5678", 10),
  },
};

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


// index page -> redirects
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// display all urls page
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.send("Please log in to see your saved URLs.");
  }

  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    users: users,
    user_id: req.cookies.user_id
  };
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
  if (!req.cookies.user_id) {
    return res.send("Please login to edit your url page.");
  }
  const userInput = req.body.longURL;
  console.log("userinput:", userInput);
  const tinyURL = generateRandomString();
  urlDatabase[tinyURL] = {
    longURL: userInput,
    userID: req.cookies.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${tinyURL}`);
});

// GET: one url page
app.get("/urls/:id", (req, res) => {

  if (!req.cookies.user_id) {
    return res.send("Please log in to view your URL page.");
  }

  const templateVars = {
    id: req.params.id,
    user_id: req.cookies.user_id,
    users: users,
    urlPairs: urlsForUser(req.cookies.user_id)
  };
  for (const url in templateVars.urlPairs) {
    if (url === templateVars.id) {
      templateVars.longURL = templateVars.urlPairs[url];
      res.render("urls_show", templateVars);
    }
  };

  if (urlDatabase.hasOwnProperty(templateVars.id)) {
    return res.send("This URL does not belong to you.");
  }
  res.statusCode = 404;
  res.send("URL does not exist.");
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
  if (!req.cookies.user_id) {
    return res.status(403).send("Please login to edit your url page.");
  }

  const templateVars = {
    id: req.params.id,
    urlPairs: urlsForUser(req.cookies.user_id)
  };

  for (const url in templateVars.urlPairs) {
    if (url === templateVars.id) {
      delete urlDatabase[url];
      res.redirect("/urls");
    }
  };
  if (urlDatabase.hasOwnProperty(templateVars.id)) {
    return res.status(400).send("This URL does not belong to you.");
  }
  res.statusCode = 404;
  res.send("URL does not exist.");
});

// POST: update new longURL for tinyURL
app.post("/urls/:id/update", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(403).send("Please login to edit your url page.");
    return;
  }

  const templateVars = {
    newURL: req.body.newURL,
    id: req.params.id,
  };

  const urlPairs = urlsForUser(req.cookies.user_id);
  for (const url in urlPairs) {
    if (url === templateVars.id) {
      urlDatabase[templateVars.id].longURL = templateVars.newURL;
      res.redirect("/urls");
      return;
    }
  }
  res.statusCode = 404;
  res.send("Sorry, tiny URL not found.");
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

app.post("/login", (req, res) => {      // TESTED: GOOD :)
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

    if (email !== userInputEmail) {
      res.statusCode = 400;
      res.render("login/login-fail-wrongEmail", templateVars);
      return;
    }

    if (email === userInputEmail) {
      if (bcrypt.compareSync(userInputPassword, password)) {
        res.cookie("user_id", users[user].id);
        res.redirect("/urls");
        return;
      }                                         
      res.statusCode = 403;
      res.render("login/login-fail-wrongPassword", templateVars);
      return;
    }
  }


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