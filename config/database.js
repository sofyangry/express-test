/** @format */

const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
	try {
		/*		
		await mongoose.connect(
			'mongodb+srv://sofyan:sofyan.Moud@event-pro.ywpyn5w.mongodb.net/'
		);*/
		await mongoose.connect(process.env.DB_URI);
		console.log('Database Connected');
	} catch (err) {
		console.error('Database Connection Error:', err);
		process.exit(1);
	}
}

module.exports = connectDB;
