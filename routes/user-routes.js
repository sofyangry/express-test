/** @format */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const multer = require('multer');

//configure multer
var storage = multer.diskStorage({
	destination: function (req, file, cd) {
		cd(null, 'uploads/images');
	},
	filename: function (req, file, cd) {
		cd(null, file.filename + '-' + Date.now() + '.png');
	},
});
const upload = multer({ storage: storage });

//middleware to check if user is logged in

isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	res.redirect('/users/login');
};

//  login user view
router.get('/login', (req, res) => {
	res.render('user/login', {
		error: req.flash('error'),
	});
});

// login post request
router.post(
	'/login',
	passport.authenticate('local.login', {
		successRedirect: '/users/profile',
		failureRedirect: '/users/login',
		failureFlash: true,
	})
);

// sign up form
router.get('/signup', (req, res) => {
	res.render('user/signup', {
		error: req.flash('error'),
	});
});

// sign up post request

router.post(
	'/signup',
	passport.authenticate('local.signup', {
		successRedirect: '/users/profile',
		failureRedirect: '/users/signup',
		failureFlash: true,
	})
);

// progile
router.get('/profile', isAuthenticated, (req, res) => {
	res.render('user/profile', {
		success: req.flash('success'),
	});
});

//upload user avatar
router.post('/uploadAvatar', upload.single('avatar'), async (req, res) => {
	try {
		let newFields = {
			avatar: req.file.filename,
		};

		await User.updateOne({ _id: req.user._id }, newFields);

		res.redirect('/users/profile');
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
});

// logout user
router.get('/logout', (req, res) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect('/users/login');
	});
});

module.exports = router;
