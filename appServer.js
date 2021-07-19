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

var allowedOrigins = [
	'http://192.168.59.128:8080',
	'http://localhost:8080',
	'https://wish.aladdinb2b.com'
];

// middlewares
app.use(cors({
	origin: function(origin, callback){
		if(!origin) return callback(null, true);

		if(allowedOrigins.indexOf(origin) === -1){	 
		  let msg = 'The CORS policy for this site does not allow access from the specified Origin.';	 
		  return callback(new Error(msg), false);	 
		}	 
		return callback(null, true);	 
	  }
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
		status: 'ALADDINB2B-CX API READY!'
	});
});
