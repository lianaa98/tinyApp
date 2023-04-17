const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// index page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  console.log(req.params);
  res.render("urls_index", templateVars);
});

// display all urls page
app.get("/urls/", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// display one url page
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}...`);
});