const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Please enter both username and password" });
  }
  if (isValid(username) && authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn
  let username = req.session.authorization?.username;

  if (username && isValid(username)) {
    let book = books[isbn]
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    let review = req.query.review


    if (review) {
      // This creates a new entry or overwrites depending on if that user has an entry or not
      book.reviews[username] = review
      res.send(`Review by ${username} has been added for ${book.title}. It reads: ${review}`)
    } else {
      res.status(404).json({ message: "Please enter review" })
    }
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn
  let username = req.session.authorization?.username;

  if (username && isValid(username)) {
    if (username in books[isbn].reviews) {
      delete books[isbn].reviews.username
      res.send(`Review by ${username} for ${books[isbn].title} has been deleted.`)
    } else {
      res.status(400).json({ error: "Review by this user does not exist" });
    }
  } else {
    res.status(400).json({ error: "Invalid user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
