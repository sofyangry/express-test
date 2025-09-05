/** @format */

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const { Strategy } = require('passport-local');

// saving user object in the session

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err, null);
	}
});

//signup user
passport.use(
	'local.signup',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async (req, username, password, done) => {
			try {
				if (req.body.password != req.body.confirm_password) {
					return done(
						null,
						false,
						req.flash('error', 'Passwords do not match')
					);
				}

				const user = await User.findOne({ email: username });

				if (user) {
					return done(null, false, req.flash('error', 'Email already used'));
				}

				// create user
				let newUser = new User();
				newUser.email = req.body.email;
				newUser.password = newUser.hashPassword(req.body.password);
				newUser.avatar = 'profile.png';

				const savedUser = await newUser.save();
				return done(null, savedUser, req.flash('success', 'User Added'));
			} catch (err) {
				return done(err);
			}
		}
	)
);

// login user

passport.use(
	'local.login',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async (req, username, password, done) => {
			try {
				// find user
				const user = await User.findOne({ email: username });

				if (!user) {
					return done(null, false, req.flash('error', 'User was not found'));
				}

				if (user.comparePasswords(password, user.password)) {
					return done(null, user, req.flash('success', 'Welcome back'));
				} else {
					return done(null, false, req.flash('error', 'Password is wrong'));
				}
			} catch (err) {
				return done(null, false, req.flash('error', 'Some thing is wrong'));
			}
		}
	)
);
