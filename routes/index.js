var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('../models/account');

var monk = require('monk');
var db = monk('localhost:27017/library');

/* GET home page. */
router.get('/', function (req, res) {
    // res.render('index', { user : req.user });
    var collection = db.get('books');
    collection.find({}, function(err, books){
        if (err) throw err;
        res.render('homepage', { books: books, user: req.user });
    });
});

router.get('/register', function(req, res) {
    res.render('register', { user: req.user, info : "" });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username, email: req.body.email }), req.body.password, function(err, account) {
        if (err) {
            res.render('register', { account : account, user: req.user, info : "Sorry, the username already exists. Try agian." });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.send("pong!", 200);
});

// json of accounts
router.get('/json', function(req, res) {
    var collection = db.get('accounts');
    collection.find({}, function(err, accounts) {
        if (err) throw err;
        res.json(accounts);
    }) 
})

// Search with search.ejs
router.get('/search', function(req, res) {
    res.render('search', { user : req.user });
});

// return searchresults with searchresult.ejs
router.get('/searchresult', function(req, res) {
    var collection = db.get('books');
    var title = req.query.title;
    var subject = req.query.subject;
    if (req.query.subject == '') {
        if (req.query.title) {
            collection.find({ $or: [{ title: {$regex: new RegExp(title)}}, {author: {$regex: new RegExp(title)} }] }, function(err, books){
                if (err) throw err;
                res.render('searchresult', { books : books, user : req.user });
            });
        }
        else {
            collection.find({}, function(err, books){
                if (err) throw err;
                res.render('searchresult', { books : books, user : req.user });
            });            
        }
    }
    if (req.query.subject != '') {
        if (!title) {
            collection.find({subject: subject}, function(err, books){
                if (err) throw err;
                res.render('searchresult', { books : books, user : req.user });
            });
        }
        else {
            collection.find({ $or: [{ title: {$regex: new RegExp(title)}}, {author: {$regex: new RegExp(title)} }], subject: subject }, function(err, books){
                if (err) throw err;
                res.render('searchresult', { books : books, user : req.user });
            });
        }
    }
});

///////////////////////////////////////////////////////////
router.get('/books', function(req, res) {
    var collection = db.get('books');
    collection.find({}, function(err, books){
        if (err) throw err;
        res.render('homepage', { books: books, user: req.user });
    });
});

// add a book with new.ejs
router.get('/books/new', function(req, res) {
    res.render('new', { user : req.user });
});

// show a book with show.ejs
router.get('/books/:id', function(req, res) {
    var collection = db.get('books');
    collection.findOne({ _id: req.params.id }, function(err, book){
        if (err) throw err;
        res.render('show', { book: book, user: req.user });
    });
});

// edit a book with edit.ejs
router.get('/books/:id/edit', function(req, res) {
    var collection = db.get('books');
    collection.findOne({ _id: req.params.id }, function(err, book){
        if (err) throw err;
        res.render('edit', { book: book, user: req.user });
    });
});

// insert a book from new.ejs by POST
router.post('/books', function(req, res) {
    var collection = db.get('books');
    collection.insert({
        title: req.body.title, 
        author: req.body.author,
        subject: req.body.subject, 
        publisher: req.body.publisher,
        publication_date: req.body.publication_date,
        isbn: req.body.isbn, 
        description: req.body.description,
        image: req.body.image,
        quantity: req.body.quantity
    }, function(err, book) {
        if (err) throw err;
        // res.json(book);
        res.redirect('/');
    });
});

// update a book with edit.ejs by PUT
router.put('/books/:id', function(req, res) {
    var collection = db.get('books');
    collection.findOneAndUpdate({ _id: req.params.id }, { 
        $set: { 
            title: req.body.title, 
            author: req.body.author,
            subject: req.body.subject, 
            publisher: req.body.publisher,
            publication_date: req.body.publication_date,
            isbn: req.body.isbn, 
            description: req.body.description,
            image: req.body.image,
            quantity: req.body.quantity
        }  
    }).then((updatedDoc) => {})
    res.redirect('/');
});

// delete a book by DELETE
router.delete('/books/:id', function(req, res) {
    var collection = db.get('books');
    collection.remove({ _id: req.params.id }, function(err, book) {
        if (err) throw err;
        res.redirect('/');
    });
});

module.exports = router;
