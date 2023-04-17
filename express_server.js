const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// index page
app.get("/", (req, res) => {
  const mascots = [
    { name: "Sammy", birth_year: 2012 },
    { name: "Tux", birth_year: 2009 },
    { name: "Moby Duck", birth_year: 1998 },
  ]
  const tagline = "Example Tagline";
  res.render("pages/index", {
    mascots: mascots,
    tagline: tagline
  });
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}...`);
})