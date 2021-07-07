var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require('sequelize');

/**
 * Redirect root address to main display for all books
 */

 router.get('/', async (req, res) => {
  res.redirect('/books')
});

/**
 * Main route handler that handles initial display of all books, as well as
 * all Search routes
 */

 router.get('/books', async(req, res) => {
  let search = (req.query.search);
  if (search !== undefined) {
    const books = await Book.findAll({
      where: {
        [Op.or]: [
        {title: {[Op.substring]: search}},
        {author: {[Op.substring]: search}},
        {genre: {[Op.substring]: search}},
        {year: {[Op.eq]: search}}
        ]
      }
    });
    res.render("search-results", {books, search} )
  } else {
    const books = await Book.findAll();
    res.render("index", {books, title: "Books"} )
  }
});

/**
 * Custom 500 error generator for testing purposes
 */

 router.get('/error', (req, res, next) => {
  console.log('Custom error route called');

  const err = new Error();
  err.status = 500;
  err.message = `Custom 500 error thrown`
  next(err)
});

/**
 * Render a form to create a new book in the DB
 */

router.get('/books/new', async (req, res) => {
  res.render("new-book", {title: "New Book"} )
});

/**
 * Posts a new book to the DB
 */

router.post('/books/new', async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("../books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", {book, errors: error.errors, title: "New Book"})
    } else {
      throw error;
    }
  }
});

/**
 * Render a form to update a book's fields
 */

router.get('/books/:id', async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", {book, title: "Update Book"} )
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "Looks like the book you reqested doesn't exist."
    next(err);
  }
});

/**
 * Post the updated information about a book to the DB
 */

router.post('/books/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("../books"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("update-book", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
});

/**
 * Deletes a book from the DB
 */

router.post('/books/:id/delete', async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
