const express = require('express');
const passport = require('passport');
const router = express.Router();
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

// Register route
router.get('/register', (req, res) => {
    res.render('register');
});

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Register submit
router.post('/register', (req, res) => {
    const {name, email, username, password} = req.body;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is has to be a valid email').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords have to match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        let user = new User({
            name,
            email,
            username,
            password
        });

        User.createUser(user, (err, user) => {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are register and can now log in');
        res.redirect('/users/login');
    }

});

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({username})
        .then((user) => {
            console.log(user);
            if (!user) return done(null, false, { message: 'Incorrect username'});
            User.validatePassword(user, password)
                .then((isMatch) => {
                    if (isMatch){
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect password' });
                    }
                });
        })
        .catch((err) => done(err));
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findOne({id}, done);
});


router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    (req, res) => {
        res.redirect('/')
    });

module.exports = router;