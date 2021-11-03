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

// cors options
const whitelist = ['https://wish.aladdinb2b.com']
const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	methods: ['GET', 'POST'],
	credentials: true
}


// middlewares
app.use(cors(corsOptions));
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

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
