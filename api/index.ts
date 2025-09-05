/** @format */
const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('../config/database.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportSetup = require('../config/passport-setup.js');
connectDB();

app.set('view engine', 'ejs');

//bring body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'views')));
app.use(express.static(path.join(__dirname, '..', 'node_modules')));
//app.use(express.static('public'));
//app.use(express.static('uploads'));
//app.use(express.static('node_modules'));

//Session and Flash Config
app.use(
	session({
		secret: 'lorem ipsum',
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 60000 * 15 },
	})
);
app.use(flash());
//bring passport
app.use(passport.initialize());
app.use(passport.session());

//store user object

app.use((req, res, next) => {
	res.locals.user = req.user || null;
	next();
});

// Home route - HTML
app.get('/', (req, res) => {
	res.redirect('/events');
});

//bring events routes
const events = require('../routes/event-routes.js');
app.use('/events', events);

//bring user routes
const users = require('../routes/user-routes.js');
app.use('/users', users);

//listen to port
app.listen(process.env.PORT, () => {
	console.log('Listning From Port ' + process.env.PORT);
});
