// auth-app-server
const https = require('https');
const fs = require('fs');
var path = require('path');

const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv').config()

// .env check / logging
if (dotenv.error) {
	throw dotenv.error
}

const port = process.env.PORT;

// middlewares
app.use(cors({
	origin: 'https://wish.aladdinb2b.com',
	optionsSuccessStatus: 200
}));

app.use(express.json());

// file hosting for app : disabled
// var dir = path.join(__dirname, 'public');
// app.use(express.static(dir));

// import routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/contact.routes")(app);

// db auth and connection
const db = require("./models");
// prod
db.sequelize.sync();

require("./cron/app.cron")(app);


app.listen(port, () => {
	console.log(`APP DATA SERVER READY: listen port : ${port}`);
});

// main API route
app.get('/', async (req, res) => {
	res.json({
		status: 'ALADDIN Chrome Extension API READY!'
	});
});
