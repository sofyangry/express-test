/** @format */

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { check, validationResult } = require('express-validator');
const moment = require('moment');
moment().format();

//middleware to check if user is logged in

isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	res.redirect('/users/login');
};

//Creat New Event
router.get('/create', isAuthenticated, (req, res) => {
	res.render('event/create', {
		errors: req.flash('errors'),
	});
});

// route to home event
router.get('/:pageNo?', async (req, res) => {
	let pageNo = 1;

	if (req.params.pageNo) {
		pageNo = parseInt(req.params.pageNo);
	}
	if (req.params.pageNo == 0) {
		pageNo = 1;
	}

	let q = {
		skip: 5 * (pageNo - 1),
		limit: 5,
	};

	// find total
	let totalDocs = 0;

	try {
		totalDocs = await Event.countDocuments({});
		const events = await Event.find({}, {}, q);

		let chunk = [];
		let chunkSize = 3;
		for (let i = 0; i < events.length; i += chunkSize) {
			chunk.push(events.slice(i, chunkSize + i));
		}

		res.render('event/index', {
			chunk: chunk,
			message: req.flash('info'),
			total: parseInt(totalDocs),
			pageNo: pageNo,
		});
	} catch (err) {
		res.status(500).send(err);
	}
});

//Save Event To db
router.post(
	'/create',
	[
		check('title')
			.isLength({ min: 5 })
			.withMessage('Title Should Be More Than 5 Char'),
		check('description')
			.isLength({ min: 5 })
			.withMessage('Description Should Be More Than 5 Char'),
		check('location')
			.isLength({ min: 3 })
			.withMessage('Location Should Be More Than 3 Char'),
		check('date').isLength({ min: 5 }).withMessage('Date Should Valid Date'),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			req.flash('errors', errors.array());
			res.redirect('/events/create');
		} else {
			try {
				let newEvent = new Event({
					title: req.body.title,
					description: req.body.description,
					date: req.body.date,
					location: req.body.location,
					user_id: req.user.id,
					created_at: Date.now(),
				});

				await newEvent.save();
				console.log('Event Was Added');
				req.flash('info', 'The Event Was Created');
				return res.redirect('/events');
			} catch (err) {
				console.error('Error saving event:', err);
				return res.status(500).send('Internal Server Error');
			}
		}
	}
);

// show single event
router.get('/show/:id', async (req, res) => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) {
			return res.status(404).send('Event not found');
		}
		res.render('event/show', { event });
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
});
//edit route
router.get('/edit/:id', isAuthenticated, async (req, res) => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) {
			return res.status(404).send('Event not found');
		}
		res.render('event/edit', {
			event,
			eventDate: moment(event.date).format('YYYY-MM-DD'),
			errors: req.flash('errors'),
			message: req.flash('info'),
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
});
//update the form
router.post(
	'/update',
	[
		check('title')
			.isLength({ min: 5 })
			.withMessage('Title Should Be More Than 5 Char'),
		check('description')
			.isLength({ min: 5 })
			.withMessage('Description Should Be More Than 5 Char'),
		check('location')
			.isLength({ min: 3 })
			.withMessage('Location Should Be More Than 3 Char'),
		check('date').isLength({ min: 5 }).withMessage('Date Should Valid Date'),
	],
	isAuthenticated,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			req.flash('errors', errors.array());
			res.redirect('/events/edit/' + req.body.id);
		} else {
			try {
				let newFields = {
					title: req.body.title,
					description: req.body.description,
					location: req.body.location,
					date: req.body.date,
				};
				let query = { _id: req.body.id };
				await Event.updateOne(query, newFields);

				req.flash('info', 'The Event Was Updated');
				res.redirect('/events/edit/' + req.body.id);
			} catch (err) {
				console.error(err);
				res.status(500).send('Server Error');
			}
		}
	}
);

//delete event
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
	try {
		const result = await Event.deleteOne({ _id: req.params.id });

		if (result.deletedCount === 0) {
			return res.status(404).json('Event not found');
		}

		res.status(200).json('Deleted');
	} catch (error) {
		console.error(error);
		res.status(500).json('There was an error, event was not deleted');
	}
});

module.exports = router;
