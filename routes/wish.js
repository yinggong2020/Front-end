var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('../models/account');

var monk = require('monk');
var db = monk('localhost:27017/library');

// check wish list with list.ejs
router.get('/wishlist', function(req, res) {
    var collection = db.get('wishlist');
    collection.find({}, function(err, books){
        if (err) throw err;
        res.render('wishlist', { books: books, user: req.user });
    });
});

// turn to confirm page
router.get('/:id', function(req, res) {
    var collection = db.get('books');
    collection.findOne({ _id: req.params.id }, function(err, book){
        if (err) throw err;
        res.render('addwish', { book: book, user: req.user });
    });
});

module.exports = router;