/** @format */

const connectDB = require('../config/database');
const Event = require('../models/Event');

async function seed() {
	try {
		await connectDB();

		await Event.deleteMany();

		const newEvents = [];

		await Event.insertMany(newEvents);

		console.log('Database seeded successfully!');
		process.exit();
	} catch (err) {
		console.error('Error seeding database:', err);
		process.exit(1);
	}
}

seed();

// async function seed() {
// 	try {
// 		const newEvent = new Event({
// 			title: 'this is event 1',
// 			description: 'this is the best event in the world',
// 			location: 'Egypt',
// 			date: Date.now(),
// 		});

// 		await newEvent.save();

// 		console.log('record was added');
// 		process.exit();
// 	} catch (err) {
// 		console.error('Error adding record:', err);
// 		process.exit(1);
// 	}
// }

// seed();
