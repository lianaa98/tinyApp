const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const randomStr = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += randomStr[Math.floor(Math.random() * randomStr.length)];
  }
  return result;
}

app.use(express.urlencoded({ extended: true }));

// index page -> redirects
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// display all urls page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// GET: new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
    id: req.params.id
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
    id: req.params.id
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
  res.render("urls_notfound");
});

// POST: deletes url, then redirects to index
app.post("/urls/:id/delete", (req, res) => {
  const templateVars = {
    id: req.params.id
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
    id: req.params.id
  };

  urlDatabase[templateVars.id] = templateVars.newURL;
  res.redirect("/urls");

});

// POST: login by username
app.post("/login", (req, res) => {
  const templateVars ={
    username: req.body.username
  }
  res.cookie("username", templateVars.username);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});