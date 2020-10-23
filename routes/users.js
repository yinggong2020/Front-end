var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('../models/account');

var monk = require('monk');
var db = monk('localhost:27017/library');

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


router.get('/:username', function(req, res) {
    var collection = db.get('borrowers');
    collection.find({ username: req.params.username }, function(err, books){
        if (err) throw err;
        res.render('user', { books: books, user: req.user });
    });
});

// show wishlist information with wishlist.
router.get('/:username/wishlist', function(req, res) {
    var collection = db.get('wishlist');
    collection.find({ username: req.params.username }, function(err, books){
        if (err) throw err;
        res.render('wishlist', { books: books, user: req.user });
    });
});

// show return information with return.ejs
router.get('/:username/return/:bookid', function(req, res) {
    var collection = db.get('borrowers');
    collection.findOne({ bookid: req.params.bookid }, function(err, book){
        if (err) throw err;
        res.render('return', { book: book, user: req.user });
    });
});

// insert a book from addwish.ejs in the wishlist by POST
router.post('/:username/wishlist', function(req, res) {
    var collection = db.get('wishlist');
    collection.find({bookid: req.body.bookid}, function(err, books) {
        if (err) throw err;
        if (books.length !== 0)
            res.redirect('wishlist');
        else {
            collection.insert({
                title: req.body.title, 
                image: req.body.image, 
                bookid: req.body.bookid,
                username: req.params.username,
            }, function(err) {
                if (err) throw err;
                res.redirect('wishlist');
            });       
        }
    });
});

// borrow
router.post('/:username/borrow', function(req, res) {
    var collection = db.get('borrowers');
    collection.insert({
        title: req.body.title,
        image: req.body.image, 
        bookid: req.body.bookid,
        username: req.body.username,
        borrow_date: req.body.borrow_date,
        return_date: ""
    }, function(err) {
        if (err) throw err;
    });
    var books = db.get('books');
    books.findOneAndUpdate({ _id: req.body.bookid }, { 
        $set: { 
            quantity: 0
        }  
    }).then((updatedDoc) => {})
    res.redirect('/');
});

// return
router.put('/:username/borrow/:bookid', function(req, res) {
    var collection = db.get('borrowers');

    collection.findOneAndUpdate(
        { bookid: req.params.bookid, username: req.body.username, return_date: '' }, 
        { 
        $set: { 
            return_date: req.body.return_date
        }  
    }).then((updatedDoc) => {})
    collection.find({ bookid: req.params.bookid, username: req.body.username, return_date: ''}, function(err, book) {
        if (err) throw err;
        if (book.length === 0) {
            res.redirect('/');
        }
        else {
            var books = db.get('books');
            books.findOneAndUpdate({ _id: req.params.bookid }, { 
                $set: { 
                    quantity: 1
                }  
            }).then((updatedDoc) => {})
            res.redirect('/users/' + req.params.username)
        }
    });



});

// delete a book from wishlist by DELETE
router.delete('/:username/wishlist/:bookid', function(req, res) {
    var collection = db.get('wishlist');
    collection.remove({ bookid: req.params.bookid }, function(err) {
        if (err) throw err;
    });

    res.redirect('/users/' + req.params.username + '/wishlist')
});

module.exports = router;
