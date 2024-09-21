const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  let { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide username and password!" });

  }
  if (username in users) {
    return res.status(409).json({ message: "The username is already taken." });
  }
  users.push({
    username: username,
    password: password
  })

  res.status(201).json({
    message: "User registered successfully.",
    user: {
      username: username
    }
  })
});

const getBooks = async () => {
  // In a real-world scenario, this function would perform an async 
  // operation like a database query.
  return books;
};

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const books = await getBooks();
    res.send(JSON.stringify(books, null, "\t"))
  } catch (error) {
    console.error("Error fetching books:", error)
    res.status(500).json({ message: 'Error fetching books' });
  }
});

async function getBookISBN(isbn) {
  return books[isbn]
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  let isbn = req.params.isbn
  let result = await getBookISBN(isbn);

  res.send(JSON.stringify(result, null, "\t"))
});

async function getBookAuthor(author) {
  let result = []
  for (let key in books) {
    if (books[key].author === author) {
      result.push(books[key])
    }
  }
  return result
}

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  let author = req.params.author
  let result = await getBookAuthor(author)
  res.send(JSON.stringify(result, null, "\t"))
});


async function getBookTitle(title) {
  let result = []
  for (let key in books) {w
    if (books[key].title === title) {
      result.push(books[key])
    }
  }
  return result;
}

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  let title = req.params.title
  let result = await getBookTitle(title)
  res.send(JSON.stringify(result, null, "\t"))
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn

  let result = books[isbn].reviews

  res.send(JSON.stringify(result, null, "\t"))
});

module.exports.general = public_users;
